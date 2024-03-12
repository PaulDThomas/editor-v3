import { isEqual } from "lodash";
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 *  Returns an object containing values/functions for using a debounced value
 *
 *  `currentValue`: Current, non-debounced value
 *  `setCurrentValue`: Function to update the current value
 *  `forceUpdate`: Function to force the current value to bypassing debounce
 *  `undo`: Function to go back to previous version
 *  `redo`: Function to go forwards to undone version
 *  `stack`: Array of all values in the stack
 *  `index`: Current index in the stack
 *
 * Example:
 *
 *  `const { currentValue, setCurrentValue } = useDebounce(value, setValue);`
 *
 * @param value The value to be debounced
 * @param setValue Used to update the value after debounce
 * @param debounceMilliseconds Number of milliseconds to debounce by, defaults to 500, leave null for only forced updates
 * @param onChange Function to be called when the value changes
 * @param onDebounce Function to be called when the value is internally debounced
 * @param comparisonFunction Function to compare the current value with the previous value, defaults to lodash isEqual
 * @returns object
 *
 */
export const useDebounceStack = <T>(
  value: T,
  setValue: Dispatch<T>,
  debounceMilliseconds: number | null = 500,
  onChange: (newValue: T, index: number, stack: T[]) => void = () => {},
  onDebounce: (newValue: T) => void = () => {},
  comparisonFunction: (oldValue: T, newValue: T) => boolean = isEqual,
): {
  currentValue: T | null;
  setCurrentValue: Dispatch<T>;
  forceUpdate: () => void;
  undo: (steps?: number) => void;
  redo: (steps?: number) => void;
  stack: T[] | null;
  index: number;
} => {
  const [currentValueStack, setCurrentValueStack] = useState<T[]>([]);
  const [currentValueIndex, setCurrentValueIndex] = useState<number>(-1);
  const [debouncedValue, setDebouncedValue] = useState<T | null>(value);
  const debounceController = useRef<AbortController>(new AbortController());

  // CurrentValue from memo
  const currentValue = useMemo(() => {
    return currentValueStack && currentValueStack[currentValueIndex];
  }, [currentValueIndex, currentValueStack]);

  // Add setCurrentValue as append to stack
  const setCurrentValue = useCallback(
    (newValue: T) => {
      if (currentValueStack && !isEqual(newValue, currentValue)) {
        // Copy exising stack
        const newStack = currentValueStack.slice(0, currentValueIndex + 1);
        // If there is a data match remove the previous item, this will always fail on default
        if (comparisonFunction(currentValueStack[currentValueIndex], newValue)) newStack.pop();
        // Add on the new value
        newStack.push(newValue);
        // Set return
        setCurrentValueStack(newStack);
        const newIndex = newStack.length - 1;
        setCurrentValueIndex(newIndex);
        // Callback function
        onChange(newStack[newIndex], newIndex, newStack);
      }
    },
    [comparisonFunction, currentValue, currentValueIndex, currentValueStack, onChange],
  );

  // Undo/Redo
  const undo = useCallback(
    (steps = 1) => {
      const newIndex = Math.max(0, currentValueIndex - steps);
      setCurrentValueIndex(newIndex);
      onChange(currentValueStack[newIndex], newIndex, currentValueStack);
    },
    [currentValueIndex, currentValueStack, onChange],
  );
  const redo = useCallback(
    (steps = 1) => {
      if (currentValueStack) {
        const newIndex = Math.min(currentValueStack.length - 1, currentValueIndex + steps);
        setCurrentValueIndex(newIndex);
        onChange(currentValueStack[newIndex], newIndex, currentValueStack);
      }
    },
    [currentValueIndex, currentValueStack, onChange],
  );

  // Top down update
  const [lastValue, setLastValue] = useState<T | null>(null);
  useEffect(() => {
    if (!isEqual(value, lastValue)) {
      debounceController.current.abort();
      setCurrentValue(value);
      setDebouncedValue(value);
      setLastValue(value);
    }
  }, [lastValue, setCurrentValue, value]);

  // Update debounce from current
  useEffect(() => {
    if (!isEqual(currentValue, debouncedValue)) {
      debounceController.current.abort();
      debounceController.current = new AbortController();

      // Only sent back info on timer debounce when debounceMilliseconds is set
      // When otherwise a force is required when debounceMilliseconds is null
      if (debounceMilliseconds !== null && debounceMilliseconds !== 0) {
        const timer = setTimeout(() => {
          if (!debounceController.current.signal.aborted) {
            setDebouncedValue(currentValue);
          }
        }, debounceMilliseconds);
        return () => {
          clearTimeout(timer);
        };
      }
      // Instant return without timer for 0 debounceMilliseconds
      else if (debounceMilliseconds === 0) {
        setDebouncedValue(currentValue);
      }
    }
  }, [currentValue, debounceMilliseconds, debouncedValue]);

  // Force update (for when there is no timer)
  const forceUpdate = useCallback(() => {
    debounceController.current.abort();
    setDebouncedValue(currentValue);
  }, [currentValue]);

  // const getObjectDiff = useCallback((obj1: unknown, obj2: unknown) => {
  //   if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
  //     return obj1 !== obj2 ? [obj1, obj2] : undefined;
  //   }
  //   const keys1: string[] = Object.keys(obj1);
  //   const keys2: string[] = Object.keys(obj2);
  //   const uniqueKeys = new Set([...keys1, ...keys2]);

  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const differences: any = {};

  //   for (const key of uniqueKeys) {
  //     const value1 = obj1[key as keyof typeof obj1] as unknown;
  //     const value2 = obj2[key as keyof typeof obj2] as unknown;

  //     if (typeof value1 === "object" && typeof value2 === "object") {
  //       const nestedDifferences = getObjectDiff(value1, value2);
  //       if (nestedDifferences) {
  //         differences[key] = nestedDifferences;
  //       }
  //     } else if (value1 !== value2) {
  //       differences[key] = [value1, value2];
  //     }
  //   }

  //   return Object.keys(differences).length === 0 ? undefined : differences;
  // }, []);

  // Update value from debouncedValue, if the value has not changed since the last update
  useEffect(() => {
    if (debouncedValue && !isEqual(debouncedValue, value) && isEqual(value, lastValue)) {
      setCurrentValue(debouncedValue);
      setValue(debouncedValue);
      onDebounce(debouncedValue);
    }
  }, [debouncedValue, lastValue, onDebounce, setCurrentValue, setValue, value]);

  return {
    currentValue,
    setCurrentValue,
    forceUpdate,
    undo,
    redo,
    stack: currentValueStack,
    index: currentValueIndex,
  };
};
