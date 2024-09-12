import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { WindowViewLine } from "./WindowViewLine";
import { textBlockFactory } from "../../classes/textBlockFactory";
import { EditorV3Line } from "../../classes/EditorV3Line";

describe("WindowViewLine", () => {
  const user = userEvent.setup({ delay: null });

  test("No render without textBlock", async () => {
    const mockSet = jest.fn();
    const mockLine = new EditorV3Line({ textBlocks: [] });
    render(
      <WindowViewLine
        contentProps={defaultContentProps}
        lineIndex={2}
        line={mockLine}
        editable={true}
        setLine={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    const mockLine = new EditorV3Line({
      textBlocks: [
        { text: "test1 ", type: "text", style: "green" },
        { text: "test2", type: "text", style: "blue" },
      ],
    });
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={mockLine}
        editable={true}
        setLine={mockSet}
      />,
    );
    expect(screen.queryByText("Line 1")).toBeInTheDocument();
    expect(screen.queryAllByLabelText("Style").length).toEqual(2);
    const textInput0 = screen.queryAllByLabelText("Text")[0] as HTMLInputElement;
    expect(textInput0).toBeInTheDocument();
    await user.type(textInput0, " - Bamford's header scores!!! ⚽ ");
    fireEvent.blur(textInput0);
    expect(mockSet.mock.calls[0][0].data).toEqual(
      new EditorV3Line({
        textBlocks: [
          { text: "test1  - Bamford's header scores!!! ⚽ ", type: "text", style: "green" },
          { text: "test2", type: "text", style: "blue" },
        ],
      }).data,
    );
  });
});

describe("Add and remove text blocks", () => {
  const user = userEvent.setup({ delay: null });
  test("Add first block", async () => {
    const mockSet = jest.fn();
    const mockLine = new EditorV3Line({ textBlocks: [] });
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={mockLine}
        editable={true}
        setLine={mockSet}
      />,
    );
    const addBlock = screen.queryByLabelText("Add text block") as Element;
    expect(addBlock).toBeInTheDocument();
    await user.click(addBlock);
    expect(mockSet).toHaveBeenLastCalledWith(
      new EditorV3Line({ textBlocks: [{ text: "", type: "text" }] }),
    );
  });

  test("Add block at the end", async () => {
    const mockSet = jest.fn();
    const mockLine = new EditorV3Line({
      textBlocks: [textBlockFactory({ text: "@test1", type: "at" })],
    });
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={mockLine}
        editable={true}
        setLine={mockSet}
      />,
    );
    const addBlock = screen.queryAllByLabelText("Add text block")[1] as Element;
    expect(addBlock).toBeInTheDocument();
    await user.click(addBlock);
    expect(mockSet.mock.calls[0][0].data).toEqual(
      new EditorV3Line({
        textBlocks: [
          { text: "@test1", type: "at" },
          { text: "", type: "text" },
        ],
      }).data,
    );
  });

  test("Remove text block", async () => {
    const mockSet = jest.fn();
    const mockLine = new EditorV3Line({ textBlocks: [{ text: "@test1", type: "at" }] });
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={mockLine}
        editable={true}
        setLine={mockSet}
      />,
    );
    const removeBlock = screen.queryByLabelText("Remove text block") as Element;
    expect(removeBlock).toBeInTheDocument();
    await user.click(removeBlock);
    expect(mockSet.mock.calls[0][0].data).toEqual(new EditorV3Line({ textBlocks: [] }).data);
  });
});
