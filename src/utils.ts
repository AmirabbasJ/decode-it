import { isObject } from './typeCheckers';

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
