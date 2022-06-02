// Bearbeitet von ***
import IStorageAdapter from './interfaces/IStorageAdapter';
import { writeFile } from 'fs/promises';
import YAML from 'yaml';
import { randomUUID } from 'crypto';
import Logger from '../utilities/Logger';
import config from '../config';
import { ValidationError } from '../utilities/validation/Validator';
import ConfigContent from '../models/config/ConfigContent';
import Device from '../models/internal/Device';
import DeviceConfig from '../models/config/DeviceConfig';
import { handle } from '../utilities';
import { ConfigWriteQueue } from '../utilities/ConfigWriteQueue';
import { clone } from '../utilities/clone';
import TemplateAdapter from './TemplateAdapter';
import mergeDeviceAndTemplate from '../utilities/mergeDeviceAndTemplate';
import { DeviceCreate, DeviceUpdate } from '../models/api/DeviceModels';
import { ConfigCategory } from '../models/internal/ConfigCategory';
import { ConfigType } from '../models/internal/ConfigType';
import ConfigMerged from '../models/internal/ConfigMerged';
import { ConfigValidator } from '../utilities/validation/ConfigValidator';
import promiseData from '../utilities/promiseData';
import { watchedConfigEmitter } from '../utilities/WatchedFileEmitters/WatchedConfigEmitter';
import { AutomationCreateObj } from '../models/api/AutomationModels';
import Automation from '../models/internal/Automation';

export default class YamlAdapter<C extends ConfigCategory>
  implements IStorageAdapter<ConfigType<C>>
{
  // Dependencies
  private emitter = watchedConfigEmitter;
  private writeQueue = ConfigWriteQueue;
  private templateAdapter = new TemplateAdapter();

  // Data
  protected config: Promise<ConfigType<C>[]>;

  // Configuration
  private configFile: string = config.configFile ?? './config/config.yaml';
  private reloadConfig: boolean = config.reloadConfigFileOnChange ?? false;

  constructor(private category: C) {
    this.config = this.prepareConfig(this.emitter.getConfig());
    this.emitter.on('error', (e) => this.handleError(e));
    if (this.reloadConfig) {
      this.emitter.on('updatedData', (c) => {
        this.config = this.prepareConfig(promiseData(c));
      });
    }
  }

  private async prepareConfig(newConfigPromise: Promise<ConfigContent>) {
    const newConfig = await newConfigPromise;
    const mergedDevices = await this.merge(
      ...(newConfig[ConfigCategory.DEVICES] ?? [])
    );
    const mergedConfig: ConfigMerged = { ...newConfig, devices: mergedDevices };
    const validatedConfig = await ConfigValidator.validate(mergedConfig);
    const config = validatedConfig[this.category];
    if (config === undefined) {
      Logger.warn(`No ${this.category} defined in config "${this.configFile}"`);
      return [];
    }
    Logger.info(
      `YamlAdapter finished loading new ${this.category} configuration from "${this.configFile}"`
    );
    return config as ConfigType<C>[];
  }

  private async merge(...devices: DeviceConfig[]) {
    const templates = await this.templateAdapter.readAll();
    const mergedDevices: Device[] = [];
    for (const device of devices) {
      const template = templates.find(
        (t) => t.id === (device as DeviceConfig).template
      );
      if (template === undefined) {
        Logger.error(
          `Device "${
            (device as DeviceConfig).id
          } won't be loaded because assigned template "${
            (device as DeviceConfig).template
          }" is unavailable.`
        );
      } else {
        const mergedDevice = mergeDeviceAndTemplate(
          device as DeviceConfig,
          template
        );
        mergedDevices.push(mergedDevice);
      }
    }
    return mergedDevices;
  }

  private handleError(e: Error | ValidationError) {
    if (e instanceof ValidationError) {
      const message = `Unable to load config from "${this.configFile}" because validation failed.`;
      Logger.error(message);
    } else {
      const message = `An error occured during (re)loading the config from "${this.configFile}"`;
      Logger.error(message);
    }
  }

  private save(config: ConfigType<C>[]) {
    this.writeQueue.enqueue(async () => {
      const [entireConfig, readErr] = await handle(this.emitter.getConfig());
      if (!entireConfig || readErr) return;
      if (this.category === ConfigCategory.DEVICES) {
        const unmergedDevices = config.map((d) => {
          return { ...d, template: (d as Device).template.id };
        });
        entireConfig[ConfigCategory.DEVICES] = unmergedDevices as any;
      } else {
        entireConfig[this.category] = config as any;
      }
      const [, writeErr] = await handle(
        writeFile(this.configFile, YAML.stringify(entireConfig))
      );
      if (writeErr) {
        const message = `Error saving config in file: ${
          (writeErr as Error).message ?? writeErr
        }`;
        Logger.error(message);
        throw new Error(message);
      }
    });
  }

  async create(
    obj: ConfigType<C> extends Device ? DeviceCreate : ConfigType<C>
  ): Promise<string> {
    const id = this.createId();
    const config = await this.config;
    if (this.category === ConfigCategory.DEVICES) {
      const [merged] = await this.merge(obj as DeviceCreate);
      config.push({
        ...(merged as ConfigType<C>),
        id: id,
      });
    } else {
      // Assign id to each automation action if new object is automation
      if (this.category === ConfigCategory.AUTOMATIONS) {
        for (const action of (obj as AutomationCreateObj).actions) {
          action.id = this.createId();
        }
      }
      config.push({
        ...(obj as ConfigType<C>),
        id: id,
      });
    }
    this.config = promiseData(config);
    this.save(clone(config));
    return id;
  }

  async read(id: string): Promise<ConfigType<C>> {
    const config = await this.config;
    return config[await this.findIndex(id, 'reading')] as ConfigType<C>;
  }

  async readAll(): Promise<ConfigType<C>[]> {
    return await this.config;
  }

  async update(
    id: string,
    obj: ConfigType<C> extends Device ? DeviceUpdate : ConfigType<C>
  ): Promise<void> {
    const config = await this.config;
    const updated = {
      ...obj,
      id: id,
    };
    if (this.category === ConfigCategory.DEVICES) {
      const template = await this.templateAdapter.read(
        (updated as unknown as DeviceUpdate).template
      );
      config[await this.findIndex(id, 'updating')] = mergeDeviceAndTemplate(
        updated as unknown as DeviceUpdate,
        template
      ) as ConfigType<C>;
    } else {
      // Assign id to each automation action if new object is automation
      if (this.category === ConfigCategory.AUTOMATIONS) {
        for (const action of (updated as any).actions) {
          action.id = action.id || this.createId();
        }
      }
      config[await this.findIndex(id, 'updating')] = updated as ConfigType<C>;
    }
    this.config = promiseData(config);
    this.save(clone(config));
  }

  async delete(id: string): Promise<void> {
    const config = await this.config;
    const index = await this.findIndex(id, 'deleting');
    config.splice(index, 1);
    this.config = promiseData(config);
    this.save(clone(config));
  }

  public createId(): string {
    return randomUUID();
  }

  private async findIndex(id: string, action: string) {
    const config = await this.config;
    const index = config.findIndex((obj) => obj.id == id);
    if (index === -1) {
      const cType = this.category.slice(0, -1);
      const message = `Error ${action} ${cType} - no ${cType} with id "${id}" configured`;
      throw new Error(message);
    }
    return index;
  }
}
