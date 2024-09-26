/* eslint-disable quotes */
import { EditorV3AtBlock } from "./EditorV3AtBlock";
import { EditorV3Line } from "./EditorV3Line";
import { EditorV3SelectBlock, IEditorV3SelectBlock } from "./EditorV3SelectBlock";
import { textBlockFactory } from "./textBlockFactory";

describe("Text block factory tests", () => {
  test("Load string", async () => {
    const testBlock = textBlockFactory({ text: "Helloworld" });
    expect(testBlock.text).toEqual("Helloworld");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual('<span class="aiev3-tb">Helloworld</span>');
    const testBlock2 = textBlockFactory({ text: "0" });
    expect(testBlock2.text).toEqual("0");
    expect(testBlock2.data).toEqual({ text: "0", type: "text" });
    const tempDiv2 = document.createElement("div");
    tempDiv2.appendChild(testBlock2.toHtml({}));
    expect(tempDiv2.innerHTML).toEqual('<span class="aiev3-tb">0</span>');
  });

  test("Load string with style", async () => {
    const testBlock = textBlockFactory({ text: "Hello world\u00a0" }, { style: "shiny" });
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
    expect(textBlockFactory(testBlock)).toEqual(testBlock);
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
    const firstBlock = textBlockFactory({ text: "Hello world" }, { style: "shiny" });
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

  test("Bad document fragment", async () => {
    const frag = new DocumentFragment();
    const div = document.createElement("div");
    div.textContent = "Hello world";
    frag.appendChild(div);
    expect(() => textBlockFactory(frag)).toThrow();
  });
});

describe("Check markdown output on text block", () => {
  test("Markdown is correctly shown", async () => {
    const testBlock = textBlockFactory({ text: "Hello world", style: "shiny" });
    expect(testBlock.toMarkdown()).toEqual("(~(shiny::Hello world)~)");
  });
  test("Markdown is correctly shown for defaultStyle", async () => {
    const testBlock = textBlockFactory({ text: "Hello world", style: "defaultStyle" });
    expect(testBlock.toMarkdown()).toEqual("(~(Hello world)~)");
  });
});

describe("Check at correctly loaded, and eats its own tail", () => {
  test("Load at", async () => {
    const testBlock = textBlockFactory({ text: "@Hello", type: "at" });
    expect(testBlock).toBeInstanceOf(EditorV3AtBlock);
    expect(testBlock.data).toEqual({ text: "@Hello", type: "at" });
    expect(testBlock.toMarkdown()).toEqual("@[@Hello**{}@]");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toMatchSnapshot();
    expect(textBlockFactory(testBlock.toHtml({})).data).toEqual({
      ...testBlock.data,
      isLocked: true,
    });

    expect(testBlock.data).toEqual({ text: "@Hello", type: "at" });
    expect(textBlockFactory(testBlock).data).toEqual(testBlock.data);
    expect(textBlockFactory(testBlock)).toMatchSnapshot();

    expect(testBlock.data).toEqual({ text: "@Hello", type: "at" });
    expect(textBlockFactory(testBlock).data).toEqual(testBlock.data);
  });

  test("Load select", async () => {
    const testData: IEditorV3SelectBlock = {
      text: "Hello",
      type: "select",
      availableOptions: [
        { text: "Hello", data: { noStyle: "true" } },
        { text: "World", data: { style: "shiny" } },
      ],
    };
    const testBlock = textBlockFactory(testData);
    expect(testBlock).toBeInstanceOf(EditorV3SelectBlock);
    expect(testBlock.data).toEqual({ ...testData, isLocked: true });
    // expect(testBlock.toMarkdown()).toEqual("");

    const tempDiv = document.createElement("div");
    const toHtml = testBlock.toHtml({});
    tempDiv.appendChild(toHtml);
    expect(tempDiv.innerHTML).toMatchSnapshot();
    expect(textBlockFactory(testBlock.toHtml({})).data).toEqual({
      ...testBlock.data,
      isLocked: true,
    });
    expect(textBlockFactory(tempDiv.firstChild as HTMLSpanElement).data).toEqual({
      ...testBlock.data,
      isLocked: true,
    });
  });

  test("Load with with spaces", async () => {
    const testBlock = textBlockFactory({ text: "  Hello  world  " });
    expect(testBlock.data).toEqual({ text: "  Hello  world  ", type: "text" });
    expect(testBlock.toMarkdown()).toEqual("  Hello  world  ");
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb">&nbsp;</span><span class="aiev3-tb">&nbsp;</span>' +
        '<span class="aiev3-tb">Hello&nbsp;</span>' +
        '<span class="aiev3-tb">&nbsp;</span>' +
        '<span class="aiev3-tb">world&nbsp;</span>' +
        '<span class="aiev3-tb">&nbsp;</span>',
    );
    tempDiv.classList.add("aiev3-line", "left");
    const line = new EditorV3Line(tempDiv);
    expect(line.textBlocks).toEqual([testBlock]);
  });

  test("Load word with style", async () => {
    const testBlock = textBlockFactory(
      { type: "at", text: "@Hello" },
      { style: "shiny", label: "label" },
    );
    expect(testBlock.data).toEqual({
      text: "@Hello",
      style: "shiny",
      label: "label",
      type: "at",
      isLocked: undefined,
    });
    expect(testBlock.toMarkdown()).toEqual("@[shiny::label::@Hello**{}@]");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toMatchSnapshot();
    expect(textBlockFactory(testBlock.toHtml({})).data).toEqual({
      ...testBlock.data,
      isLocked: true,
    });

    expect(testBlock.data).toEqual({ text: "@Hello", style: "shiny", type: "at", label: "label" });
    expect(textBlockFactory(testBlock).data).toEqual(testBlock.data);
    expect(textBlockFactory(testBlock)).toMatchSnapshot();
  });

  test("Load span with style and space", async () => {
    const testSpan = document.createElement("span");
    testSpan.className = "editorv3style-shiny";
    testSpan.dataset.styleName = "shiny";
    testSpan.dataset.type = "at";
    testSpan.title = "label";
    testSpan.innerHTML = "@Hello world";
    const testBlock = textBlockFactory(testSpan);
    testBlock.setActive(true);

    expect(testBlock.data).toEqual({
      text: "@Hello world",
      label: "label",
      style: "shiny",
      type: "at",
    });
    expect(testBlock.toMarkdown()).toEqual("@[shiny::label::@Hello world**{}@]");
    expect(testBlock.mergeKey).toEqual("at:shiny:label");

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(testBlock.toHtml({}));
    expect(tempDiv.innerHTML).toEqual(
      '<span class="aiev3-tb at-block editorv3style-shiny is-active show-dropdown" data-type="at" data-style-name="shiny" title="label">@Hello world</span>',
    );
    expect(textBlockFactory(testBlock.toHtml({})).data).toEqual(testBlock.data);
    expect(textBlockFactory(testBlock.toHtml({}))).toMatchSnapshot();
  });
});
