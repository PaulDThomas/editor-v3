import { renderHook, act, render, screen } from "@testing-library/react";
import { useDebounce } from "./useDebounce";
import { Dispatch, useEffect, useState } from "react";
import userEvent from "@testing-library/user-event";

describe("useDebounce", () => {
  test("Should return the initial value, and change current value", async () => {
    const { result, rerender } = renderHook(() => useDebounce<string>("initial value", jest.fn()));
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
    jest.useFakeTimers();
    const { result } = renderHook(() => useDebounce<string>("initial value", setValueMock, 950));

    expect(result.current.currentValue).toBe("initial value");

    act(() => {
      result.current.setCurrentValue("new value");
    });

    expect(result.current.currentValue).toBe("new value");
    expect(setValueMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(setValueMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(450);
    });

    expect(result.current.currentValue).toBe("new value");
    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith("new value");

    jest.useRealTimers();
  });

  test("Check with string array", () => {
    const setValueMock = jest.fn();
    jest.useFakeTimers();
    const { result } = renderHook(() => useDebounce<string[]>(["initial value"], setValueMock));

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
    const { result } = renderHook(() => useDebounce<number>(1, setValueMock));

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
      useDebounce<{ a: string; b: number }>({ a: "a", b: 1 }, setValueMock),
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
      const { currentValue, setCurrentValue } = useDebounce<string>(actualValue, (ret) =>
        setActualValue(ret),
      );
      return (
        <input
          data-testid='inp'
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
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

    jest.useRealTimers();
  });
});
