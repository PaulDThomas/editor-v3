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
          data-testid="inp"
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
          data-testid="btn"
          onClick={() => setValue("after")}
        >
          Change
        </button>
        <input
          data-testid="input"
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

describe("Check comparison function", () => {
  const user = userEvent.setup({ delay: null });
  const mockOnChange = jest.fn();
  const mockOnDebounce = jest.fn();
  const Tracker = (): JSX.Element => {
    const [value, setValue] = useState<{ a: number; b: string }>({ a: 1, b: "b is 1" });
    const { currentValue, setCurrentValue, stack, index } = useDebounceStack<{
      a: number;
      b: string;
    }>(
      value,
      setValue,
      0,
      mockOnChange,
      mockOnDebounce,
      (oldValue, newValue) => oldValue?.b === newValue?.b,
    );

    return (
      <>
        <input
          data-testid="A"
          disabled
          type="number"
          value={currentValue?.a ?? 0}
        />
        <input
          data-testid="B"
          disabled
          type="string"
          value={currentValue?.b ?? "b is not set"}
        />
        <div data-testid="STACK">
          {stack?.map((v, i) => <div key={i}>{JSON.stringify(v)}</div>)}
        </div>
        <input
          data-testid="INDEX"
          disabled
          type="number"
          value={index}
        />
        <button
          data-testid="plus-1"
          onClick={() => {
            setCurrentValue({ a: value.a + 1, b: value.b });
          }}
        />
        <button
          data-testid="to-string"
          onClick={() => setCurrentValue({ a: value.a, b: `b is ${value.a}` })}
        />
        <div data-testid="VALUE">{JSON.stringify(value)}</div>
      </>
    );
  };

  test("Should use comparison function", async () => {
    await act(async () => render(<Tracker />));
    await user.click(screen.getByTestId("plus-1"));
    // First change should not update stack
    expect(screen.getByTestId("A")).toHaveValue(2);
    expect(screen.getByTestId("B")).toHaveValue("b is 1");
    expect(screen.getByTestId("INDEX")).toHaveValue(0);
    expect(screen.getByTestId("STACK")).toHaveTextContent(/{"a":2,"b":"b is 1"}/);
    expect(mockOnChange).toHaveBeenLastCalledWith({ a: 2, b: "b is 1" }, 0, [
      { a: 2, b: "b is 1" },
    ]);
    expect(mockOnDebounce).toHaveBeenLastCalledWith({ a: 2, b: "b is 1" });
    // Second change should update stack
    await user.click(screen.getByTestId("to-string"));
    expect(screen.getByTestId("A")).toHaveValue(2);
    expect(screen.getByTestId("B")).toHaveValue("b is 2");
    expect(screen.getByTestId("INDEX")).toHaveValue(1);
    expect(screen.getByTestId("STACK")).toHaveTextContent(/{"a":2,"b":"b is 1"}/);
    expect(screen.getByTestId("STACK")).toHaveTextContent(/{"a":2,"b":"b is 2"}/);
    expect(mockOnChange).toHaveBeenLastCalledWith({ a: 2, b: "b is 2" }, 1, [
      { a: 2, b: "b is 1" },
      { a: 2, b: "b is 2" },
    ]);
    expect(mockOnDebounce).toHaveBeenLastCalledWith({ a: 2, b: "b is 2" });
  });
});
