// Bearbeitet von ***

export class ConfigWriteQueue {
  private static items: Array<() => Promise<void>> = [];
  private static running = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static enqueue(item: () => Promise<void>) {
    this.items.push(item);
    if (!this.running) {
      this.start();
    }
  }

  public static dequeue() {
    return this.items.shift();
  }

  static get size() {
    return this.items.length;
  }

  private static async start() {
    this.running = true;
    while (this.size > 0) {
      const action = this.dequeue() as () => Promise<void>;
      await action();
    }
    this.running = false;
  }
}
