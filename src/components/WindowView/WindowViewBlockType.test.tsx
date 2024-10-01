import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { EditorV3Line } from "../../classes";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { WindowViewContext, WindowViewContextProps } from "./WindowView";
import { WindowViewBlockType } from "./WindowViewBlockType";
import { UPDATE_BLOCK_TYPE } from "./windowViewReducer";

describe("WindowViewBlockType", () => {
  const user = userEvent.setup({ delay: null });
  const mockContext: WindowViewContextProps = {
    id: "test",
    lines: [new EditorV3Line({ textBlocks: [{ text: "test", type: "at" }] }).data],
    dispatch: jest.fn(),
    editable: true,
    contentProps: {
      ...defaultContentProps,
      styles: { shiny: { color: "pink" } },
    },
    includeAt: true,
  };

  test("No render without textBlock", async () => {
    render(
      <WindowViewContext.Provider value={mockContext}>
        <WindowViewBlockType
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
        <WindowViewBlockType
          lineIndex={0}
          blockIndex={0}
        />
        ,
      </WindowViewContext.Provider>,
    );
    const select = screen.queryByLabelText("Type") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select).toBeInTheDocument();
    expect(select).toBeDisabled();
  });

  test("Basic render & select", async () => {
    const mockDispatch = jest.fn();
    await act(async () =>
      render(
        <WindowViewContext.Provider value={{ ...mockContext, dispatch: mockDispatch }}>
          <WindowViewBlockType
            lineIndex={0}
            blockIndex={0}
          />
        </WindowViewContext.Provider>,
      ),
    );
    expect(screen.queryByText("Type")).toBeInTheDocument();
    const select = screen.queryByLabelText("Type") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select).toHaveDisplayValue("At");
    expect(select.querySelector("option[value='2-at']")).toBeDisabled();
    await user.selectOptions(select, "Text");
    expect(mockDispatch).toHaveBeenCalledWith({
      operation: UPDATE_BLOCK_TYPE,
      lineIndex: 0,
      blockIndex: 0,
      blockType: "text",
    });
  });
});
