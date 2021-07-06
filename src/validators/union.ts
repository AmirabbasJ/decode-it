import { AnyElementOf, ArrayTwoOrMore } from '../helperTypes';
import { toNativeType } from '../toNativeType';
import { isEmptyArray } from '../typeCheckers';
import { passedValidation } from './ValidationResult';
import { Validator } from './Validator';

type union = <T extends ArrayTwoOrMore<Validator<any>>>(
  ...itemValidators: T
) => Validator<toNativeType<AnyElementOf<T>>>;

export const union: union = (...itemValidators) => {
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
