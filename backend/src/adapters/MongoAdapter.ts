//bearbeitet von ***
import { Schema, model, connect } from 'mongoose';
import { DeviceCreate } from '../models/api/DeviceModels';
import DeviceConfig from '../models/config/DeviceConfig';
import Device from '../models/internal/Device';
import Logger from '../utilities/Logger';
import IStorageAdapter from './interfaces/IStorageAdapter';
import TemplateAdapter from './TemplateAdapter';
import TemplateConfig from '../models/config/TemplateConfig';
import { fillAllTemplatePlaceholderStrings } from '../utilities/fillAllTemplatePlaceholderStrings';
import { ConfigCategory } from '../models/internal/ConfigCategory';
import { ConfigType } from '../models/internal/ConfigType';
import config from '../config';

export default class MongoAdapter<C extends ConfigCategory>
  implements IStorageAdapter<ConfigType<C>>
{
  schema: Schema;
  Model: any;
  type: string;
  private templateAdapter: TemplateAdapter = new TemplateAdapter();
  constructor(schema: Schema, type: string) {
    this.type = type;
    this.schema = schema;
    this.Model = model(type, this.schema);
    this.connect();
  }

  async connect(): Promise<void> {
    await connect(config.mongoPath);
  }

  async create(
    object: ConfigType<C> extends Device
      ? DeviceCreate
      : Omit<ConfigType<C>, 'id'>
  ): Promise<string> {
    const entry = new this.Model(object);
    await entry.save();
    return entry;
  }

  async read(id: string): Promise<ConfigType<C>> {
    if (this.type == 'device') {
      let array = [];
      array.push(await this.Model.findById(id));

      let returnObj = await this.merge(
        this.convertMongoObjectsToJSONObjects(array)
      );
      return returnObj[0] as ConfigType<C>;
    } else {
      return (await this.Model.findById(id)) as ConfigType<C>;
    }
  }

  async readAll(): Promise<ConfigType<C>[]> {
    if (this.type == 'device') {
      return (await this.merge(
        this.convertMongoObjectsToJSONObjects(await this.Model.find({}))
      )) as ConfigType<C>[];
    } else if (this.type == 'automation') {
      return this.convertMongoObjectsToJSONObjects(
        await this.Model.find({})
      ) as ConfigType<C>[];
    }
    return (await this.Model.find({})) as ConfigType<C>[];
  }

  async update(
    identy: string,
    object: ConfigType<C> extends Device
      ? DeviceCreate
      : Omit<ConfigType<C>, 'id'>
  ): Promise<void> {
    await this.Model.findByIdAndUpdate(identy, object);
  }

  async delete(id: string): Promise<void> {
    await this.Model.deleteMany({ _id: id });
  }

  // merges template properties into device
  private async merge(devices: DeviceConfig[]) {
    const templates = await this.templateAdapter.readAll();
    const mergedDevices = [];
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
          }" is uavailable.`
        );
      } else {
        const mergedDevice = this.mergeDeviceAndTemplate(
          device as DeviceConfig,
          template
        );
        mergedDevices.push(mergedDevice);
      }
    }
    return mergedDevices;
  }

  // adds id property to mongoObjects.
  private convertMongoObjectsToJSONObjects(objs: any) {
    let newObjs = [];
    for (let obj of objs) {
      obj = obj.toObject();
      obj['id'] = obj['_id'];
      newObjs.push(obj);
    }
    return newObjs;
  }

  // concret operation of the merge between device and template
  private mergeDeviceAndTemplate(
    device: DeviceConfig,
    template: TemplateConfig
  ) {
    const filledTemplate = fillAllTemplatePlaceholderStrings(
      template,
      device.placeholders
    );
    const mergedDevice = {
      ...device,
      template: filledTemplate,
    };
    return mergedDevice;
  }
}
