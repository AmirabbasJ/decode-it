export const isString = (arg: unknown): arg is string => typeof arg === 'string';
export const isObject = (arg: unknown): arg is Record<string, unknown> =>
  typeof arg === 'object' && !Array.isArray(arg) && arg !== null;
