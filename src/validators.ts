import { getFailedDecodes, Schema } from './decode';
import {
  isArray,
  isBoolean,
  isEmptyArray,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from './typeCheckers';
import { deepEq } from './utils';

export interface FailedValidation {
  value: unknown;
  type:
    | 'boolean'
    | 'literal'
    | 'none'
    | 'null'
    | 'number'
    | 'object'
    | 'string'
    | 'unknown'
    | 'validator';
  state: 'failed';
  wrapper?: 'array' | 'optional' | 'tuple' | 'union';
  path?: string;
  literal?: unknown;
}

interface passedValidation {
  state: 'passed';
}
const passedValidation: passedValidation = { state: 'passed' };
// TODO: \/
// export const createFailedValidation = (value,type,wrapper,path) => ({value,type,wrapper,path})
export type ValidationResult = FailedValidation | passedValidation;

export type Validator = (arg: unknown) => ValidationResult;

export const string = (): Validator => arg =>
  isString(arg)
    ? passedValidation
    : {
        state: 'failed',
        value: arg,
        type: 'string',
      };

export const number = (): Validator => arg =>
  isNumber(arg)
    ? passedValidation
    : {
        value: arg,
        type: 'number',
        state: 'failed',
      };

export const boolean = (): Validator => arg =>
  isBoolean(arg)
    ? passedValidation
    : {
        value: arg,
        type: 'boolean',
        state: 'failed',
      };

export const nil = (): Validator => arg =>
  isNull(arg)
    ? passedValidation
    : {
        value: arg,
        type: 'null',
        state: 'failed',
      };

export const array =
  (itemValidator?: Schema | Validator): Validator =>
  (arg: unknown) => {
    if (!isArray(arg))
      return {
        value: arg,
        type: 'unknown',
        state: 'failed',
        wrapper: 'array',
      };

    if (itemValidator == null) {
      return isEmptyArray(arg)
        ? passedValidation
        : {
            value: arg,
            type: 'none',
            state: 'failed',
            wrapper: 'array',
          };
    }
    if (isObject(itemValidator)) {
      const areAllItemsObject = arg.every(item => isObject(item));
      if (!areAllItemsObject)
        return {
          value: arg,
          type: 'object',
          state: 'failed',
          wrapper: 'array',
        };
      const itemsFailedDecodes = arg.map(item =>
        getFailedDecodes(itemValidator, item as Record<string, unknown>),
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
        const result = itemValidator(item);
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

export const union =
  (...itemValidators: Validator[]): Validator =>
  (arg: unknown) => {
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

export const tuple =
  (...itemValidators: (Schema | Validator)[]): Validator =>
  (arg: unknown) => {
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
export const optional =
  (validator: Schema | Validator): Validator =>
  (arg: unknown) => {
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

export const literal =
  (val: unknown): Validator =>
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
