import { isString } from './typeCheckers';

const isInnerPathAnIndex = (innerPath: string) => innerPath.startsWith('[');

export const constructNestedErrorPath = (
  currentPath: number | string,
  innerPath: string | null | undefined,
) => {
  const formattedCurrentPath = isString(currentPath)
    ? currentPath
    : `[${currentPath}]`;
  return innerPath == null
    ? formattedCurrentPath
    : isInnerPathAnIndex(innerPath)
    ? `${formattedCurrentPath}${innerPath}`
    : `${formattedCurrentPath}.${innerPath}`;
};
