import isDigit from './isDigit';

export function valid(path: string, obj: any): boolean {
  return resolve(path, obj) === undefined;
}

export function resolve(path: string, obj: any): any | undefined {
  let currentObj = obj;
  const pathFragments = path.split('/');
  for (const fragment of pathFragments) {
    const i = getIndex(fragment);
    if (i !== undefined) {
      currentObj = currentObj[fragment.split('[')[0]];
      if (currentObj === undefined || !(currentObj instanceof Array))
        return undefined;
      currentObj = currentObj[i];
    } else {
      currentObj = currentObj[fragment];
    }
    if (currentObj === undefined) return undefined;
  }
  return currentObj;
}

function getIndex(pathFragment: string) {
  const parts = pathFragment.split('[');
  const indexString = parts
    .find((p, i) => {
      if (p.endsWith(']')) {
        return isDigit(p.slice(0, -1)) && i === parts.length - 1;
      } else return false;
    })
    ?.slice(0, -1);
  return indexString !== undefined ? Number(indexString) : undefined;
}
