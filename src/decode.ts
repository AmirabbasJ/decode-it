import { isObject } from '../brainStorms/utils';
import { validationResult, validator } from './validators';

export interface Schema {
  [key: string]: Schema | validator;
}

export type Json = Record<string, unknown>;

export interface FailedDecode {
  actual: unknown;
  expected: validationResult['type'] | 'object';
  path: string;
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

const getFailedDecodes = (schema: Schema, json: Json): FailedDecode[] => {
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
        path: key,
      });

    return errors;
  }, []);
};

export const createDecoder =
  (schema: Schema) =>
  <T extends Json>(json: T): T | never => {
    const failedDecodes = getFailedDecodes(schema, json);
    failedDecodes.forEach(({ actual, expected, path }) => {
      throw new DecodeError(`Expected ${expected} but got ${actual} at ${path}`);
    });
    return json;
  };
