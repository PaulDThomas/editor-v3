/* eslint-disable quotes */
import { EditorV3TextBlock } from "./EditorV3TextBlock";

// Load and read tests
describe("Check basic EditorV3TextBlock", () => {
  test("Load string", async () => {
    const testBlock = new EditorV3TextBlock("Helloworld");
    expect(testBlock.text).toEqual("Helloworld");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb">Helloworld</span>');
    const testBlock2 = new EditorV3TextBlock("0");
    expect(testBlock2.text).toEqual("0");
    expect(testBlock2.jsonString).toEqual('{"text":"0","type":"text"}');
    const tempDiv2 = document.createElement("div");
    tempDiv2.appendChild(testBlock2.toHtml());
    expect(tempDiv2.innerHTML).toEqual('<span class="aiev3-tb">0</span>');
  });

  test("Load string with style", async () => {
    const testBlock = new EditorV3TextBlock("Hello world\u00a0", "shiny");
    expect(testBlock.text).toEqual("Hello world\u00a0");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">world&nbsp;</span>',
    );
  });

  test("Load span with style, check it equals itself", async () => {
    const testSpan = document.createElement("span");
    testSpan.className = "editorv3style-shiny";
    testSpan.dataset.styleName = "shiny";
    testSpan.innerHTML = "Hello world";
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual("Hello world");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">world</span>',
    );
    expect(new EditorV3TextBlock(testBlock.toHtml())).toEqual(testBlock);
    expect(new EditorV3TextBlock(JSON.stringify(testBlock))).toEqual(testBlock);
    expect(new EditorV3TextBlock(testBlock.jsonString)).toEqual(testBlock);
  });

  test("Load span with no content", async () => {
    const testSpan = document.createElement("span");
    testSpan.textContent = null;
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual("");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb">\u2009</span>');
  });

  test("Load text node", async () => {
    const testSpan = document.createTextNode("12.34");
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual("12.34");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb">12.34</span>');
  });

  test("Load EditorV3TextBlock", async () => {
    const firstBlock = new EditorV3TextBlock("Hello world", "shiny");
    const testBlock = new EditorV3TextBlock(firstBlock);
    expect(testBlock.data).toEqual(firstBlock.data);
  });

  test("Load Object", async () => {
    const obj = { text: "Hello world" };
    const testBlock = new EditorV3TextBlock(obj);
    expect(testBlock.data).toEqual({ text: "Hello world", type: "text" });

    const obj2 = { text: "Hello world", style: "shiny" };
    const testBlock2 = new EditorV3TextBlock(obj2);
    expect(testBlock2.data).toEqual({
      text: "Hello world",
      style: "shiny",
      type: "text",
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

describe("Check at correctly loaded, and eats its own tail", () => {
  test("Load word", async () => {
    const testBlock = new EditorV3TextBlock("@Hello");
    expect(testBlock.data).toEqual({ text: "@Hello", type: "at" });
    expect(testBlock.toMarkdown()).toEqual("@[@Hello@]");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb at-block">@Hello</span>');
    expect(new EditorV3TextBlock(testBlock.toHtml())).toEqual(testBlock);

    expect(testBlock.data).toEqual({ text: "@Hello", type: "at" });
    expect(new EditorV3TextBlock(testBlock.data)).toEqual(testBlock);

    expect(testBlock.jsonString).toEqual('{"text":"@Hello","type":"at"}');
    expect(new EditorV3TextBlock(testBlock.jsonString)).toEqual(testBlock);
  });

  test("Load word with style", async () => {
    const testBlock = new EditorV3TextBlock("@Hello", "shiny");
    expect(testBlock.data).toEqual({ text: "@Hello", style: "shiny", type: "at" });
    expect(testBlock.toMarkdown()).toEqual("@[shiny::@Hello@]");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb at-block editorv3style-shiny" data-style-name="shiny">@Hello</span>',
    );
    expect(new EditorV3TextBlock(testBlock.toHtml())).toEqual(testBlock);

    expect(testBlock.data).toEqual({ text: "@Hello", style: "shiny", type: "at" });
    expect(new EditorV3TextBlock(testBlock.data)).toEqual(testBlock);

    expect(testBlock.jsonString).toEqual('{"text":"@Hello","style":"shiny","type":"at"}');
    expect(new EditorV3TextBlock(testBlock.jsonString)).toEqual(testBlock);
  });

  test("Load span with style and space", async () => {
    const testSpan = document.createElement("span");
    testSpan.className = "editorv3style-shiny";
    testSpan.dataset.styleName = "shiny";
    testSpan.innerHTML = "@Hello world";
    const testBlock = new EditorV3TextBlock(testSpan);

    expect(testBlock.data).toEqual({ text: "@Hello world", style: "shiny", type: "at" });
    expect(testBlock.toMarkdown()).toEqual("@[shiny::@Hello world@]");
    expect(testBlock.typeStyle).toEqual("at:shiny");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb at-block editorv3style-shiny" data-style-name="shiny">@Hello&nbsp;world</span>',
    );
    expect(new EditorV3TextBlock(testBlock.toHtml())).toEqual(testBlock);
  });

  test("Create HTML with an @ in the middle", async () => {
    const testBlock = new EditorV3TextBlock("Hello @world", "shiny");
    // Expect text/markdown to render one block
    expect(testBlock.toHtml().textContent).toEqual("Hello\u00A0@world");
    expect(testBlock.toMarkdown()).toEqual("<<shiny::Hello @world>>");
    // Expect HTML to split block into two spans
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml());
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello&nbsp;</span>' +
        '<span class="aiev3-tb at-block editorv3style-shiny" data-style-name="shiny">@world</span>',
    );
  });
});
