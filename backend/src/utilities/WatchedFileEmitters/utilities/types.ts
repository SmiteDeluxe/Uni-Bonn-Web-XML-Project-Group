// Bearbeitet von ***

/**
 * Contains the value and a refernce to the immediate
 * parent object of the found key
 */
export interface KeySearchResult<T> {
  /**
   * Reference to the immediate parent object the key was found in
   */
  sourceObj: any;

  /**
   * Value of the found key
   */
  value: T;
}

/**
 * Helper type to specify a provider which resolves a reference
 * (Path/URL) to a Javascript object
 */
export type referenceResolver = (source: string) => Promise<any>;
