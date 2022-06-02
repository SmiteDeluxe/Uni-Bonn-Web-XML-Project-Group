//bearbeitet von ***

export default interface IStorageAdapter {
  read(entries: number): Promise<string>;
  update(deviceId: string, object: object): Promise<void>;
  readByDay(day: string): Promise<string[] | void>;
  readByTimeIntervall(day: string, start: string, end: string): Promise<string>;
}
