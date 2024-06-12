import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultContentProps } from "../../classes/defaultContentProps";
import { WindowViewLine } from "./WindowViewLine";

describe("WindowViewLine", () => {
  const user = userEvent.setup();

  test("No render without textBlock", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewLine
        contentProps={defaultContentProps}
        lineIndex={2}
        line={{ textBlocks: [] }}
        setLine={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={{
          textBlocks: [
            { text: "test1 ", type: "text", style: "green" },
            { text: "test2", type: "text", style: "blue" },
          ],
        }}
        setLine={mockSet}
      />,
    );
    expect(screen.queryByText("Line 1")).toBeInTheDocument();
    expect(screen.queryAllByLabelText("Style").length).toEqual(2);
    const textInput0 = screen.queryAllByLabelText("Text")[0] as HTMLInputElement;
    expect(textInput0).toBeInTheDocument();
    await user.type(textInput0, " - Bamford's header scores!!! ⚽ ");
    fireEvent.blur(textInput0);
    expect(mockSet).toHaveBeenLastCalledWith({
      textBlocks: [
        { text: "test1  - Bamford's header scores!!! ⚽ ", type: "text", style: "green" },
        { text: "test2", type: "text", style: "blue" },
      ],
    });
  });
});

describe("Add and remove text blocks", () => {
  test("Add first block", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={{ textBlocks: [] }}
        setLine={mockSet}
      />,
    );
    const addBlock = screen.queryByLabelText("Add text block") as Element;
    expect(addBlock).toBeInTheDocument();
    await userEvent.click(addBlock);
    expect(mockSet).toHaveBeenLastCalledWith({ textBlocks: [{ text: "", type: "text" }] });
  });

  test("Add block at the end", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={{ textBlocks: [{ text: "@test1", type: "at" }] }}
        setLine={mockSet}
      />,
    );
    const addBlock = screen.queryAllByLabelText("Add text block")[1] as Element;
    expect(addBlock).toBeInTheDocument();
    await userEvent.click(addBlock);
    expect(mockSet).toHaveBeenLastCalledWith({
      textBlocks: [
        { text: "@test1", type: "at" },
        { text: "", type: "text" },
      ],
    });
  });

  test("Remove text block", async () => {
    const mockSet = jest.fn();
    render(
      <WindowViewLine
        contentProps={{
          ...defaultContentProps,
          allowNewLine: true,
          styles: { green: { color: "green" }, blue: { color: "blue" } },
        }}
        lineIndex={0}
        line={{ textBlocks: [{ text: "@test1", type: "at" }] }}
        setLine={mockSet}
      />,
    );
    const removeBlock = screen.queryByLabelText("Remove text block") as Element;
    expect(removeBlock).toBeInTheDocument();
    await userEvent.click(removeBlock);
    expect(mockSet).toHaveBeenLastCalledWith({ textBlocks: [] });
  });
});
