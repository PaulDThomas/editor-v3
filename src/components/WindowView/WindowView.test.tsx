import { ContextWindowStack } from "@asup/context-menu";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content } from "../../classes";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { WindowView } from "./WindowView";
import * as dbs from "../../hooks/useDebounceStack";

jest.mock("./WindowViewSelectOptions");

describe("WindowView", () => {
  const user = userEvent.setup({ delay: null });

  test("Hidden window", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    render(
      <WindowView
        id="test-window"
        showWindowView={false}
        setShowWindowView={mockSetShow}
        state={{
          content: new EditorV3Content("test"),
          focus: false,
          editable: true,
        }}
        setState={mockSetState}
      />,
    );
    expect(screen.queryByText("Editor contents")).not.toBeInTheDocument();
  });

  test("Basic render, and check buttons", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test");
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
            editable: true,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    expect(screen.queryByText("Editor contents")).toBeInTheDocument();
    expect(screen.queryByLabelText("Undo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Redo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Close window")).toBeInTheDocument();

    await user.click(screen.queryByLabelText("Close window") as Element);
    expect(mockSetShow).toHaveBeenCalledWith(false);
  });

  test("Update line", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test");
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
            editable: true,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    const textInput = screen.queryByLabelText("Text") as HTMLInputElement;
    await user.type(textInput, " - Summerville's overhead kick hits the back of the net!!! ⚽ ");
    expect(mockSetState).not.toHaveBeenCalled();
    await user.click(screen.queryByLabelText("Close") as Element);
    expect(mockSetState).toHaveBeenCalled();
  });
});

describe("Add and remove lines", () => {
  const user = userEvent.setup({ delay: null });
  test("Add new first line", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test", { ...defaultContentProps, allowNewLine: true });
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
            editable: true,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    const addLine = screen.queryAllByLabelText("Add line")[0] as Element;
    expect(addLine).toBeInTheDocument();
    await user.click(addLine);
    await user.click(screen.getByLabelText("Close"));
    expect(mockSetState).toHaveBeenCalledTimes(1);
    const calls = mockSetState.mock.calls[0][0];
    expect(calls.content).toBeInstanceOf(EditorV3Content);
    expect(calls.content.lines.length).toEqual(2);
    expect(calls.content.lines[0].lineText).toEqual("");
    expect(calls.content.lines[1].lineText).toEqual("test");
  });

  test("Add new line in the middle", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test\nhello\nworld", {
      ...defaultContentProps,
      allowNewLine: true,
    });
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
            editable: true,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    const addLine = screen.queryAllByLabelText("Add line")[1] as Element;
    expect(addLine).toBeInTheDocument();
    await user.click(addLine);
    await user.click(screen.getByLabelText("Close"));
    expect(mockSetState).toHaveBeenCalledTimes(1);
    const calls = mockSetState.mock.calls[0][0];
    expect(calls.content).toBeInstanceOf(EditorV3Content);
    expect(calls.content.lines.length).toEqual(4);
    expect(calls.content.lines[0].lineText).toEqual("test");
    expect(calls.content.lines[1].lineText).toEqual("");
    expect(calls.content.lines[2].lineText).toEqual("hello");
    expect(calls.content.lines[3].lineText).toEqual("world");
  });

  test("Remove line", async () => {
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test\nhello\nworld", {
      ...defaultContentProps,
      allowNewLine: true,
    });
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
            editable: true,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    screen.debug();
    const removeLine = screen.queryAllByLabelText("Remove line")[1] as Element;
    expect(removeLine).toBeInTheDocument();
    await user.click(removeLine);
    await user.click(screen.getByLabelText("Close"));
    expect(mockSetState).toHaveBeenCalledTimes(1);
    const calls = mockSetState.mock.calls[0][0];
    expect(calls.content).toBeInstanceOf(EditorV3Content);
    expect(calls.content.lines.length).toEqual(2);
    expect(calls.content.lines[0].lineText).toEqual("test");
    expect(calls.content.lines[1].lineText).toEqual("world");
  });

  test("Check undo/redo", async () => {
    const mockUndo = jest.fn();
    const mockRedo = jest.fn();
    jest.spyOn(dbs, "useDebounceStack").mockImplementation((currentValue, setCurrentValue) => ({
      currentValue,
      setCurrentValue,
      undo: mockUndo,
      redo: mockRedo,
      forceUpdate: jest.fn(),
      stack: null,
      index: 0,
    }));
    const mockSetState = jest.fn();
    const mockSetShow = jest.fn();
    const content = new EditorV3Content("test\nhello\nworld", {
      ...defaultContentProps,
      allowNewLine: true,
    });
    render(
      <ContextWindowStack>
        <WindowView
          id="test-window"
          showWindowView={true}
          setShowWindowView={mockSetShow}
          state={{
            content,
            focus: false,
            editable: true,
          }}
          setState={mockSetState}
        />
      </ContextWindowStack>,
    );
    await user.click(screen.getByLabelText("Undo"));
    expect(mockUndo).toHaveBeenCalledTimes(1);
    await user.click(screen.getByLabelText("Redo"));
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });
});
