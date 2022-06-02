//bearbeitet von ***

export default interface ILogAdapter {
  readFileNames(): Promise<string[]>;
  getLog(logId: string): Promise<string>;
}
