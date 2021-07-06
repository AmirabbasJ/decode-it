import { isNull } from '../typeCheckers';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const nil = (): Validator<null> => arg =>
  isNull(arg)
    ? passedValidation
    : {
        value: arg,
        type: 'null',
        state: 'failed',
      };
