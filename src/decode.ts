import { formatFailedDecode } from './errorFormatter';
import { isFunction, isObject, isUndefined } from './typeCheckers';
import { flatObject } from './utils';
import type { FailedValidation, Validator } from './validators';

export interface Schema {
  [key: string]: Schema | Validator;
}

export type Json = Record<string, unknown>;

export interface FailedDecode {
  actual: unknown;
  expected: FailedValidation['type'];
  path: string;
  wrapper?: FailedValidation['wrapper'];
}

class DecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = '\nDecode Error';
  }
}

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

export const getFailedDecodes = (schema: Schema, json: Json): FailedDecode[] => {
  return Object.entries(schema).reduce((errors: FailedDecode[], [key, validate]) => {
    const field = json[key];
    console.log(validate);
    if (isObject(validate)) {
      if (!isObject(field))
        return errors.concat({
          actual: field,
          expected: 'object',
          path: key,
        });

      const errorsSource = getFailedDecodes(validate, field);
      const error = concatNestedErrors(errorsSource, key);
      return errors.concat(error);
    }
    const result = validate(field);
    console.log(result);

    if (!isValidationResult(result))
      return errors.concat({
        actual: result,
        expected: 'validator',
        path: key,
      });
    if (result.state === 'failed')
      return errors.concat({
        actual: result.value,
        expected: result.type,
        wrapper: result.wrapper,
        path: result.path ? `${key}${result.path}` : key,
      });

    return errors;
  }, []);
};

export const createDecoder = (schema: Schema) => {
  if (!isObject(schema))
    throw new DecodeError(`Expected schema to be an object but got ${schema}`);
  const nonFunctionField = flatObject(schema).find(
    ([_k, v]: [string, unknown]) => !isFunction(v),
  );
  if (!isUndefined(nonFunctionField))
    throw new DecodeError(
      `Expected schema fields to be an validator or another schema but got ${nonFunctionField[1]} at ${nonFunctionField[0]}`,
    );
  return <T extends Json>(json: T): T | never => {
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
