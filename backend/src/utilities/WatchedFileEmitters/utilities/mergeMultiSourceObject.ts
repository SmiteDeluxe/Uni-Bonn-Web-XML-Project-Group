// Bearbeitet von ***
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import { handle } from '../..';
import { recursiveKeySearch } from './recursiveKeySearch';
import { referenceResolver } from './types';

/**
 *  Helper function to merge arrays when merging objects using Lodash´s {@link mergeWith}.
 * @param objValue - Original value in the object that `srcValue` get´s merged into
 * @param srcValue - Value in the source object which get´s merged with `objValue`
 *
 * @returns Merge of `objValue` and `srcValue`
 */
function customizer(objValue: any, srcValue: any) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

/**
 * Parse an Javascript object spread over multiple sources by resolving references
 * and merging their contents.
 * @param source - Source of an object which contains (possibly nested) references
 * @param referenceKey - Key that indicates references to other sources
 * @param resolver - Returns a JavaScript object by resolving a reference
 * @param removeReference - Controls wether the reference is removed from the result
 *
 * @returns A Javascript object
 */
export async function mergeMultiSourceObject(
  source: string,
  referenceKey: string,
  resolver: referenceResolver,
  removeReference = true
) {
  const [result, resolveSourceErr] = await handle(resolver(source));
  if (resolveSourceErr || !result) {
    throw resolveSourceErr;
  }
  let remainingReferences = await recursiveKeySearch<string>(
    result,
    referenceKey
  );
  const resolvedReferences: string[] = [];
  while (remainingReferences.length > 0) {
    for (const reference of remainingReferences) {
      const [referencedObj, resolveReferenceErr] = await handle(
        resolver(reference.value)
      );
      if (resolveReferenceErr || !referencedObj) {
        throw resolveReferenceErr;
      }
      mergeWith(reference.sourceObj, referencedObj, customizer);
      resolvedReferences.push(reference.value);
      if (removeReference) {
        delete reference.sourceObj[referenceKey];
      }
    }
    const allReferences = await recursiveKeySearch<string>(
      result,
      referenceKey
    );
    remainingReferences = allReferences.filter(
      (r) => !resolvedReferences.includes(r.value)
    );
  }
  return result;
}
