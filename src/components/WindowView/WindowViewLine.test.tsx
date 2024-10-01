import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { EditorV3Line } from "../../classes/EditorV3Line";
import { textBlockFactory } from "../../classes/textBlockFactory";
import { WindowViewContext } from "./WindowView";
import { WindowViewLine } from "./WindowViewLine";
import { ADD_BLOCK, REMOVE_BLOCK, UPDATE_BLOCK_TEXT } from "./windowViewReducer";

jest.mock("./WindowViewSelectOptions");

describe("WindowViewLine", () => {
  const user = userEvent.setup({ delay: null });
  test("No render without textBlock", async () => {
    const mockLine = new EditorV3Line({ textBlocks: [] });
    render(
      <WindowViewContext.Provider
        value={{
          id: "test",
          lines: [mockLine],
          dispatch: jest.fn(),
          editable: true,
          contentProps: defaultContentProps,
          includeAt: false,
        }}
      >
        <WindowViewLine lineIndex={2} />
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockDispatch = jest.fn();
    const mockLine = new EditorV3Line({
      textBlocks: [
        { text: "test1 ", type: "text", style: "green" },
        { text: "test2", type: "text", style: "blue" },
      ],
    });
    render(
      <WindowViewContext.Provider
        value={{
          id: "test",
          lines: [mockLine],
          dispatch: mockDispatch,
          editable: true,
          contentProps: {
            ...defaultContentProps,
            styles: { green: { color: "green" }, blue: { color: "blue" } },
            allowNewLine: true,
          },
          includeAt: false,
        }}
      >
        <WindowViewLine lineIndex={0} />
      </WindowViewContext.Provider>,
    );
    expect(screen.queryByText("Line 1")).toBeInTheDocument();
    expect(screen.queryAllByLabelText("Style").length).toEqual(2);
    const textInput0 = screen.queryAllByLabelText("Text")[0] as HTMLInputElement;
    expect(textInput0).toBeInTheDocument();
    await user.type(textInput0, " - Bamford's header scores!!! ⚽ ");
    fireEvent.blur(textInput0);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      operation: UPDATE_BLOCK_TEXT,
      lineIndex: 0,
      blockIndex: 0,
      blockText: "test1  - Bamford's header scores!!! ⚽ ",
    });
  });
});

describe("Add and remove text blocks", () => {
  const user = userEvent.setup({ delay: null });
  const mockContext = {
    id: "test",
    lines: [],
    dispatch: jest.fn(),
    editable: true,
    contentProps: {
      ...defaultContentProps,
      styles: { green: { color: "green" }, blue: { color: "blue" } },
      allowNewLine: true,
    },
    includeAt: false,
  };

  test("Add first block", async () => {
    const mockDispatch = jest.fn();
    const mockLine = new EditorV3Line({ textBlocks: [] }).data;
    render(
      <WindowViewContext.Provider
        value={{ ...mockContext, dispatch: mockDispatch, lines: [mockLine] }}
      >
        <WindowViewLine lineIndex={0} />
      </WindowViewContext.Provider>,
    );
    const addBlock = screen.queryByLabelText("Add text block") as Element;
    expect(addBlock).toBeInTheDocument();
    await user.click(addBlock);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      operation: ADD_BLOCK,
      lineIndex: 0,
      blockIndex: 0,
    });
  });

  test("Add block at the end", async () => {
    const mockDispatch = jest.fn();
    const mockLine = new EditorV3Line({
      textBlocks: [textBlockFactory({ text: "@test1", type: "at" })],
    }).data;
    render(
      <WindowViewContext.Provider
        value={{
          ...mockContext,
          dispatch: mockDispatch,
          lines: [mockLine],
        }}
      >
        <WindowViewLine lineIndex={0} />
      </WindowViewContext.Provider>,
    );
    const addBlock = screen.queryAllByLabelText("Add text block")[1] as Element;
    expect(addBlock).toBeInTheDocument();
    await user.click(addBlock);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      operation: ADD_BLOCK,
      lineIndex: 0,
      blockIndex: 1,
    });
  });

  test("Remove text block", async () => {
    const mockDispatch = jest.fn();
    const mockLine = new EditorV3Line({ textBlocks: [{ text: "@test1", type: "at" }] });
    render(
      <WindowViewContext.Provider
        value={{ ...mockContext, dispatch: mockDispatch, lines: [mockLine] }}
      >
        <WindowViewLine lineIndex={0} />
      </WindowViewContext.Provider>,
    );
    const removeBlock = screen.queryByLabelText("Remove text block") as Element;
    expect(removeBlock).toBeInTheDocument();
    await user.click(removeBlock);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      operation: REMOVE_BLOCK,
      lineIndex: 0,
      blockIndex: 0,
    });
  });
});
