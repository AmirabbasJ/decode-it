import { AnyElementOf, TwinePregnantArray } from '../helperTypes';
import { toNativeType } from '../toNativeType';
import { isEmptyArray } from '../typeCheckers';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

export const union = <T extends TwinePregnantArray<Validator<any>>>(
  ...itemValidators: T
): Validator<toNativeType<AnyElementOf<T>>> => {
  return (arg: unknown) => {
    if (isEmptyArray(itemValidators) || itemValidators.length === 1) {
      return {
        value: arg,
        type: 'unknown',
        state: 'failed',
        wrapper: 'union',
      };
    }
    const validationsResult = itemValidators.map(validate => validate(arg));

    const allValidationsFailed = validationsResult.every(v => v.state === 'failed');
    return allValidationsFailed
      ? {
          value: arg,
          type: 'none',
          state: 'failed',
          wrapper: 'union',
        }
      : passedValidation;
  };
};
