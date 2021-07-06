import { ValidationResult } from './ValidationResult';

export type Validator<T> = (arg: T) => ValidationResult;
