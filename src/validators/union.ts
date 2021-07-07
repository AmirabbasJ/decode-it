import { AnyElementOf, ArrayTwoOrMore } from '../helperTypes';
import { toNativeType } from '../toNativeType';
import { isEmptyArray } from '../typeCheckers';
import { FailedValidation, passedValidation } from './ValidationResult';
import { Validator } from './Validator';

type union = <T extends ArrayTwoOrMore<Validator<any>>>(
  ...itemValidators: T
) => Validator<toNativeType<AnyElementOf<T>>>;

const createEmptyUnionFailure = (arg: unknown): FailedValidation => ({
  value: arg,
  type: 'unknown',
  state: 'failed',
  wrapper: 'union',
});

const createFailedUnionValidation = (arg: unknown): FailedValidation => ({
  value: arg,
  type: 'none',
  state: 'failed',
  wrapper: 'union',
});

export const union: union = (...itemValidators) => {
  return (arg: unknown) => {
    if (isEmptyArray(itemValidators) || itemValidators.length === 1) {
      return createEmptyUnionFailure(arg);
    }
    const validationsResult = itemValidators.map(validate => validate(arg));
    const allValidationsFailed = validationsResult.every(v => v.state === 'failed');
    return allValidationsFailed
      ? createFailedUnionValidation(arg)
      : passedValidation;
  };
};
