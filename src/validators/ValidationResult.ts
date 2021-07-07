export interface FailedValidation {
  value: unknown;
  type:
    | 'boolean'
    | 'literal'
    | 'none'
    | 'null'
    | 'number'
    | 'object'
    | 'string'
    | 'unknown'
    | 'validator';
  state: 'failed';
  wrapper?: 'array' | 'optional' | 'tuple' | 'union';
  path?: string;
  literal?: unknown;
}

export interface PassedValidation {
  state: 'passed';
}
export const passedValidation: PassedValidation = { state: 'passed' };
// TODO: \/
// export const createFailedValidation = (value,type,wrapper,path) => ({value,type,wrapper,path})
export type ValidationResult = FailedValidation | PassedValidation;

export const isFailedValidation = (v: ValidationResult): v is FailedValidation =>
  v.state === 'failed';
export const isPassedValidation = (v: ValidationResult): v is PassedValidation =>
  v.state === 'passed';
export type FailedValidationConstructor = (arg: unknown) => FailedValidation;
