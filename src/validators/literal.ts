import { Narrow } from '../helperTypes';
import { deepEq } from '../utils';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const literal =
  <T>(val: Narrow<T>): Validator<T> =>
  (arg: unknown) =>
    deepEq(val, arg)
      ? passedValidation
      : {
          value: arg,
          type: 'literal',
          state: 'failed',
          literal: val,
        };
