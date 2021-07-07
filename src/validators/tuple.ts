import { constructNestedErrorPath } from '../constructErrorPath';
import { FailedDecode, getFailedDecodes, Schema } from '../decode';
import { toNativeType } from '../toNativeType';
import { isArray, isEmptyArray, isObject } from '../typeCheckers';
import {
  FailedValidation,
  FailedValidationConstructor,
  isFailedValidation,
  isPassedValidation,
  passedValidation,
  ValidationResult,
} from './ValidationResult';
import { Validator } from './Validator';

const createEmptyTupleValidatorFailure: FailedValidationConstructor = arg => ({
  value: arg,
  type: 'validator',
  state: 'failed',
  wrapper: 'tuple',
});
const createEmptyTupleFailure: FailedValidationConstructor = arg => ({
  value: arg,
  type: 'none',
  state: 'failed',
  wrapper: 'tuple',
});

export const failedDecodeToFailedValidation = (
  failedDecode: FailedDecode,
): FailedValidation => ({
  value: failedDecode.actual,
  type: failedDecode.expectedType,
  literal: failedDecode.expectedValue,
  path: failedDecode.path,
  wrapper: failedDecode.wrapper,
  state: 'failed',
});

type tuple = <T extends (Schema<any> | Validator<any>)[]>(
  ...itemValidators: T
) => Validator<toNativeType<T>>;
export const tuple: tuple =
  (...itemValidators) =>
  arg => {
    if (isEmptyArray(itemValidators)) return createEmptyTupleValidatorFailure(arg);
    if (!isArray(arg)) return createEmptyTupleFailure(arg);
    const validationResults: ValidationResult[] = itemValidators.map(
      (validate, index) => {
        const item = arg[index];
        if (isObject(validate)) {
          const [failedDecode] = getFailedDecodes(validate, item as any);
          return failedDecode == null
            ? passedValidation
            : failedDecodeToFailedValidation(failedDecode);
        }
        return validate(item);
      },
    );
    const allValidationsPassed = validationResults.every(isPassedValidation);
    if (allValidationsPassed) return passedValidation;

    const [failedValidation] = validationResults
      .map((validationRes, index) =>
        isFailedValidation(validationRes)
          ? {
              ...validationRes,
              path: constructNestedErrorPath(index, validationRes.path),
            }
          : validationRes,
      )
      .filter(isFailedValidation) as FailedValidation[];
    console.log(failedValidation);

    return {
      value: failedValidation.value,
      type: failedValidation.type,
      path: failedValidation.path,
      state: 'failed',
      wrapper: failedValidation.wrapper == null ? undefined : 'tuple',
    };
  };
