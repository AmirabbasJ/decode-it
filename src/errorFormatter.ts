import type { FailedDecode } from './decode';

export const formatFailedDecode = ({
  actual,
  expected,
  path,
  wrapper,
}: FailedDecode): string => {
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
  if (wrapper === 'union')
    return `Expected union to match one of specified types but none matched for value ${actual} at ${path}`;
  return `Expected ${expected} but got ${actual} at ${path}`;
};
