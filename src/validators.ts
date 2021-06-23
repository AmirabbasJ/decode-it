import { isString } from './typeCheckers';

export interface validationResult {
  value: unknown;
  type: 'string';
  state: 'failed' | 'success';
}

export type validator = (arg: unknown) => validationResult;

export const string = (): validator => arg => ({
  value: arg,
  type: 'string',
  state: isString(arg) ? 'success' : 'failed',
});
