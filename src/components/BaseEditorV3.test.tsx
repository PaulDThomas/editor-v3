import { render, screen } from "@testing-library/react";
import { defaultMarkdownSettings } from "../classes/defaultMarkdownSettings";
import { EditorV3Content } from "../classes/EditorV3Content";
import { EditorV3Align } from "../classes/interface";
import { BaseEditorV3 } from "./BaseEditorv3";

const mockContent = new EditorV3Content("34.45\n\nx.xx", {
  allowMarkdown: true,
  allowNewLine: false,
  decimalAlignPercent: 80,
  markdownSettings: defaultMarkdownSettings,
  showMarkdown: false,
  styles: { shiny: { color: "pink", fontWeight: "700" } },
  textAlignment: EditorV3Align.decimal,
});
mockContent.applyStyle("shiny", { startLine: 2, startChar: 0, endLine: 2, endChar: 4 });

describe("BaseEditorV3", () => {
  test("Draw and fire cursor events", async () => {
    render(
      <div data-testid="container">
        <BaseEditorV3
          label="Base editor test"
          id="test-editor"
          input={mockContent}
          style={{
            minWidth: "200px",
            width: "600px",
            maxWidth: "800px",
            minHeight: "100px",
            height: "200px",
            maxHeight: "400px",
          }}
          customStyleMap={{ shiny: { color: "pink", fontWeight: "700" } }}
          allowNewLine
          resize
        />
      </div>,
    );
    const container = (await screen.findByTestId("container")).children[0] as HTMLDivElement;
    expect(screen.queryByText("Base editor test")).toBeInTheDocument();
    expect(screen.queryByText("Base editor test")).toBeInTheDocument();
    expect(container.outerHTML).toMatchSnapshot();
  });
});
