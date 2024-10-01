import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowViewBlockText } from "./WindowViewBlockText";
import { WindowViewContext, WindowViewContextProps } from "./WindowView";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { UPDATE_BLOCK_LABEL, UPDATE_BLOCK_TEXT } from "./windowViewReducer";

describe("WindowViewBlockStyle", () => {
  const user = userEvent.setup({ delay: null });
  const mockContext: WindowViewContextProps = {
    id: "test",
    lines: [
      {
        textBlocks: [{ text: "test", type: "text", label: "label" }],
      },
    ],
    dispatch: jest.fn(),
    editable: true,
    contentProps: defaultContentProps,
    includeAt: false,
  };

  test("No render without textBlock", async () => {
    render(
      <WindowViewContext.Provider value={mockContext}>
        <WindowViewBlockText
          lineIndex={0}
          blockIndex={1}
        />
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Text")).not.toBeInTheDocument();
  });

  test("Disabled render", async () => {
    const mockDispatch = jest.fn;
    render(
      <WindowViewContext.Provider
        value={{ ...mockContext, dispatch: mockDispatch, editable: false }}
      >
        <WindowViewBlockText
          label
          lineIndex={0}
          blockIndex={0}
        />
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Label")).toBeInTheDocument();
    const input = screen.queryByLabelText("Label") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
  });

  test("Basic render & update label", async () => {
    const mockDispatch = jest.fn();
    render(
      <WindowViewContext.Provider value={{ ...mockContext, dispatch: mockDispatch }}>
        <WindowViewBlockText
          label
          lineIndex={0}
          blockIndex={0}
        />
      </WindowViewContext.Provider>,
    );
    const input = screen.queryByLabelText("Label") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveDisplayValue(["label"]);
    await user.clear(input);
    await user.type(input, "Hello");
    expect(mockDispatch).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(mockDispatch).toHaveBeenCalledWith({
      operation: UPDATE_BLOCK_LABEL,
      lineIndex: 0,
      blockIndex: 0,
      blockLabel: "Hello",
    });
  });

  test("Basic render & update text", async () => {
    const mockDispatch = jest.fn();
    render(
      <WindowViewContext.Provider value={{ ...mockContext, dispatch: mockDispatch }}>
        <WindowViewBlockText
          lineIndex={0}
          blockIndex={0}
        />
      </WindowViewContext.Provider>,
    );
    const input = screen.queryByLabelText("Text") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveDisplayValue(["test"]);
    await user.clear(input);
    await user.type(input, "Hello");
    expect(mockDispatch).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(mockDispatch).toHaveBeenCalledWith({
      operation: UPDATE_BLOCK_TEXT,
      lineIndex: 0,
      blockIndex: 0,
      blockText: "Hello",
    });
  });
});
