//bearbeitet von ***
import IStatsAdapter from '../adapters/interfaces/IStatsAdapter';
export default class StatsService {
  private statsAdapter: IStatsAdapter;
  constructor(statsAdapter: IStatsAdapter) {
    this.statsAdapter = statsAdapter;
  }

  public saveStats(deviceId: string, object: any) {
    this.statsAdapter.update(deviceId, object);
  }

  async getStats(numberEntries: number): Promise<string> {
    return this.statsAdapter.read(numberEntries);
  }

  async readByDay(day: string): Promise<string | void> {
    const stats = await this.statsAdapter.readByDay(day);
    if (stats == null) {
      return '';
    } else {
      return stats.join('\n');
    }
  }

  async readByInterval(
    day: string,
    start: string,
    end: string
  ): Promise<string> {
    return this.statsAdapter.readByTimeIntervall(day, start, end);
  }
}
