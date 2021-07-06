import { formatFailedDecode } from './errorFormatter';
import { Id, OptionalUndefined } from './helperTypes';
import { isFunction, isObject, isUndefined } from './typeCheckers';
import { flatObject } from './utils';
import type { FailedValidation, Validator } from './validators';

export interface Schema<T> {
  [key: string]: Schema<T> | Validator<T>;
}

export interface FailedDecode {
  actual: unknown;
  expectedType: FailedValidation['type'];
  expectedValue?: FailedValidation['literal'];
  path: string;
  wrapper?: FailedValidation['wrapper'];
}

class DecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = '\nDecode Error';
  }
}
type _toNativeType<T> = T extends Validator<infer R>
  ? R
  : {
      [key in keyof T]: _toNativeType<T[key]>;
    };
export type toNativeType<T> = T extends Validator<infer R>
  ? R
  : Id<OptionalUndefined<_toNativeType<T>>>;

const isValidationResult = (arg: unknown) => {
  if (!isObject(arg)) return false;
  if (arg.state !== 'failed' && arg.state !== 'passed') return false;
  return true;
};

const concatNestedErrors = (errorsSources: FailedDecode[], currentKey: string) =>
  errorsSources.map(errorSource => ({
    ...errorSource,
    path: `${currentKey}.${errorSource.path}`,
  }));

export const getFailedDecodes = <T extends Schema<any>, J extends toNativeType<T>>(
  schema: Schema<T>,
  json: J,
): FailedDecode[] => {
  return Object.entries(schema).reduce((errors: FailedDecode[], [key, validate]) => {
    const field = json[key as keyof toNativeType<T>];
    if (isObject(validate)) {
      if (!isObject(field))
        return errors.concat({
          actual: field,
          expectedType: 'object',
          path: key,
        });

      const errorsSource = getFailedDecodes(validate, field as J);
      const error = concatNestedErrors(errorsSource, key);
      return errors.concat(error);
    }
    const result = validate(field);

    if (!isValidationResult(result))
      return errors.concat({
        actual: result,
        expectedType: 'validator',
        path: key,
      });
    if (result.state === 'failed')
      return errors.concat({
        actual: result.value,
        expectedType: result.type,
        expectedValue: result.literal,
        wrapper: result.wrapper,
        path: result.path ? `${key}${result.path}` : key,
      });

    return errors;
  }, []);
};

export const createDecoder = <T extends Schema<any>>(schema: T) => {
  if (!isObject(schema))
    throw new DecodeError(`Expected schema to be an object but got ${schema}`);
  const nonFunctionField = flatObject(schema).find(
    ([_k, v]: [string, unknown]) => !isFunction(v),
  );
  if (!isUndefined(nonFunctionField))
    throw new DecodeError(
      `Expected schema fields to be an validator or another schema but got ${nonFunctionField[1]} at ${nonFunctionField[0]}`,
    );
  return <J extends toNativeType<T>>(json: J): J | never => {
    if (!isObject(json))
      throw new DecodeError(`Expected json to be an object but got ${json}`);

    const failedDecodes = getFailedDecodes(schema, json);
    const formattedErrors = failedDecodes.map(err => formatFailedDecode(err));
    formattedErrors.forEach(msg => {
      throw new DecodeError(msg);
    });
    return json;
  };
};
