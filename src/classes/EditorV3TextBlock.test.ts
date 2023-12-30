/* eslint-disable quotes */
import { EditorV3TextBlock } from "./EditorV3TextBlock";

// Load and read tests
describe("Check basic EditorV3TextBlock", () => {
  test("Load string", async () => {
    const testBlock = new EditorV3TextBlock("Helloworld");
    expect(testBlock.text).toEqual("Helloworld");
    expect(testBlock.toHtml().outerHTML).toEqual('<span class="aiev3-tb">Helloworld</span>');
    const testBlock2 = new EditorV3TextBlock("0");
    expect(testBlock2.text).toEqual("0");
    expect(testBlock2.jsonString).toEqual('{"text":"0"}');
    expect(testBlock2.toHtml().outerHTML).toEqual('<span class="aiev3-tb">0</span>');
  });

  test("Load string with style", async () => {
    const testBlock = new EditorV3TextBlock("Hello world\u00a0", "shiny");
    expect(testBlock.text).toEqual("Hello world\u00a0");
    expect(testBlock.toHtml().outerHTML).toEqual(
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello world&nbsp;</span>',
    );
  });

  test("Load span with style, check it equals itself", async () => {
    const testSpan = document.createElement("span");
    testSpan.className = "editorv3style-shiny";
    testSpan.dataset.styleName = "shiny";
    testSpan.innerHTML = "Hello world";
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual("Hello world");
    expect(testBlock.toHtml().outerHTML).toEqual(
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello world</span>',
    );
    expect(new EditorV3TextBlock(testBlock.toHtml().outerHTML)).toEqual(testBlock);
    expect(new EditorV3TextBlock(testBlock.toHtml())).toEqual(testBlock);
    expect(new EditorV3TextBlock(JSON.stringify(testBlock))).toEqual(testBlock);
    expect(new EditorV3TextBlock(testBlock.jsonString)).toEqual(testBlock);
  });

  test("Load span with no content", async () => {
    const testSpan = document.createElement("span");
    testSpan.textContent = null;
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual("");
    expect(testBlock.toHtml().outerHTML).toEqual('<span class="aiev3-tb">\u2009</span>');
  });

  test("Load text node", async () => {
    const testSpan = document.createTextNode("12.34");
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual("12.34");
    expect(testBlock.toHtml().outerHTML).toEqual('<span class="aiev3-tb">12.34</span>');
  });

  test("Load EditorV3TextBlock", async () => {
    const firstBlock = new EditorV3TextBlock("Hello world", "shiny");
    const testBlock = new EditorV3TextBlock(firstBlock);
    expect(testBlock).toEqual(firstBlock);
  });

  test("Load Object", async () => {
    const obj = { text: "Hello world" };
    const testBlock = new EditorV3TextBlock(obj);
    expect(testBlock).toEqual({ text: "Hello world" });

    const obj2 = { text: "Hello world", style: "shiny" };
    const testBlock2 = new EditorV3TextBlock(obj2);
    expect(testBlock2).toEqual({
      text: "Hello world",
      style: "shiny",
    });
  });
});

describe("Check markdown output on text block", () => {
  test("Markdown is correctly shown", async () => {
    const testBlock = new EditorV3TextBlock({ text: "Hello world", style: "shiny" });
    expect(testBlock.toMarkdown()).toEqual("<<shiny::Hello world>>");
  });
  test("Markdown is correctly shown for defaultStyle", async () => {
    const testBlock = new EditorV3TextBlock({ text: "Hello world", style: "defaultStyle" });
    expect(testBlock.toMarkdown()).toEqual("<<Hello world>>");
  });
});
