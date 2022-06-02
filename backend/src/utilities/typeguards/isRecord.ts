export function isRecord<K extends string | number, V>(
  record: any,
  k: K extends string ? 'string' : 'number',
  v: (value: any) => value is V
): record is Record<K, V> {
  if (!(record instanceof Object)) return false;
  for (const [key, value] of Object.entries(record)) {
    if (!(typeof key === k)) return false;
    if (!v(value)) return false;
    break;
  }
  return true;
}
