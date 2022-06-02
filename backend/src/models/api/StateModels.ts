export interface InputState {
  inputId: string;
  value: string | number;
}

export interface DeviceState {
  states: InputState[];
}
