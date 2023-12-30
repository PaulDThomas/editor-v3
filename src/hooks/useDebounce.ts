import { isEqual } from "lodash";
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 *  Returns an object containing values/functions for using a debounced value
 *
 *  `currentValue`: Current, non-debounced value
 *
 *  `setCurrentValue`: Function to update the current value
 *
 *  `forceUpdate`: Function to force the current value to bypassing debounce
 *
 *  `undo`: Function to go back to previous version
 *
 *  `redo`: Function to go forwards to undone version
 *
 * Example:
 *
 *  `const { currentValue, setCurrentValue } = useDebounce(value, setValue);`
 *
 * @param value The value to be debounced
 * @param setValue Used to update the value after debounce
 * @param debounceMilliseconds Number of milliseconds to debounce by, defaults to 500, leave null for only forced updates
 * @returns object
 *
 */
export const useDebounce = <T>(
  value: T,
  setValue: Dispatch<T>,
  debounceMilliseconds: number | null = 500,
  onChange: (newValue: T) => void = () => {},
  onDebounce: (newValue: T) => void = () => {},
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
        const newStack = currentValueStack.slice(0, currentValueIndex + 1);
        newStack.push(newValue);
        const newIndex = newStack.length - 1;
        setCurrentValueStack(newStack);
        setCurrentValueIndex(newIndex);
        onChange(newStack[newIndex]);
      }
    },
    [currentValue, currentValueIndex, currentValueStack, onChange],
  );

  // Undo/Redo
  const undo = useCallback(
    (steps = 1) => {
      const newVersion = Math.max(0, currentValueIndex - steps);
      setCurrentValueIndex(newVersion);
    },
    [currentValueIndex],
  );
  const redo = useCallback(
    (steps = 1) => {
      const newVersion = Math.min((currentValueStack ?? []).length - 1, currentValueIndex + steps);
      setCurrentValueIndex(newVersion);
    },
    [currentValueIndex, currentValueStack],
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
    if (
      debounceMilliseconds !== null &&
      debounceMilliseconds >= 0 &&
      !isEqual(currentValue, debouncedValue)
    ) {
      debounceController.current.abort();
      debounceController.current = new AbortController();

      const timer = setTimeout(() => {
        if (!debounceController.current.signal.aborted) {
          setDebouncedValue(currentValue);
        }
      }, debounceMilliseconds);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentValue, debounceMilliseconds, debouncedValue]);

  // Force update (for when there is no timer)
  const forceUpdate = useCallback(() => {
    debounceController.current.abort();
    setDebouncedValue(currentValue);
  }, [currentValue]);

  // Update value from debouncedValue
  useEffect(() => {
    if (debouncedValue && !isEqual(debouncedValue, value)) {
      setCurrentValue(debouncedValue);
      setValue(debouncedValue);
      onDebounce(debouncedValue);
    }
  }, [debouncedValue, onDebounce, setCurrentValue, setValue, value]);

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
