import { getFailedDecodes, Schema } from '../decode';
import { toNativeType } from '../toNativeType';
import { isArray, isEmptyArray, isObject } from '../typeCheckers';
import {
  FailedValidation,
  passedValidation,
  ValidationResult,
} from './ValidationResult';
import { Validator } from './Validator';

type tuple = <T extends (Schema<any> | Validator<any>)[]>(
  ...itemValidators: T
) => Validator<toNativeType<T>>;
export const tuple: tuple =
  (...itemValidators) =>
  arg => {
    if (isEmptyArray(itemValidators))
      return {
        value: arg,
        type: 'unknown',
        state: 'failed',
        wrapper: 'tuple',
      };
    if (!isArray(arg))
      return {
        value: arg,
        type: 'unknown',
        state: 'failed',
        wrapper: 'array',
      };
    const validationResults: ValidationResult[] = arg.map((item, index) => {
      const validate = itemValidators[index];
      if (isObject(validate)) {
        const [itemFailedDecode] = getFailedDecodes(
          validate,
          item as Record<string, unknown>,
        );
        return itemFailedDecode == null
          ? passedValidation
          : {
              ...itemFailedDecode,
              value: itemFailedDecode.actual,
              type: itemFailedDecode.expectedType,
              state: 'failed',
            };
      }

      return validate(item);
    });
    const allValidationsPassed = validationResults.every(v => v.state === 'passed');
    if (allValidationsPassed) return passedValidation;

    const [failedDecode] = validationResults.reduce(
      (failedDecodes: FailedValidation[], validationRes, index) => {
        const currentPath = `[${index}]`;
        if (validationRes.state === 'failed') {
          const innerPath = validationRes?.path;
          return failedDecodes.concat({
            ...validationRes,
            path: innerPath != null ? `${currentPath}.${innerPath}` : currentPath,
          });
        }
        return failedDecodes;
      },
      [],
    );
    return {
      value: failedDecode.value,
      type: failedDecode.type,
      path: failedDecode.path,
      state: 'failed',
      wrapper: 'tuple',
    };
  };
