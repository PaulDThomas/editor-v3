import { EditorV3TextBlock } from "./EditorV3TextBlock";

// Load and read tests
describe("Check basic EditorV3TextBlock", () => {
  test("Load EditorV3TextBlock", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello world",
      style: "shiny",
      lineStartPosition: 10,
    });
    expect(testBlock.data).toEqual({ text: "Hello world", style: "shiny", type: "text" });
    expect(new EditorV3TextBlock(testBlock).data).toEqual(testBlock.data);
    expect(testBlock.lineStartPosition).toEqual(10);
    expect(testBlock.lineEndPosition).toEqual(21);
    expect(testBlock.typeStyle).toEqual("text:shiny");
    // eslint-disable-next-line quotes
    expect(testBlock.jsonString).toEqual('{"text":"Hello world","style":"shiny","type":"text"}');
    // Eat your own tail
    expect(new EditorV3TextBlock(testBlock).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.data).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.toHtml({})).data).toEqual(testBlock.data);
  });
});

describe("Non-object loads", () => {
  test("Load document fragment", async () => {
    const frag = new DocumentFragment();
    const span1 = document.createElement("span");
    const span2 = document.createElement("span");
    span1.textContent = "Hello\u00a0\u200c";
    span2.textContent = "world";
    frag.appendChild(span1);
    frag.appendChild(span2);
    const testBlock = new EditorV3TextBlock(frag, {
      style: "bold",
      isLocked: true,
      lineStartPosition: 99,
    });
    testBlock.setActive(true);
    testBlock.isLocked = undefined;
    expect(testBlock.isActive).toEqual(true);
    expect(testBlock.data).toEqual({
      text: "Hello world",
      style: "bold",
      type: "text",
    });
    expect(testBlock.lineStartPosition).toEqual(99);
    expect(testBlock.lineEndPosition).toEqual(110);
    // Eat your own tail
    expect(new EditorV3TextBlock(testBlock).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.data).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.toHtml({})).data).toEqual(testBlock.data);
  });

  test("Load span", async () => {
    const span = document.createElement("span");
    span.textContent = "Hello world";
    span.dataset.styleName = "shiny";
    span.dataset.type = "text";
    span.dataset.isLocked = "true";
    const testBlock = new EditorV3TextBlock(span);
    expect(testBlock.data).toEqual({
      text: "Hello world",
      style: "shiny",
      type: "text",
      isLocked: true,
    });
    // Eat your own tail
    expect(new EditorV3TextBlock(testBlock).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.data).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.toHtml({})).data).toEqual(testBlock.data);
  });

  test("Load bad document fragment", async () => {
    const frag = new DocumentFragment();
    const span1 = document.createElement("span");
    const span2 = document.createElement("span");
    span1.textContent = "Hello\u00a0\u200c";
    span2.textContent = "world";
    frag.appendChild(span1);
    span1.dataset.styleName = "bold";
    span1.dataset.type = "at";
    span1.dataset.isLocked = "true";
    frag.appendChild(span2);
    span2.dataset.styleName = "shiny";
    // const list = document.createElement("ul");
    // list.appendChild(frag);
    expect(() => new EditorV3TextBlock(frag)).toThrow(
      "EditorV3TextBlock:Constructor:Multiple types in fragment, " +
        "Multiple styles in fragment, " +
        "Multiple isLocked in fragment",
    );
  });
});

describe("Should render an at block in the HTML", () => {
  test("Create HTML with an @ in the middle", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello\u00a0massive and impressive @world",
      style: "shiny",
    });
    expect(testBlock.wordPositions).toEqual([
      { line: -1, startChar: 0, endChar: 5, isLocked: false },
      { line: -1, startChar: 6, endChar: 13, isLocked: false },
      { line: -1, startChar: 14, endChar: 17, isLocked: false },
      { line: -1, startChar: 18, endChar: 28, isLocked: false },
      { line: -1, startChar: 29, endChar: 35, isLocked: false },
    ]);
    // Expect text/markdown to render one block
    expect(testBlock.toHtml({}).textContent).toEqual(
      "Hello\u00a0massive\u00a0\u200cand\u00a0\u200cimpressive\u00a0\u200c@world\u200c",
    );
    expect(testBlock.toMarkdown()).toEqual("<<shiny::Hello\u00a0massive and impressive @world>>");
    // Expect HTML to split block into two spans
    const tempDiv = document.createElement("div");
    testBlock.toHtml({ currentEl: tempDiv });
    expect(tempDiv.innerHTML).toEqual(
      // eslint-disable-next-line quotes
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello&nbsp;massive&nbsp;\u200c</span>' +
        // eslint-disable-next-line quotes
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">and&nbsp;\u200c</span>' +
        // eslint-disable-next-line quotes
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">impressive&nbsp;\u200c</span>' +
        // eslint-disable-next-line quotes
        '<span class="aiev3-tb at-block is-locked editorv3style-shiny" data-type="at" data-is-locked="true" data-style-name="shiny">@world\u200c</span>',
    );
    // Expect HTML not to split
    const tempDiv2 = document.createElement("div");
    testBlock.toHtml({ currentEl: tempDiv2, doNotSplitWordSpans: true });
    expect(tempDiv2.innerHTML).toEqual(
      // eslint-disable-next-line quotes
      '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">Hello&nbsp;massive&nbsp;\u200c</span>' +
        // eslint-disable-next-line quotes
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">and&nbsp;\u200c</span>' +
        // eslint-disable-next-line quotes
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">impressive&nbsp;\u200c</span>' +
        // eslint-disable-next-line quotes
        '<span class="aiev3-tb at-block is-locked editorv3style-shiny" data-type="at" data-is-locked="true" data-style-name="shiny">@world\u200c</span>',
    );
  });
});

describe("Should throw trying to render an at block in the HTML", () => {
  test("Create HTML with an @ at the start", async () => {
    const testBlock = new EditorV3TextBlock({ text: "@Hello world", type: "at" });
    expect(() => testBlock.toHtml({})).toThrow("Use EditorV3AtBlock for at blocks");
  });
});

describe("Should render html chars :(", () => {
  test("Lets see 2009", async () => {
    const div = document.createElement("div");
    const text = new Text("\u2009");
    div.appendChild(text);
    expect(div.outerHTML).toEqual("<div>\u2009</div>");
  });
  test("Lets see 202f", async () => {
    const div = document.createElement("div");
    const text = new Text("\u202f");
    div.appendChild(text);
    expect(div.outerHTML).toEqual("<div>\u202f</div>");
  });

  test("Lets see 00a0", async () => {
    const div = document.createElement("div");
    const text = new Text("\u00a0");
    div.appendChild(text);
    expect(div.outerHTML).toEqual("<div>&nbsp;</div>");
  });
  test("Lets see 200c", async () => {
    const span = document.createElement("span");
    const text = new Text("\u200c");
    span.appendChild(text);
    expect(span.outerHTML).toEqual("<span>\u200c</span>");
    expect(span.textContent).toEqual("\u200c");
    expect(span.innerHTML).toEqual("\u200c");
  });
});
