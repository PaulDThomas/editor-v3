export const getObjectDiff = (obj1: unknown, obj2: unknown) => {
  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return obj1 !== obj2 ? [obj1, obj2] : undefined;
  }
  const keys1: string[] = Object.keys(obj1);
  const keys2: string[] = Object.keys(obj2);
  const uniqueKeys = new Set([...keys1, ...keys2]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const differences: any = {};

  for (const key of uniqueKeys) {
    const value1 = obj1[key as keyof typeof obj1] as unknown;
    const value2 = obj2[key as keyof typeof obj2] as unknown;

    if (typeof value1 === "object" && typeof value2 === "object") {
      const nestedDifferences = getObjectDiff(value1, value2);
      if (nestedDifferences) {
        differences[key] = nestedDifferences;
      }
    } else if (value1 !== value2) {
      differences[key] = [value1, value2];
    }
  }

  return Object.keys(differences).length === 0 ? undefined : differences;
};
