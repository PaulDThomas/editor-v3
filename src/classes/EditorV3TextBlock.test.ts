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
    expect(testBlock.mergeKey).toEqual("-:text:shiny:");
    expect(testBlock.data).toEqual({ text: "Hello world", style: "shiny", type: "text" });
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
    span1.textContent = "Hello\u00a0";
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
    span.title = "This is a title";
    const testBlock = new EditorV3TextBlock(span);
    expect(testBlock.data).toEqual({
      text: "Hello world",
      label: "This is a title",
      style: "shiny",
      type: "text",
    });
    // Eat your own tail
    expect(new EditorV3TextBlock(testBlock).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.data).data).toEqual(testBlock.data);
    expect(new EditorV3TextBlock(testBlock.toHtml({})).data).toEqual(testBlock.data);
  });

  test("Load bad document fragment", () => {
    const frag = new DocumentFragment();
    const span1 = document.createElement("span");
    const span2 = document.createElement("span");
    span1.textContent = "Hello\u00a0";
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
      "Hello\u00a0massive\u00a0and\u00a0impressive\u00a0@world",
    );
    expect(testBlock.toMarkdown()).toEqual("(~(shiny::Hello\u00a0massive and impressive @world)~)");
    // Expect HTML to split block into two spans
    const tempDiv = document.createElement("div");
    testBlock.toHtml({ currentEl: tempDiv });
    expect(tempDiv.innerHTML).toMatchSnapshot();
    // Expect HTML not to split
    const tempDiv2 = document.createElement("div");
    testBlock.toHtml({ currentEl: tempDiv2, doNotSplitWordSpans: true });
    expect(tempDiv2.innerHTML).toMatchSnapshot();
  });
});

describe("Should throw trying to render an at block in the HTML", () => {
  test("Create HTML with an @ at the start", async () => {
    const testBlock = new EditorV3TextBlock({ text: "@Hello world", type: "at" });
    expect(() => testBlock.toHtml({})).toThrow("Use correct class for non-text blocks");
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
    const text = new Text("");
    span.appendChild(text);
    expect(span.outerHTML).toEqual("<span></span>");
    expect(span.textContent).toEqual("");
    expect(span.innerHTML).toEqual("");
  });
});

describe("Should throw trying to create the wrong type", () => {
  test("Fail to create at block", async () => {
    expect(() => {
      const badThing = new EditorV3TextBlock({ text: "Hello world", type: "select" });
      badThing.toHtml({});
    }).toThrow("Use correct class for non-text blocks");
  });
});

describe("Locked text block", () => {
  test("Create and render locked text block", async () => {
    const testBlock = new EditorV3TextBlock({ text: "Locked block", isLocked: true, style: "red" });
    expect(testBlock.data).toEqual({
      text: "Locked block",
      type: "text",
      isLocked: true,
      style: "red",
    });
    expect(testBlock.isLocked).toEqual(true);
    const tempDiv = document.createElement("div");
    testBlock.toHtml({ currentEl: tempDiv }, { isLocked: true });
    expect(tempDiv.innerHTML).toMatchSnapshot();
    expect(testBlock.wordPositions).toEqual([
      { line: -1, startChar: 0, endChar: 12, isLocked: true },
    ]);
  });

  test("Apply style", async () => {
    const testBlock = new EditorV3TextBlock({ text: "Locked block", style: "red" });
    const tempDiv = document.createElement("div");
    testBlock.toHtml({ currentEl: tempDiv }, { color: "red" });
    expect(tempDiv.innerHTML).toMatchSnapshot();
  });
});

describe("Markdown text block", () => {
  test("Render markdown with no label or style", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello",
    });
    const result = testBlock.toMarkdown();
    expect(result).toEqual("Hello");
    const eatOwnTail = new EditorV3TextBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });

  test("Render markdown with label", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello",
      label: "world",
    });
    const result = testBlock.toMarkdown();
    expect(result).toEqual("(~(::world::Hello)~)");
    const eatOwnTail = new EditorV3TextBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });

  test("Render markdown with style", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello",
      style: "shiny",
    });
    const result = testBlock.toMarkdown();
    expect(result).toEqual("(~(shiny::Hello)~)");
    const eatOwnTail = new EditorV3TextBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });

  test("Render markdown with default style", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello",
      style: "defaultStyle",
    });
    const result = testBlock.toMarkdown();
    expect(result).toEqual("(~(Hello)~)");
    const eatOwnTail = new EditorV3TextBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });

  test("Render markdown with label and style", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello",
      style: "shiny",
      label: "world",
    });
    const result = testBlock.toMarkdown();
    expect(result).toEqual("(~(shiny::world::Hello)~)");
    const eatOwnTail = new EditorV3TextBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });

  test("Render markdown with label and default style", async () => {
    const testBlock = new EditorV3TextBlock({
      text: "Hello",
      style: "defaultStyle",
      label: "world",
    });
    const result = testBlock.toMarkdown();
    expect(result).toEqual("(~(defaultStyle::world::Hello)~)");
    const eatOwnTail = new EditorV3TextBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });
});
