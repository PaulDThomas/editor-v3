/* eslint-disable quotes */
import { textBlockFactory } from "./textBlockFactory";

describe("Text block factory tests", () => {
  test("Load string", async () => {
    const testBlock = textBlockFactory("Helloworld");
    expect(testBlock.text).toEqual("Helloworld");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb">Helloworld</span>');
    const testBlock2 = textBlockFactory("0");
    expect(testBlock2.text).toEqual("0");
    expect(testBlock2.jsonString).toEqual('{"text":"0","type":"text"}');
    const tempDiv2 = document.createElement("div");
    tempDiv2.appendChild(testBlock2.toHtml({}));
    expect(tempDiv2.innerHTML).toEqual('<span class="aiev3-tb">0</span>');
  });

  test("Load string with style", async () => {
    const testBlock = textBlockFactory("Hello world\u00a0", "shiny");
    expect(testBlock.text).toEqual("Hello world\u00a0");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
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
    const testBlock = textBlockFactory(testSpan);
    expect(testBlock.text).toEqual("Hello world");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">world</span>',
    );
    expect(textBlockFactory(testBlock.toHtml({}))).toEqual(testBlock);
    expect(textBlockFactory(JSON.stringify(testBlock))).toEqual(testBlock);
    expect(textBlockFactory(testBlock.jsonString)).toEqual(testBlock);
  });

  test("Load span with no content", async () => {
    const testSpan = document.createElement("span");
    testSpan.textContent = null;
    const testBlock = textBlockFactory(testSpan);
    expect(testBlock.text).toEqual("");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb">\u2009</span>');
  });

  test("Load text node", async () => {
    const testSpan = document.createTextNode("12.34");
    const testBlock = textBlockFactory(testSpan);
    expect(testBlock.text).toEqual("12.34");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb">12.34</span>');
  });

  test("Load EditorV3TextBlock", async () => {
    const firstBlock = textBlockFactory("Hello world", "shiny");
    const testBlock = textBlockFactory(firstBlock);
    expect(testBlock.data).toEqual(firstBlock.data);
  });

  test("Load Object", async () => {
    const obj = { text: "Hello world" };
    const testBlock = textBlockFactory(obj);
    expect(testBlock.data).toEqual({ text: "Hello world", type: "text" });

    const obj2 = { text: "Hello world", style: "shiny" };
    const testBlock2 = textBlockFactory(obj2);
    expect(testBlock2.data).toEqual({
      text: "Hello world",
      style: "shiny",
      type: "text",
    });
  });
});

describe("Check markdown output on text block", () => {
  test("Markdown is correctly shown", async () => {
    const testBlock = textBlockFactory({ text: "Hello world", style: "shiny" });
    expect(testBlock.toMarkdown()).toEqual("<<shiny::Hello world>>");
  });
  test("Markdown is correctly shown for defaultStyle", async () => {
    const testBlock = textBlockFactory({ text: "Hello world", style: "defaultStyle" });
    expect(testBlock.toMarkdown()).toEqual("<<Hello world>>");
  });
});

describe("Check at correctly loaded, and eats its own tail", () => {
  test("Load word", async () => {
    const testBlock = textBlockFactory("@Hello");
    expect(testBlock.data).toEqual({ text: "@Hello", type: "at" });
    expect(testBlock.toMarkdown()).toEqual("@[@Hello@]");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb at-block is-locked" data-type="at" data-is-locked="true">@Hello</span>',
    );
    expect(textBlockFactory(testBlock.toHtml({})).data).toEqual({
      ...testBlock.data,
      isLocked: true,
    });

    expect(testBlock.data).toEqual({ text: "@Hello", type: "at" });
    expect(textBlockFactory(testBlock.data)).toEqual(testBlock);

    expect(testBlock.jsonString).toEqual('{"text":"@Hello","type":"at"}');
    expect(textBlockFactory(testBlock.jsonString)).toEqual(testBlock);
  });

  test("Load word with style", async () => {
    const testBlock = textBlockFactory("@Hello", "shiny");
    expect(testBlock.data).toEqual({ text: "@Hello", style: "shiny", type: "at" });
    expect(testBlock.toMarkdown()).toEqual("@[shiny::@Hello@]");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb at-block editorv3style-shiny is-locked" data-type="at" data-style-name="shiny" data-is-locked="true">@Hello</span>',
    );
    expect(textBlockFactory(testBlock.toHtml({})).data).toEqual({
      ...testBlock.data,
      isLocked: true,
    });

    expect(testBlock.data).toEqual({ text: "@Hello", style: "shiny", type: "at" });
    expect(textBlockFactory(testBlock.data)).toEqual(testBlock);

    expect(testBlock.jsonString).toEqual('{"text":"@Hello","style":"shiny","type":"at"}');
    expect(textBlockFactory(testBlock.jsonString)).toEqual(testBlock);
  });

  test("Load span with style and space", async () => {
    const testSpan = document.createElement("span");
    testSpan.className = "editorv3style-shiny";
    testSpan.dataset.styleName = "shiny";
    testSpan.innerHTML = "@Hello world";
    const testBlock = textBlockFactory(testSpan);
    testBlock.setActive(true);

    expect(testBlock.data).toEqual({ text: "@Hello world", style: "shiny", type: "at" });
    expect(testBlock.toMarkdown()).toEqual("@[shiny::@Hello world@]");
    expect(testBlock.typeStyle).toEqual("at:shiny");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb at-block editorv3style-shiny is-active" data-type="at" data-style-name="shiny">@Hello world</span>',
    );
    expect(textBlockFactory(testBlock.toHtml({})).data).toEqual(testBlock.data);
  });
});
