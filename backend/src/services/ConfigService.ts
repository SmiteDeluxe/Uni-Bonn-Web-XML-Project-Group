// Bearbeitet von *** & ***
import IStorageAdapter from '../adapters/interfaces/IStorageAdapter';
import TemplateAdapter from '../adapters/TemplateAdapter';
import BroadcastController from '../controllers/BroadcastController';
import { AutomationCreateObj } from '../models/api/AutomationModels';
import { DeviceCreate, DeviceUpdate } from '../models/api/DeviceModels';
import AutomationConfig from '../models/config/AutomationConfig';
import GroupConfig from '../models/config/GroupConfig';
import TemplateConfig from '../models/config/TemplateConfig';
import UserConfig from '../models/config/UserConfig';
import ConfigMerged from '../models/internal/ConfigMerged';
import Device from '../models/internal/Device';
import User from '../models/internal/User';
import Topics from '../topics/Topics';
import { GenericEmitter } from '../utilities';
import StateCacheService from './StateCacheService';
import StatsService from './StatsService';

export default class ConfigService extends GenericEmitter<{
  updatedDeviceConfig: Device[];
  updatedGroupConfig: GroupConfig[];
  updatedUserConfig: User[];
  updatedAutomationConfig: AutomationConfig[];
  updatedConfig: ConfigMerged;
}> {
  private stateCacheService: StateCacheService;
  constructor(
    private deviceAdapter: IStorageAdapter<Device>,
    private groupAdapter: IStorageAdapter<GroupConfig>,
    private userAdapter: IStorageAdapter<User>,
    private automationAdapter: IStorageAdapter<AutomationConfig>,
    private templateAdapter: TemplateAdapter,
    private broadcastController: BroadcastController,
    private statsService: StatsService
  ) {
    super();
    this.stateCacheService = StateCacheService.getInstance(
      statsService,
      broadcastController
    );
  }

  public async getDevice(id: string): Promise<Device> {
    return await this.deviceAdapter.read(id);
  }

  public async getGroup(id: string): Promise<GroupConfig> {
    return (await this.groupAdapter.read(id)) as GroupConfig;
  }

  public async getAutomation(automationId: string): Promise<AutomationConfig> {
    return (await this.automationAdapter.read(
      automationId
    )) as AutomationConfig;
  }

  public async getRestrictionsOfUser(userId: string): Promise<{
    deviceRestrictions: string[]; // Device IDs
    groupRestrictions: string[]; // Group IDs
  }> {
    const user = (await this.userAdapter.read(userId)) as UserConfig;
    return {
      deviceRestrictions: user.deviceRestrictions as string[],
      groupRestrictions: user.groupRestrictions as string[],
    };
  }

  public async getAllDevices(): Promise<Device[]> {
    return await this.deviceAdapter.readAll();
  }

  public async getAllGroups(): Promise<GroupConfig[] | any> {
    return await this.groupAdapter.readAll();
  }

  public async getAllUsers(): Promise<User[] | any> {
    return await this.userAdapter.readAll();
  }

  public async getAllAutomations(): Promise<AutomationConfig[] | any> {
    return await this.automationAdapter.readAll();
  }

  public async getAllTemplates(): Promise<Array<TemplateConfig>> {
    const templates = await this.templateAdapter.readAll();
    return templates;
  }

  public async createDevice(device: DeviceCreate): Promise<string | void> {
    const id = await this.deviceAdapter.create(device);
    await this.publishDevicesToBroadcast();
    this.emit('updatedDeviceConfig', await this.getAllDevices());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
    return id;
  }

  public async createGroup(object: GroupConfig): Promise<void> {
    await this.groupAdapter.create(object);
    this.emit('updatedGroupConfig', await this.getAllGroups());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
    await this.publishGroupToBroadcast();
  }

  public async createAutomation(
    automation: AutomationCreateObj
  ): Promise<void> {
    await this.automationAdapter.create(automation);
    this.emit('updatedAutomationConfig', await this.getAllAutomations());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
    await this.publishAutomationsToBroadcast();
  }

  public async updateDevice(id: string, device: DeviceUpdate): Promise<void> {
    await this.deviceAdapter.update(id, device);
    await this.publishDevicesToBroadcast();
    this.emit('updatedDeviceConfig', await this.getAllDevices());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
  }

  public async updateGroup(id: string, object: GroupConfig): Promise<void> {
    await this.groupAdapter.update(id, object);
    await this.publishGroupToBroadcast();
    this.emit('updatedGroupConfig', await this.getAllGroups());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
  }

  public async updateAutomation(
    automationId: string,
    automation: AutomationConfig
  ): Promise<void> {
    await this.automationAdapter.update(automationId, automation);
    await this.publishAutomationsToBroadcast();

    this.emit('updatedAutomationConfig', await this.getAllAutomations());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
  }

  public async deleteDevice(id: string): Promise<void | boolean> {
    const automations = await this.getAllAutomations();
    for (const automation of automations) {
      for (const action of automation.actions) {
        for (const state of action.states) {
          if (state.deviceId == id) {
            return false;
          }
        }
      }
    }
    await this.deviceAdapter.delete(id);
    await this.publishDevicesToBroadcast();
    this.stateCacheService.deleteState(id);
    this.emit('updatedDeviceConfig', await this.getAllDevices());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
  }

  public async deleteGroup(id: string): Promise<void> {
    await this.groupAdapter.delete(id);
    await this.publishGroupToBroadcast();
    this.emit('updatedGroupConfig', await this.getAllGroups());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
  }

  public async deleteAutomation(automationId: string): Promise<void> {
    await this.automationAdapter.delete(automationId);
    await this.publishAutomationsToBroadcast();
    this.emit('updatedAutomationConfig', await this.getAllAutomations());
    this.emit('updatedConfig', {
      devices: await this.getAllDevices(),
      automations: await this.getAllAutomations(),
      users: await this.getAllUsers(),
      groups: await this.getAllGroups(),
    });
  }

  async getAllGroupDevices(groupID: string): Promise<Device[]> {
    const devices = await this.deviceAdapter.readAll();
    return devices.filter((device) => device.groups.includes(groupID));
  }

  async publishDevicesToBroadcast() {
    this.broadcastController.publishToBroadcast(
      Topics.devices.broadcast,
      await this.deviceAdapter.readAll(),
      'device'
    );
  }

  async publishGroupToBroadcast() {
    this.broadcastController.publishToBroadcast(
      Topics.groups.broadcast,
      await this.getAllGroups(),
      'group'
    );
  }

  async publishAutomationsToBroadcast() {
    this.broadcastController.publishToBroadcast(
      Topics.automations.broadcast,
      await this.getAllAutomations(),
      'automations'
    );
  }
}
