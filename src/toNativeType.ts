import { Id, OptionalUndefined } from './helperTypes';
import { Validator } from './validators';

type _toNativeType<T> = T extends Validator<infer R>
  ? R
  : {
      [key in keyof T]: _toNativeType<T[key]>;
    };
export type toNativeType<T> = T extends Validator<infer R>
  ? R
  : Id<OptionalUndefined<_toNativeType<T>>>;
