import { isString } from '../typeCheckers';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const string = (): Validator<string> => arg =>
  isString(arg)
    ? passedValidation
    : {
        state: 'failed',
        value: arg,
        type: 'string',
      };
