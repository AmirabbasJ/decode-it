import { getFailedDecodes, Schema } from '../decode';
import { toNativeType } from '../toNativeType';
import { isArray, isEmptyArray, isObject } from '../typeCheckers';
import { FailedValidation, passedValidation } from './ValidationResult';
import { Validator } from './Validator';

type array = <T extends Schema<any> | Validator<any>>(
  validator?: T | undefined,
) => Validator<toNativeType<T>[]>;

export const array: array = validator => {
  return (arg: unknown) => {
    if (!isArray(arg))
      return {
        value: arg,
        type: 'unknown',
        state: 'failed',
        wrapper: 'array',
      };

    if (validator == null) {
      return isEmptyArray(arg)
        ? passedValidation
        : {
            value: arg,
            type: 'none',
            state: 'failed',
            wrapper: 'array',
          };
    }
    if (isObject(validator)) {
      const areAllItemsObject = arg.every(item => isObject(item));
      if (!areAllItemsObject)
        return {
          value: arg,
          type: 'object',
          state: 'failed',
          wrapper: 'array',
        };
      const itemsFailedDecodes = arg.map(item =>
        getFailedDecodes(validator, item as Record<string, unknown>),
      );
      const noFailedDecodes = itemsFailedDecodes.every(isEmptyArray);
      if (noFailedDecodes) return passedValidation;

      const [error] = itemsFailedDecodes.reduce(
        (failedResults: FailedValidation[], [failedDecode], index) => {
          if (failedDecode != null)
            return failedResults.concat({
              value: failedDecode.actual,
              type: failedDecode.expectedType,
              state: 'failed',
              path: `[${index}].${failedDecode?.path}`,
              wrapper: failedDecode.wrapper,
            });
          return failedResults;
        },
        [],
      );
      return error;
    }

    const itemsFailedResults = arg.reduce(
      (failedResults: FailedValidation[], item: unknown, index) => {
        const result = validator(item);
        return result.state === 'failed'
          ? failedResults.concat({
              ...result,
              path: result.path ? `[${index}]${result.path}` : `[${index}]`,
            })
          : failedResults;
      },
      [],
    );

    const itemsHaveCorrectType = isEmptyArray(itemsFailedResults);
    return itemsHaveCorrectType
      ? passedValidation
      : {
          value: itemsFailedResults[0].value,
          type: itemsFailedResults[0]?.type ?? 'unknown',
          state: 'failed',
          wrapper: itemsFailedResults[0]?.wrapper == null ? undefined : 'array',
          path: itemsFailedResults[0]?.path,
        };
  };
};
