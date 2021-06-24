export type NonEmptyArray<T> = [T, ...T[]];

export const isString = (arg: unknown): arg is string => typeof arg === 'string';
export const isObject = (arg: unknown): arg is Record<string, unknown> =>
  typeof arg === 'object' && !Array.isArray(arg) && arg !== null;
export const isNumber = (arg: unknown): arg is number => typeof arg === 'number';
export const isBoolean = (arg: unknown): arg is boolean => typeof arg === 'boolean';
export const isNull = (arg: unknown): arg is null => arg === null;
export const isArray = (arg: unknown): arg is unknown[] => Array.isArray(arg);
export const isEmptyArray = <T>(arg: T[]): arg is NonEmptyArray<T> =>
  arg.length === 0;
