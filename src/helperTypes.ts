export type AnyElementOf<T extends any[]> = T[number];
export type NonEmptyArray<T> = [T, ...T[]];
export type TwinePregnantArray<T> = T[] & {
  0: T;
  1: T;
};
export type UndefinedProperties<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

export type ToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> &
  Pick<T, Exclude<keyof T, UndefinedProperties<T>>>;
