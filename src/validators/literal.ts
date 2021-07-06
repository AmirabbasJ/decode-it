import { F } from 'ts-toolbelt';

import { isArray, isObject } from '../typeCheckers';
import { deepEq } from '../utils';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const literal =
  <T>(val: F.Narrow<T>): Validator<T> =>
  (arg: unknown) => {
    if (isArray(val) || isObject(val)) {
      const areEqual = deepEq(val, arg);
      return areEqual
        ? passedValidation
        : {
            value: arg,
            type: 'literal',
            state: 'failed',
            literal: val,
          };
    }
    if (val !== arg)
      return {
        value: arg,
        type: 'literal',
        state: 'failed',
        literal: val,
      };
    return passedValidation;
  };
