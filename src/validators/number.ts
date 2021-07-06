import { isNumber } from '../typeCheckers';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const number = (): Validator<number> => arg =>
  isNumber(arg)
    ? passedValidation
    : {
        value: arg,
        type: 'number',
        state: 'failed',
      };
