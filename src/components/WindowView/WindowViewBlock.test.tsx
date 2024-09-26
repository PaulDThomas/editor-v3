import { render, screen } from "@testing-library/react";
import { EditorV3Line } from "../../classes";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { IEditorV3Line } from "../../classes/interface";
import { WindowViewContext, WindowViewContextProps } from "./WindowView";
import { WindowViewBlock } from "./WindowViewBlock";

jest.mock("./WindowViewSelectOptions");

describe("WindowViewBlock", () => {
  const mockContext: WindowViewContextProps = {
    id: "test",
    lines: [],
    dispatch: jest.fn(),
    editable: true,
    contentProps: {
      ...defaultContentProps,
      styles: { shiny: { color: "pink" } },
    },
    includeAt: false,
  };

  test("No render without textBlock", async () => {
    const mockDispatch = jest.fn();
    const mockLine = new EditorV3Line("test").data;
    render(
      <WindowViewContext.Provider
        value={{
          ...mockContext,
          dispatch: mockDispatch,
          lines: [mockLine],
        }}
      >
        <WindowViewBlock
          lineIndex={0}
          blockIndex={1}
        />
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
    expect(screen.queryByText("Style")).not.toBeInTheDocument();
    expect(screen.queryByText("Label")).not.toBeInTheDocument();
    expect(screen.queryByText("Text")).not.toBeInTheDocument();
    expect(screen.queryByText("Available options")).not.toBeInTheDocument();
  });

  test("Basic render for text", async () => {
    const mockDispatch = jest.fn();
    const mockLine: IEditorV3Line = { textBlocks: [{ text: "test", type: "text" }] };
    render(
      <WindowViewContext.Provider
        value={{
          ...mockContext,
          dispatch: mockDispatch,
          lines: [mockLine],
        }}
      >
        <WindowViewBlock
          lineIndex={0}
          blockIndex={0}
        />
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByLabelText("Type")).toBeInTheDocument();
    expect(screen.queryByLabelText("Style")).toBeInTheDocument();
    expect(screen.queryByLabelText("Label")).toBeInTheDocument();
    expect(screen.queryByLabelText("Text")).toBeInTheDocument();
    expect(screen.queryByLabelText("Available options")).not.toBeInTheDocument();

    expect(screen.queryByLabelText("Type")).toHaveDisplayValue("Text");
    expect(screen.queryByLabelText("Style")).toHaveDisplayValue(["None"]);
    expect(screen.queryByLabelText("Label")).toHaveDisplayValue([""]);
    expect(screen.queryByLabelText("Text")).toHaveDisplayValue(["test"]);
  });

  test("Select render and update", async () => {
    const mockSet = jest.fn();
    const mockLine: IEditorV3Line = {
      textBlocks: [
        {
          text: "current",
          type: "select",
          availableOptions: [
            { text: "post", data: { noStyle: "true" } },
            { text: "current", data: { noStyle: "true" } },
            { text: "future", data: { noStyle: "true" } },
          ],
        },
      ],
    };
    render(
      <WindowViewContext.Provider
        value={{
          ...mockContext,
          dispatch: mockSet,
          lines: [mockLine],
        }}
      >
        <WindowViewBlock
          lineIndex={0}
          blockIndex={0}
        />
      </WindowViewContext.Provider>,
    );
    const availableOptionsInput = screen.queryByLabelText("Available options") as HTMLInputElement;
    expect(availableOptionsInput).toBeInTheDocument();
    expect(availableOptionsInput).toHaveDisplayValue(["post\ncurrent\nfuture"]);
  });
});
