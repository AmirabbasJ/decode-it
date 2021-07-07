import { FailedDecode, getFailedDecodes, Schema } from '../decode';
import { toNativeType } from '../toNativeType';
import { isObject, isUndefined } from '../typeCheckers';
import {
  FailedValidation,
  FailedValidationConstructor,
  passedValidation,
} from './ValidationResult';
import { Validator } from './Validator';

const createNoOptionalValidatorFailure: FailedValidationConstructor = arg => ({
  value: arg,
  state: 'failed',
  type: 'validator',
  wrapper: 'optional',
});

const createNonObjectOptionalFailure: FailedValidationConstructor = arg => ({
  value: arg,
  type: 'object',
  state: 'failed',
  wrapper: 'optional',
});

const createNestedOptionalFailure = (
  failedInnerDecode: FailedDecode,
): FailedValidation => ({
  value: failedInnerDecode.actual,
  type: 'object',
  state: 'failed',
  wrapper: 'optional',
});

type optional = <T extends Schema<any> | Validator<any>>(
  validator: T,
) => Validator<toNativeType<T> | undefined>;
export const optional: optional = validator => arg => {
  if (isUndefined(validator)) return createNoOptionalValidatorFailure(validator);
  if (isUndefined(arg)) return passedValidation;
  if (isObject(validator)) {
    if (!isObject(arg)) return createNonObjectOptionalFailure(arg);
    const [failedDecode] = getFailedDecodes(validator, arg);
    return failedDecode
      ? createNestedOptionalFailure(failedDecode)
      : passedValidation;
  }

  const result = validator(arg);
  return { ...result, wrapper: 'optional' };
};
