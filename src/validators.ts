import { isBoolean, isNumber, isString } from './typeCheckers';

export interface validationResult {
  value: unknown;
  type: 'boolean' | 'number' | 'string';
  state: 'failed' | 'success';
}

export type validator = (arg: unknown) => validationResult;

export const string = (): validator => arg => ({
  value: arg,
  type: 'string',
  state: isString(arg) ? 'success' : 'failed',
});

export const number = (): validator => arg => ({
  value: arg,
  type: 'number',
  state: isNumber(arg) ? 'success' : 'failed',
});

export const boolean = (): validator => arg => ({
  value: arg,
  type: 'boolean',
  state: isBoolean(arg) ? 'success' : 'failed',
});
