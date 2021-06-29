import { isArray, isObject } from './typeCheckers';

export const flatObject = (obj: Record<string, unknown>): [string, unknown][] =>
  Object.entries(obj).reduce((flattened: [string, unknown][], prop) => {
    const [key, value] = prop;
    if (isObject(value)) {
      const innerObj = flatObject(value);
      return flattened.concat(
        innerObj.map(([innerKey, val]) => [`${key}.${innerKey}`, val]),
      );
    }
    return flattened.concat([prop]);
  }, []);

export function arrayDeepEqual(as: unknown[], bs: unknown[]): boolean {
  return as.every((a, i) => {
    const b = bs[i];
    if (isObject(a) && isObject(b)) return objectDeepEqual(a, b);
    if (isArray(a) && isArray(b)) return arrayDeepEqual(a, b);
    return b === a;
  });
}

export function objectDeepEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
) {
  return arrayDeepEqual(Object.entries(a), Object.entries(b));
}

export const shallowEq = (a: unknown, b: unknown) => a === b;

export const deepEq = (a: unknown, b: unknown) => {
  if (isObject(a) && isObject(b)) return objectDeepEqual(a, b);
  if (isArray(a) && isArray(b)) return arrayDeepEqual(a, b);
  return shallowEq(a, b);
};
