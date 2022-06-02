// Bearbeitet von ***

export default function promiseData<T>(data: T): Promise<T> {
  return new Promise((resolve) => resolve(data));
}
