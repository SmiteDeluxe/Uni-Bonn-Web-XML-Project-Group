// Bearbeitet von ***
import { KeySearchResult } from './types';

/**
 * Recursively search search for the `searchKey` in an object
 *
 * @param sourceObj - Object to recursively search for key `searchKey`
 * @param searchKey - Key to recursively search for in the object `obj`
 * @param results - A {@link KeySearchResult} to safe the results in
 *
 * @returns The passed ´results´ {@link KeySearchResult} array. Each result contains a reference
 * to the object where `searchKey` was found as well as the value of `searchKey`.
 */
export async function recursiveKeySearch<T>(
  sourceObj: { [key: string]: any },
  searchKey: string,
  results: KeySearchResult<T>[] = []
): Promise<KeySearchResult<T>[]> {
  Object.keys(sourceObj).forEach((key) => {
    const value = sourceObj[key];
    if (key === searchKey) {
      results.push({ sourceObj, value });
    }
    if (typeof value === 'object') {
      recursiveKeySearch(value, searchKey, results);
    }
  });
  return results;
}
