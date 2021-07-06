export type AnyElementOf<T extends any[]> = T[number];
export type NonEmptyArray<T> = [T, ...T[]];
export type TwinePregnantArray<T> = T[] & {
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
