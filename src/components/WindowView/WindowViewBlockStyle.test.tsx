import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";
import { WindowViewContext, WindowViewContextProps } from "./WindowView";
import { UPDATE_BLOCK_STYLE } from "./windowViewReducer";
import { defaultContentProps } from "../../classes/defaultContentProps";

describe("WindowViewBlockStyle", () => {
  const user = userEvent.setup({ delay: null });
  const mockContext: WindowViewContextProps = {
    id: "test",
    lines: [
      {
        textBlocks: [{ text: "test", type: "text", label: "label", style: "Blue" }],
      },
    ],
    dispatch: jest.fn(),
    editable: true,
    contentProps: {
      ...defaultContentProps,
      styles: { Green: { isNotAvailable: false, color: "green" } },
    },
    includeAt: false,
  };

  test("No render without textBlock", async () => {
    render(
      <WindowViewContext.Provider value={mockContext}>
        <WindowViewBlockStyle
          lineIndex={0}
          blockIndex={1}
        />
        ,
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Style")).not.toBeInTheDocument();
  });

  test("Disabled render", async () => {
    render(
      <WindowViewContext.Provider value={{ ...mockContext, editable: false }}>
        <WindowViewBlockStyle
          lineIndex={0}
          blockIndex={0}
        />
        ,
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Style")).toBeInTheDocument();
    const select = screen.queryByLabelText("Style") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select).toBeDisabled();
  });

  test("Basic render & select", async () => {
    const mockDispatch = jest.fn();
    const styles = {
      Green: { isNotAvailable: false, color: "green" },
      Blue: { isNotAvailable: true, color: "blue" },
    };
    render(
      <WindowViewContext.Provider
        value={{
          ...mockContext,
          contentProps: {
            ...mockContext.contentProps,
            styles,
          },
          dispatch: mockDispatch,
        }}
      >
        <WindowViewBlockStyle
          lineIndex={0}
          blockIndex={0}
        />
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Style")).toBeInTheDocument();
    const select = screen.queryByLabelText("Style") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select).toHaveDisplayValue(["Blue"]);
    expect(select.querySelector("option[value='2-Blue']")).toBeDisabled();
    await user.selectOptions(select, "Green");
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      operation: UPDATE_BLOCK_STYLE,
      lineIndex: 0,
      blockIndex: 0,
      blockStyle: "Green",
    });
  });
});
