import { renderHook, act, render, screen, fireEvent } from "@testing-library/react";
import { useDebounceStack } from "./useDebounceStack";
import { Dispatch, useEffect, useState } from "react";
import userEvent from "@testing-library/user-event";

describe("useDebounce", () => {
  test("Should return the initial value, and change current value", async () => {
    const { result, rerender } = renderHook(() =>
      useDebounceStack<string>("initial value", jest.fn()),
    );
    expect(result.current.currentValue).toBe("initial value");

    act(() => {
      rerender();
    });

    expect(result.current.currentValue).toBe("initial value");

    act(() => {
      result.current.setCurrentValue("new value");
    });

    expect(result.current.currentValue).toBe("new value");
  });

  test("Should update debouncedValue and call setValue when debouncedValue changes", () => {
    const setValueMock = jest.fn();
    const onChangeMock = jest.fn();
    const onDebounceMock = jest.fn();
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useDebounceStack<string>("initial value", setValueMock, 950, onChangeMock, onDebounceMock),
    );

    expect(result.current.currentValue).toBe("initial value");
    expect(onChangeMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.setCurrentValue("new value");
    });

    expect(result.current.currentValue).toBe("new value");
    expect(setValueMock).not.toHaveBeenCalled();
    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onDebounceMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(setValueMock).not.toHaveBeenCalled();
    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onDebounceMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(450);
    });

    expect(result.current.currentValue).toBe("new value");
    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith("new value");
    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onDebounceMock).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test("Should not create a timer", () => {
    const setValueMock = jest.fn();
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useDebounceStack<string>("initial value", setValueMock, null),
    );

    expect(result.current.currentValue).toBe("initial value");

    act(() => {
      result.current.setCurrentValue("new value");
    });

    expect(result.current.currentValue).toBe("new value");
    expect(setValueMock).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.currentValue).toBe("new value");
    expect(setValueMock).not.toHaveBeenCalled();

    act(() => {
      result.current.forceUpdate();
    });

    expect(result.current.currentValue).toBe("new value");
    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith("new value");
  });

  test("Check with string array", () => {
    const setValueMock = jest.fn();
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useDebounceStack<string[]>(["initial value"], setValueMock),
    );

    expect(result.current.currentValue).toStrictEqual(["initial value"]);

    act(() => {
      result.current.setCurrentValue(["new value"]);
    });

    expect(result.current.currentValue).toStrictEqual(["new value"]);
    expect(setValueMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.currentValue).toStrictEqual(["new value"]);
    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith(["new value"]);

    jest.useRealTimers();
  });

  test("Check with number", () => {
    const setValueMock = jest.fn();
    jest.useFakeTimers();
    const { result } = renderHook(() => useDebounceStack<number>(1, setValueMock));

    expect(result.current.currentValue).toBe(1);

    act(() => {
      result.current.setCurrentValue(2);
    });

    expect(result.current.currentValue).toBe(2);
    expect(setValueMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.currentValue).toBe(2);
    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith(2);

    jest.useRealTimers();
  });

  test("Check with object", async () => {
    const setValueMock = jest.fn();
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useDebounceStack<{ a: string; b: number }>({ a: "a", b: 1 }, setValueMock),
    );

    expect(result.current.currentValue).toStrictEqual({ a: "a", b: 1 });

    act(() => {
      result.current.setCurrentValue({ a: "b", b: 2 });
    });

    expect(result.current.currentValue).toStrictEqual({ a: "b", b: 2 });
    expect(setValueMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.currentValue).toStrictEqual({ a: "b", b: 2 });
    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith({ a: "b", b: 2 });

    jest.useRealTimers();
  });
});

describe("useDebounce with React", () => {
  test("Check update the same does not trigger", async () => {
    const setValueMock = jest.fn();
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    const ResetInput = ({
      actualValue,
      setActualValue,
    }: {
      actualValue: string;
      setActualValue: Dispatch<string>;
    }): JSX.Element => {
      const { currentValue, setCurrentValue, forceUpdate } = useDebounceStack<string>(
        actualValue,
        setActualValue,
      );
      return (
        <input
          data-testid='inp'
          value={currentValue ?? ""}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={() => forceUpdate()}
        />
      );
    };

    const ResetPanel = (): JSX.Element => {
      const [actualValue, setActualValue] = useState<string>("initial");
      useEffect(() => {
        setValueMock(actualValue);
      }, [actualValue]);
      return (
        <div>
          <ResetInput
            actualValue={actualValue}
            setActualValue={setActualValue}
          />
        </div>
      );
    };

    await act(async () => render(<ResetPanel />));
    const inp = screen.getByTestId("inp");
    await user.clear(inp);
    expect(inp).toHaveDisplayValue("");
    await user.type(inp, "new values");
    expect(inp).toHaveDisplayValue("new values");
    await act(async () => jest.runAllTimers());
    expect(setValueMock).toHaveBeenLastCalledWith("new values");

    await user.clear(inp);
    await user.type(inp, "blurred");
    await act(async () => fireEvent.blur(inp));
    expect(setValueMock).toHaveBeenLastCalledWith("blurred");

    jest.useRealTimers();
  });
});

describe("Check undo stack", () => {
  test("Should undo & redo", async () => {
    const setValueMock = jest.fn();
    jest.useFakeTimers();
    const { result } = renderHook(() => useDebounceStack<string>("a", setValueMock));

    expect(result.current.currentValue).toStrictEqual("a");

    act(() => result.current.setCurrentValue("b"));
    expect(result.current.currentValue).toStrictEqual("b");
    act(() => result.current.setCurrentValue("c"));
    expect(result.current.currentValue).toStrictEqual("c");
    act(() => result.current.setCurrentValue("d"));
    expect(result.current.currentValue).toStrictEqual("d");
    expect(setValueMock).not.toHaveBeenCalled();

    act(() => result.current.undo());
    expect(result.current.currentValue).toStrictEqual("c");
    act(() => result.current.undo());
    expect(result.current.currentValue).toStrictEqual("b");
    act(() => result.current.redo());
    expect(result.current.currentValue).toStrictEqual("c");

    act(() => result.current.redo());
    act(() => jest.advanceTimersByTime(500));
    expect(result.current.currentValue).toStrictEqual("d");
    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith("d");

    jest.useRealTimers();
  });
});

describe("Update to value", () => {
  const CustomUpdate = (): JSX.Element => {
    const [value, setValue] = useState<string>("before");
    const { currentValue, setCurrentValue, forceUpdate } = useDebounceStack(value, setValue, 500);
    return (
      <>
        <button
          data-testid='btn'
          onClick={() => setValue("after")}
        >
          Change
        </button>
        <input
          data-testid='input'
          value={currentValue ?? ""}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentValue(e.target.value);
          }}
          onBlur={() => forceUpdate()}
        />
      </>
    );
  };

  test("Update from above", async () => {
    const user = userEvent.setup({ delay: null });
    await act(async () => {
      render(<CustomUpdate />);
    });
    const testControl = screen.getByTestId("input");
    const btn = screen.getByTestId("btn");
    await act(async () => await user.type(testControl, "-"));
    expect(testControl).toHaveValue("before-");
    await act(async () => fireEvent.blur(testControl));
    expect(testControl).toHaveValue("before-");
    await act(async () => await user.click(btn));
    expect(testControl).toHaveValue("after");
  });
});
