import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Content, EditorV3Line } from "../classes";
import { WindowViewLine } from "./WindowViewLine";

describe("WindowViewLine", () => {
  const user = userEvent.setup();

  test("No render without textBlock", async () => {
    const mockSet = jest.fn();
    const content = new EditorV3Content("test");
    render(
      <WindowViewLine
        content={content}
        lineIndex={2}
        setLine={mockSet}
      />,
    );
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });

  test("Basic render & update", async () => {
    const mockSet = jest.fn();
    const content = new EditorV3Content(
      {
        lines: [
          {
            textBlocks: [
              { text: "test1 ", style: "green" },
              { text: "test2", style: "blue" },
            ],
          },
        ],
      },
      { allowNewLine: true, styles: { green: { color: "green" }, blue: { color: "blue" } } },
    );
    render(
      <WindowViewLine
        content={content}
        lineIndex={0}
        setLine={mockSet}
      />,
    );
    expect(screen.queryByText("Line 1")).toBeInTheDocument();
    expect(screen.queryAllByLabelText("Style").length).toEqual(2);
    const textInput0 = screen.queryAllByLabelText("Text")[0] as HTMLInputElement;
    await user.type(textInput0, " - Bamford's header scores!!! ⚽ ");
    fireEvent.blur(textInput0);
    const call0 = mockSet.mock.calls[0][0];
    expect(call0).toBeInstanceOf(EditorV3Line);
    expect(call0.lineText).toEqual("test1  - Bamford's header scores!!! ⚽ test2");
  });
});
