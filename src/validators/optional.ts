import { getFailedDecodes, Schema } from '../decode';
import { toNativeType } from '../toNativeType';
import { isObject, isUndefined } from '../typeCheckers';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const optional =
  <T extends Schema<any> | Validator<any>>(
    validator: T,
  ): Validator<toNativeType<T> | undefined> =>
  arg => {
    if (isUndefined(validator))
      return {
        value: undefined,
        state: 'failed',
        type: 'validator',
        wrapper: 'optional',
      };
    if (isUndefined(arg)) return passedValidation;
    if (isObject(validator)) {
      if (!isObject(arg))
        return { value: arg, type: 'object', state: 'failed', wrapper: 'optional' };
      const [failedDecode] = getFailedDecodes(validator, arg);

      if (!failedDecode) return passedValidation;
      return {
        value: failedDecode.actual,
        type: 'object',
        state: 'failed',
        wrapper: 'optional',
      };
    }

    const result = validator(arg);
    return { ...result, wrapper: 'optional' };
  };
