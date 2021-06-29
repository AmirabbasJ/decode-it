import type { FailedDecode } from './decode';

// eslint-disable-next-line complexity
export const formatFailedDecode = ({
  actual,
  expected,
  path,
  wrapper,
}: FailedDecode): string => {
  if (expected === 'validator')
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
  if (wrapper === 'array' && expected === 'none')
    return `Expected empty array but got ${actual} at ${path}`;
  if (wrapper === 'array') {
    return expected === 'unknown'
      ? `Expected array but got ${actual} at ${path}`
      : `Expected array of ${expected} but got ${actual} at ${path}`;
  }
  if (wrapper === 'union' && expected === 'unknown')
    return (
      'Expected union to have two or more validators\n' +
      'hint: you passed V.union with less than two validators to choose from\n' +
      'you should pass at least two validators e.g:\n' +
      '{\n' +
      '  field: V.union(V.string(), V.number()) // string or number\n' +
      '}'
    );
  if (wrapper === 'tuple' && expected === 'unknown')
    return (
      'Expected tuples to have at least one validators\n' +
      'hint: you passed V.tuples with no validators\n' +
      'you should pass at least one validators e.g:\n' +
      '{\n' +
      '  field: V.tuples(V.string(), V.number()) // [string, number]\n' +
      '}'
    );
  if (wrapper === 'union')
    return `Expected union to match one of specified types but none matched for value ${actual} at ${path}`;
  if (wrapper === 'optional' && expected === 'object')
    return `Expected undefined or specified schema but got ${actual} at ${path}`;
  if (wrapper === 'optional')
    return `Expected undefined or ${expected} but got ${actual} at ${path}`;
  if (wrapper === 'literal' && expected === 'object')
    return (
      'Expected literal to have at least one validators\n' +
      'hint: you passed V.literal with no validators\n' +
      'you should pass at least one validators e.g:\n' +
      '{\n' +
      "  field: V.literal('wow') // wow\n" +
      '}'
    );

  if (wrapper === 'literal')
    return `Expected literal ${expected} but got ${actual} at ${path}`;
  return `Expected ${expected} but got ${actual} at ${path}`;
};
