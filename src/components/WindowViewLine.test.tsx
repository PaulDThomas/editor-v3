import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultContentProps } from "../classes/defaultContentProps";
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
            { text: "test1 ", style: "green" },
            { text: "test2", style: "blue" },
          ],
        }}
        setLine={mockSet}
      />,
    );
    expect(screen.queryByText("Line 1")).toBeInTheDocument();
    expect(screen.queryAllByLabelText("Style").length).toEqual(2);
    const textInput0 = screen.queryAllByLabelText("Text")[0] as HTMLInputElement;
    await user.type(textInput0, " - Bamford's header scores!!! ⚽ ");
    fireEvent.blur(textInput0);
    expect(mockSet).toHaveBeenLastCalledWith({
      textBlocks: [
        { text: "test1  - Bamford's header scores!!! ⚽ ", style: "green" },
        { text: "test2", style: "blue" },
      ],
    });
  });
});
