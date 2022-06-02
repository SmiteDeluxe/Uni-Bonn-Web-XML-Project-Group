//bearbeitet von ***
import BroadcastController from '../controllers/BroadcastController';
import Topics from '../topics/Topics';
import StatsService from './StatsService';
import { fill } from '../utilities/topicTools';
export default class StateCacheService {
  private static _instance: StateCacheService;
  private state: { [k: string]: string } = {};

  private constructor(
    private statsService: StatsService,
    private broadcastController: BroadcastController
  ) {}

  public getState(): { [k: string]: string } {
    return this.state;
  }

  public getDeviceState(id: string): any {
    return this.state[id];
  }

  async addState(deviceID: string, states: any) {
    this.state[deviceID] = states;
  }

  public deleteState(deviceID: string) {
    delete this.state[deviceID];
  }

  async updateState(deviceId: string, state: any): Promise<void> {
    //if no state is given for the device create one
    if (!this.state.hasOwnProperty(deviceId)) {
      this.addState(deviceId, state.states);
      state.states.forEach(async (stateValue: string) => {
        this.statsService.saveStats(deviceId, stateValue);
      });
      this.broadcastController.publishToBroadcast(
        fill(Topics.statemanagement.broadcast, { deviceId: deviceId }),
        state,
        'state'
      );
      return;
    }

    let deviceStates = this.getDeviceState(deviceId);
    state.states.forEach((state: any) => {
      deviceStates.forEach((deviceState: any) => {
        //if state has hanged -> update state and save the changes to the stats
        if (
          state['inputId'] === deviceState['inputId'] &&
          state['value'] !== deviceState['value']
        ) {
          deviceState['value'] = state['value'];
          this.statsService.saveStats(deviceId, state);
        }
      });
    });

    // new states gets pushed to the statecache for the given device
    state.states.forEach((state: any) => {
      let pushState = true;
      deviceStates.forEach((deviceState: any) => {
        if (state['inputId'] === deviceState['inputId']) {
          pushState = false;
        }
      });
      if (pushState) {
        deviceStates.push(state);
        this.statsService.saveStats(deviceId, state);
      }
    });
    this.addState(deviceId, deviceStates);

    //publish new states to broadcast
    this.broadcastController.publishToBroadcast(
      fill(Topics.statemanagement.broadcast, { deviceId: deviceId }),
      { states: deviceStates },
      'state'
    );
  }

  public static getInstance(
    statsService: StatsService,
    broadcastController: BroadcastController
  ): StateCacheService {
    return (
      this._instance ||
      (this._instance = new this(statsService, broadcastController))
    );
  }
}
