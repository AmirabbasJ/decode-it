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

export interface passedValidation {
  state: 'passed';
}
export const passedValidation: passedValidation = { state: 'passed' };
// TODO: \/
// export const createFailedValidation = (value,type,wrapper,path) => ({value,type,wrapper,path})
export type ValidationResult = FailedValidation | passedValidation;
