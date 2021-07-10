export type AnyElementOf<T extends any[]> = T[number];
export type NonEmptyArray<T> = [T, ...T[]];
export type ArrayTwoOrMore<T> = T[] & {
  0: T;
  1: T;
};
export type UndefinedProperties<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

type UndefinedKeys<T> = {
  [P in keyof T]: undefined extends T[P] ? P : never;
}[keyof T];

export type OptionalUndefined<T> = Omit<T, UndefinedKeys<T>> &
  Partial<Pick<T, UndefinedKeys<T>>>;
export type Id<T> = { [P in keyof T]: T[P] };

type Try<T, T2, N> = T extends T2 ? T : N;
type Narrowable = boolean | number | string | null;
type _Narrow<T> =
  | (T extends [] ? [] : never)
  | (T extends Narrowable ? T : never)
  | {
      [key in keyof T]: T[key] extends (...args: unknown[]) => unknown
        ? T[key]
        : _Narrow<T[key]>;
    };
export type Narrow<T> = Try<T, [], _Narrow<T>>;
