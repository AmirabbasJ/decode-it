import { Id, OptionalUndefined } from './helperTypes';
import { Validator } from './validators/Validator';

type _toNativeType<T> = T extends Validator<infer R>
  ? R
  : {
      [key in keyof T]: _toNativeType<T[key]>;
    };
export type toNativeType<T> = T extends [...Validator<any>[]]
  ? { [L in keyof T]: toNativeType<T[L]> }
  : T extends Validator<infer R>
  ? R
  : Id<OptionalUndefined<_toNativeType<T>>>;
