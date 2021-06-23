import { validationResult, validator } from './validators';

export type Schema = Record<string, validator>;

export type Json = Record<string, any>;

export interface FailedDecode {
  actual: unknown;
  expected: validationResult['type'];
  path: string;
}

class DecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = '\nDecode Error';
  }
}

export const createDecoder =
  (schema: Schema) =>
  <T extends Json>(json: T): T | never => {
    Object.entries(schema).forEach(([key, validate]) => {
      const field = json[key];
      const result = validate(field);
      if (result.state === 'failed')
        throw new DecodeError(
          `Expected ${result.type} but got ${result.value} at ${key}`,
        );
    });
    return json;
  };
