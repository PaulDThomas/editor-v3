import _ from "lodash";
import { Dispatch, useEffect, useRef, useState } from "react";

/**
 * Returns a debounced value, a function to update it before the debounce occurs, with an inbuilt abort controller
 * @param value The value to be debounced
 * @param setValue Used to update the value after debounce
 * @param debounceMilliseconds Number of milliseconds to debounce by, defaults to 500
 * @returns currentValue, setCurrentValue
 */
export const useDebounce = <T>(
  value: T,
  setValue: Dispatch<T>,
  debounceMilliseconds = 500,
): {
  currentValue: T;
  setCurrentValue: Dispatch<T>;
} => {
  const [currentValue, setCurrentValue] = useState<T>(value);
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const debounceController = useRef<AbortController>(new AbortController());

  // Top down update
  const [lastValue, setLastValue] = useState<T>(value);
  useEffect(() => {
    if (!_.isEqual(value, lastValue)) {
      debounceController.current.abort();
      setCurrentValue(value);
      setDebouncedValue(value);
      setLastValue(value);
    }
  }, [lastValue, value]);

  // Update value from debouncedValue
  useEffect(() => {
    if (!_.isEqual(debouncedValue, value)) {
      setCurrentValue(debouncedValue);
      setValue(debouncedValue);
    }
  }, [debouncedValue, setValue, value]);

  // Update debounce from current
  useEffect(() => {
    if (!_.isEqual(currentValue, debouncedValue)) {
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

  return { currentValue, setCurrentValue };
};
