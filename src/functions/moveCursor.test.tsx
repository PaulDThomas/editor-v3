import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorV3Align } from "../classes/interface";
import { getCaretPosition } from "./getCaretPosition";
import { EditorV3 } from "../components/EditorV3";
import { mockContent } from "../components/EditorV3.test";

describe("Move cursor tests", () => {
  test("Movements", async () => {
    const user = userEvent.setup();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid="container">
          <EditorV3
            id="test-editor"
            input={mockContent.jsonString}
            setText={mockSetText}
            style={{ width: "200px" }}
            textAlignment={EditorV3Align.decimal}
            allowNewLine
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            resize
          />
        </div>,
      );
    });
    // Get component
    const container = (await screen.findByTestId("container")).querySelector(
      "#test-editor",
    ) as HTMLDivElement;
    // Go to start of text
    await user.click(container.querySelector("span") as HTMLSpanElement);
    await user.keyboard("{Control>}{End}{/Control}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 4,
      isCollapsed: true,
      endLine: 2,
      endChar: 4,
    });
    await user.keyboard("{Control>}{Home}{/Control}{Home}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: true,
      endLine: 0,
      endChar: 0,
    });
    await user.keyboard("{End}{Shift>}{Home}{Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 0,
      endChar: 5,
    });
    await user.keyboard("{Shift>}{End}{/Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 0,
      isCollapsed: false,
      endLine: 2,
      endChar: 4,
    });
    await user.keyboard("{Home}{ArrowRight}{ArrowRight}{Shift>}{ArrowRight}{/Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 2,
      isCollapsed: false,
      endLine: 0,
      endChar: 3,
    });
    await user.keyboard("{Control>}{ArrowDown}{/Control}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 3,
      isCollapsed: true,
      endLine: 2,
      endChar: 3,
    });
    await user.keyboard("{Shift>}{ArrowUp}{ArrowLeft}{/Shift}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 5,
      isCollapsed: false,
      endLine: 2,
      endChar: 3,
    });
    await user.keyboard("{ArrowLeft}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 0,
      startChar: 4,
      isCollapsed: true,
      endLine: 0,
      endChar: 4,
    });
    await user.keyboard("{ArrowUp}{ArrowDown}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 1,
      startChar: 0,
      isCollapsed: true,
      endLine: 1,
      endChar: 0,
    });
    await user.keyboard("{ArrowRight}");
    expect(getCaretPosition(container)).toEqual({
      startLine: 2,
      startChar: 0,
      isCollapsed: true,
      endLine: 2,
      endChar: 0,
    });
    await user.keyboard(
      "{ArrowDown}{Control>}{ArrowLeft}{ArrowUp}{ArrowRight}{ArrowRight}{/Control}.",
    );
  });
});
