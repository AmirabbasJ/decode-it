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
  return `Expected ${expected} but got ${actual} at ${path}`;
};
