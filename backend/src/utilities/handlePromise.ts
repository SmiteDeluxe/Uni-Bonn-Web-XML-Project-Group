// Bearbeitet von ***

/**
 * @description
 * Returns `[data, err]` when used with `await`
 * - Example response: `[data, undefined]`
 * - Example response: `[undefined, Error]`
 *
 * When used with `Promise.all([req1, req2, req3])`
 * - Example response: `[[data1, data2, data3], undefined]`
 * - Example response: `[undefined, Error]`
 *
 * When used with `Promise.race([req1, req2, req3])`
 * - Example response: `[data, undefined]`
 * - Example response: `[undefined, Error]`
 *
 * @param promise - A {@link Promise}
 * @returns `[data, undefined]` when the promises resolves succesfully, otherwise `[undefined, Error]`
 */
export async function handle<T>(
  promise: Promise<T>
): Promise<[T, undefined] | [undefined, unknown]> {
  try {
    const data = await promise;
    return [data, undefined];
  } catch (err) {
    return [undefined, err];
  }
}
