import type { FailedDecode } from './decode';
import { isFunction } from './typeCheckers';

export const formatToJson = (v: unknown) => JSON.stringify(v, null, 1);

// eslint-disable-next-line complexity
export const formatFailedDecode = ({
  actual,
  expectedType,
  path,
  wrapper,
  expectedValue,
}: FailedDecode): string => {
  const formattedActual = formatToJson(actual);
  const formattedExpectedValue = formatToJson(expectedValue);

  if (wrapper === 'array' && expectedType === 'none')
    return (
      'Expected array to have one validator but got none\n' +
      'hint: you passed V.array with no validator\n' +
      'you should pass one validator e.g:\n' +
      '{\n' +
      '  field: V.array(V.string()) // array of strings\n' +
      '}'
    );
  if (wrapper === 'array' && expectedType === 'unknown') {
    return `Expected array but got ${formattedActual} at ${path}`;
  }
  if (wrapper === 'union' && expectedType === 'unknown')
    return (
      'Expected union to have two or more validators\n' +
      'hint: you passed V.union with less than two validators to choose from\n' +
      'you should pass at least two validators e.g:\n' +
      '{\n' +
      '  field: V.union(V.string(), V.number()) // string or number\n' +
      '}'
    );
  if (wrapper === 'tuple' && expectedType === 'validator')
    return (
      'Expected tuples to have at least one validators\n' +
      'hint: you passed V.tuples with no validators\n' +
      'you should pass at least one validators e.g:\n' +
      '{\n' +
      '  field: V.tuples(V.string(), V.number()) // [string, number]\n' +
      '}'
    );
  if (wrapper === 'tuple' && expectedType === 'none')
    return `Expected tuple but got ${formattedActual} at ${path}`;
  if (wrapper === 'union')
    return `Expected union to match one of specified types but none matched for value ${formattedActual} at ${path}`;
  if (wrapper === 'optional' && expectedType === 'object')
    return `Expected undefined or specified schema but got ${formattedActual} at ${path}`;
  if (wrapper === 'optional' && expectedType === 'validator')
    return (
      'Expected optional to have a validator\n' +
      'hint: you passed V.optional without a validator\n' +
      'you should pass one validator so that if the field exists\n' +
      'we can validate it by the specified type e.g:\n' +
      '{\n' +
      '  field: V.optional(V.string()) // string or undefined\n' +
      '}'
    );
  if (wrapper === 'optional')
    return `Expected undefined or ${expectedType} but got ${formattedActual} at ${path}`;
  if (expectedType === 'validator')
    return (
      `Expected schema fields to be an validator or another schema but got non validator function at ${path}\n` +
      `hint: it is possible that you forgot to call the validator e.g this is wrong:\n` +
      `{\n` +
      `  field: V.string\n` +
      `}\n` +
      `the right way is this:\n` +
      `{\n` +
      `  field: V.string()\n` +
      `}\n` +
      `so as a rule of thumb: "you are always calling the validator"`
    );
  if (isFunction(expectedValue) && expectedType === 'literal')
    return (
      `Expected non function literal but got one at ${path}\n` +
      `hint: you probably passed a validator (or just a function) to a literal validator\n` +
      `and since a json doesn't have function in their field this is not possible`
    );
  return `Expected ${
    formattedExpectedValue ?? expectedType
  } but got ${formattedActual} at ${path}`;
};
