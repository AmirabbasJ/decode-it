import { constructNestedErrorPath } from '../constructErrorPath';
import { getFailedDecodes, Schema } from '../decode';
import { toNativeType } from '../toNativeType';
import { isArray, isEmptyArray, isObject } from '../typeCheckers';
import { failedDecodeToFailedValidation } from './tuple';
import {
  FailedValidation,
  FailedValidationConstructor,
  isFailedValidation,
  passedValidation,
} from './ValidationResult';
import { Validator } from './Validator';

type array = <T extends Schema<any> | Validator<any>>(
  validator?: T,
) => Validator<toNativeType<T>[]>;

const createNonArrayFailure: FailedValidationConstructor = arg => ({
  value: arg,
  type: 'unknown',
  state: 'failed',
  wrapper: 'array',
});

const createEmptyArrayFailure: FailedValidationConstructor = arg => ({
  value: arg,
  type: 'none',
  state: 'failed',
  wrapper: 'array',
});

const createNonInnerObjectArrayFailure: FailedValidationConstructor = arg => ({
  value: arg,
  type: 'none',
  state: 'failed',
  wrapper: 'array',
});

export const array: array = validator => {
  return (arg: unknown) => {
    if (!isArray(arg)) return createNonArrayFailure(arg);

    if (validator == null)
      return isEmptyArray(arg) ? passedValidation : createEmptyArrayFailure(arg);

    if (isObject(validator)) {
      const areAllItemsObject = arg.every(item => isObject(item));
      if (!areAllItemsObject) return createNonInnerObjectArrayFailure(arg);
      const failedValidations = arg
        .map(item => getFailedDecodes(validator, item as Record<string, unknown>))
        .map(([failedDecode], index) => {
          if (failedDecode == null) return passedValidation;
          const failedValidation = failedDecodeToFailedValidation(failedDecode);
          return {
            ...failedValidation,
            path: constructNestedErrorPath(index, failedValidation.path),
          };
        })
        .filter(isFailedValidation);
      const noFailedDecodes = isEmptyArray(failedValidations);
      return noFailedDecodes ? passedValidation : failedValidations[0];
    }
    const [failedValidation] = arg
      .map((item, index) => {
        const res = validator(item);
        return isFailedValidation(res)
          ? { ...res, path: constructNestedErrorPath(index, res.path) }
          : passedValidation;
      })
      .filter(isFailedValidation) as FailedValidation[];

    const validationHasPassed = failedValidation == null;
    return validationHasPassed
      ? passedValidation
      : {
          value: failedValidation.value,
          type: failedValidation.type,
          path: failedValidation.path,
          state: 'failed',
          wrapper: 'array',
        };
  };
};
