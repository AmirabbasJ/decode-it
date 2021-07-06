import { isBoolean } from '../typeCheckers';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const boolean = (): Validator<boolean> => arg =>
  isBoolean(arg)
    ? passedValidation
    : {
        value: arg,
        type: 'boolean',
        state: 'failed',
      };
