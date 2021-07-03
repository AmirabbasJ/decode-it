import type { FailedDecode } from './decode';

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
    return `Expected empty array but got ${formattedActual} at ${path}`;
  if (wrapper === 'array') {
    return expectedType === 'unknown'
      ? `Expected array but got ${formattedActual} at ${path}`
      : `Expected array of ${expectedType} but got ${formattedActual} at ${path}`;
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
  if (wrapper === 'tuple' && expectedType === 'unknown')
    return (
      'Expected tuples to have at least one validators\n' +
      'hint: you passed V.tuples with no validators\n' +
      'you should pass at least one validators e.g:\n' +
      '{\n' +
      '  field: V.tuples(V.string(), V.number()) // [string, number]\n' +
      '}'
    );
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
  return `Expected ${
    formattedExpectedValue ?? expectedType
  } but got ${formattedActual} at ${path}`;
};
