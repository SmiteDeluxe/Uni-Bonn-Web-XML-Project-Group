// Bearbeitet von ***

interface InputState {
  inputId: string;
  value: string;
}

interface DeviceState {
  deviceId: string;
  states: InputState[];
}

export enum ActionType {
  DEVICE_STATE = 'deviceState',
  MQTT_MESSAGE = 'mqttMessage',
}

export interface AutomationBaseAction {
  name: string;
  id: string;
  type: ActionType;
  schedule: string;
  priority?: number;
}

export interface DeviceStateAction extends AutomationBaseAction {
  type: ActionType.DEVICE_STATE;
  states: DeviceState[];
}

export interface MqttMessageAction extends AutomationBaseAction {
  type: ActionType.MQTT_MESSAGE;
  topic: string;
  payload: string;
}

export type AutomationAction = DeviceStateAction | MqttMessageAction;

export default interface AutomationConfig {
  name: string;
  id: string;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  actions: AutomationAction[];
}
