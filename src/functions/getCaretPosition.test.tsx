import { act, render, screen } from "@testing-library/react";
import { EditorV3 } from "../components/EditorV3";
import { getCaretPosition } from "./getCaretPosition";

describe("No selection", () => {
  test("Should return null", async () => {
    await act(async () => {
      render(
        <div data-testid="container">
          <EditorV3
            id="test-editor"
            input={"Hello children!"}
            setObject={jest.fn()}
            style={{ width: "200px" }}
            allowNewLine
            customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
            allowMarkdown
          />
        </div>,
      );
    });
    // Get component
    const container = screen.getByTestId("container").children[0] as HTMLDivElement;
    expect(container).toBeInTheDocument();
    expect(getCaretPosition(container)).toBeNull();
  });
});
