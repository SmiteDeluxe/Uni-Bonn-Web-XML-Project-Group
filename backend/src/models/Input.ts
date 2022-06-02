//bearbeitet von ***
import State from "./State";

export default interface Input {
  id: string,
  name: string,
  type: 'scale' | 'discrete',
  range?: {
    min: number,
    max: number,
    stepsize: number
  },
  states?: State[],
}