import { formatFailedDecode } from './errorFormatter';
import { isObject } from './typeCheckers';
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

const concatNestedErrors = (errorsSources: FailedDecode[], currentKey: string) =>
  errorsSources.map(errorSource => ({
    ...errorSource,
    path: `${currentKey}.${errorSource.path}`,
  }));

export const getFailedDecodes = (schema: Schema, json: Json): FailedDecode[] => {
  return Object.entries(schema).reduce((errors: FailedDecode[], [key, validate]) => {
    const field = json[key];

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

export const createDecoder =
  (schema: Schema) =>
  <T extends Json>(json: T): T | never => {
    const failedDecodes = getFailedDecodes(schema, json);
    const formattedErrors = failedDecodes.map(err => formatFailedDecode(err));
    formattedErrors.forEach(msg => {
      throw new DecodeError(msg);
    });
    return json;
  };
