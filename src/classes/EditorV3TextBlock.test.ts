import { EditorV3TextBlock } from "./EditorV3TextBlock";

// Load and read tests
describe("Check basic EditorV3TextBlock", () => {
  test("Load EditorV3TextBlock", async () => {
    const testBlock = new EditorV3TextBlock({ text: "Hello world", style: "shiny" });
    expect(testBlock.data).toEqual({ text: "Hello world", style: "shiny", type: "text" });
    expect(new EditorV3TextBlock(testBlock).data).toEqual(testBlock.data);
  });
});

describe("Should render an at block in the HTML", () => {
  test("Create HTML with an @ in the middle", async () => {
    const testBlock = new EditorV3TextBlock({ text: "Hello @world", style: "shiny" });
    expect(testBlock.wordPositions).toEqual([
      { line: -1, startChar: 0, endChar: 5, isLocked: false },
      { line: -1, startChar: 6, endChar: 12, isLocked: false },
    ]);
    // Expect text/markdown to render one block
    expect(testBlock.toHtml({}).textContent).toEqual("Hello\u00A0@world");
    expect(testBlock.toMarkdown()).toEqual("<<shiny::Hello @world>>");
    // Expect HTML to split block into two spans
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual(
      // eslint-disable-next-line quotes
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello&nbsp;</span>' +
        // eslint-disable-next-line quotes
        '<span class="aiev3-tb at-block is-locked editorv3style-shiny" data-is-locked="true" data-style-name="shiny">@world</span>',
    );
  });
});

describe("Should throw trying to render an at block in the HTML", () => {
  test("Create HTML with an @ at the start", async () => {
    const testBlock = new EditorV3TextBlock({ text: "@Hello world", type: "at" });
    expect(() => testBlock.toHtml({})).toThrow("Use EditorV3AtBlock for at blocks");
  });
});
