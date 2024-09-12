import { EditorV3Content } from "./EditorV3Content";
import { defaultContentProps } from "./defaultContentProps";
import { EditorV3Line } from "./EditorV3Line";
import { EditorV3Align, EditorV3ContentPropsInput } from "./interface";
import { textBlockFactory } from "./textBlockFactory";

// Load and read tests
describe("Check basic EditorV3Content", () => {
  test("Load basic string, test getters and setters", async () => {
    const testContent = new EditorV3Content("12.34");
    expect(testContent.text).toEqual("12.34");
    const div = document.createElement("div");
    div.append(testContent.toHtml({}));
    expect(div.innerHTML).toMatchSnapshot();
    expect(testContent.decimalAlignPercent).toEqual(60);
    expect(testContent.textAlignment).toEqual("left");
    testContent.textAlignment = EditorV3Align.decimal;
    expect(testContent.textAlignment).toEqual("decimal");
    testContent.decimalAlignPercent = 30;
    expect(testContent.decimalAlignPercent).toEqual(30);
    testContent.styles = { shiny: { color: "pink" } };
    expect(testContent.data).toEqual({
      lines: [
        {
          textBlocks: [{ text: "12.34", type: "text" }],
        },
      ],
      contentProps: {
        textAlignment: "decimal",
        decimalAlignPercent: 30,
        styles: { shiny: { color: "pink" } },
      },
    });
  });

  test("Load 0 lines", async () => {
    // eslint-disable-next-line quotes
    const testContent = new EditorV3Content('{"lines":[]}');
    expect(testContent.text).toEqual("");
    expect(testContent.lines.length).toEqual(1);
    expect(testContent.data).toEqual({
      lines: [{ textBlocks: [{ text: "", type: "text" }] }],
    });
  });

  test("Load string with style info", async () => {
    const testProps: EditorV3ContentPropsInput = {
      styles: { shiny: { color: "pink" } },
      textAlignment: EditorV3Align.center,
      decimalAlignPercent: 80,
    };
    const testContent = new EditorV3Content("34.56", testProps);
    expect(testContent.text).toEqual("34.56");
    expect(testContent.styles).toEqual({ shiny: { color: "pink" } });
    expect(testContent.decimalAlignPercent).toEqual(80);
    expect(testContent.textAlignment).toEqual("center");
    expect(testContent.lines.map((l) => l.data)).toEqual([
      {
        contentProps: testProps,
        textBlocks: [{ text: "34.56", type: "text" }],
      },
    ]);
    expect(testContent.data).toEqual({
      contentProps: testProps,
      lines: [
        {
          textBlocks: [{ text: "34.56", type: "text" }],
        },
      ],
    });
    expect(testContent.markdownText).toEqual("34.56");
    const div = document.createElement("div");
    div.append(testContent.toHtml({}));
    expect(div.innerHTML).toMatchSnapshot();

    // Check self equivalence
    const read1 = new EditorV3Content(testContent.data);
    expect(read1.data).toEqual(testContent.data);
    const read2 = new EditorV3Content(div);
    expect(read2.data).toEqual(testContent.data);
    expect(new EditorV3Content(div.innerHTML).data).toEqual(testContent.data);

    // Repeat as decimal
    testContent.textAlignment = EditorV3Align.decimal;
    expect(new EditorV3Content(testContent).data).toEqual(testContent.data);
    div.innerHTML = "";
    div.appendChild(testContent.toHtml({}));
    expect(new EditorV3Content(div.innerHTML).data).toEqual(testContent.data);
  });

  test("Load multiline string", async () => {
    const testContent = new EditorV3Content("Hello\n.World\u2009");
    expect(testContent.text).toEqual("Hello\n.World");
    expect(testContent.data).toEqual({
      lines: [
        {
          textBlocks: [{ text: "Hello", type: "text" }],
        },
        {
          textBlocks: [{ text: ".World", type: "text" }],
        },
      ],
    });
    const div = document.createElement("div");
    div.append(testContent.toHtml({}));
    expect(div.innerHTML).toMatchSnapshot();

    // Updates need to flow through
    testContent.decimalAlignPercent = 55;
    testContent.styles = { shiny: { color: "pink" } };
    testContent.textAlignment = EditorV3Align.decimal;
    expect(testContent.text).toEqual("Hello\n.World");
    expect(testContent.data).toEqual({
      contentProps: {
        decimalAlignPercent: 55,
        styles: { shiny: { color: "pink" } },
        textAlignment: "decimal",
      },
      lines: [
        {
          textBlocks: [{ text: "Hello", type: "text" }],
        },
        {
          textBlocks: [{ text: ".World", type: "text" }],
        },
      ],
    });
    div.innerHTML = "";
    div.appendChild(testContent.toHtml({}));
    expect(div.innerHTML).toMatchSnapshot();
    expect(new EditorV3Content(div.innerHTML).data).toEqual(testContent.data);
    expect(new EditorV3Content(testContent.data).data).toEqual(testContent.data);
  });
});

describe("Content functions", () => {
  test("Run check status", async () => {
    const testContent = new EditorV3Content(
      JSON.stringify({
        lines: [
          {
            textBlocks: [
              { text: "@Hello", type: "at", isLocked: true },
              { text: " world", type: "text" },
            ],
          },
        ],
      }),
    );
    testContent.caretPosition = {
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
      focusAt: "end",
    };
    testContent.checkStatus();
    expect(testContent.caretPosition).toEqual({
      startLine: 0,
      startChar: 0,
      endLine: 0,
      endChar: 6,
      isCollapsed: false,
      focusAt: "end",
    });
    expect(testContent.caretPositionF).toEqual({
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 6,
    });
  });

  test("Merge and split lines", async () => {
    const testContent = new EditorV3Content("12\n34\n56");
    expect(testContent.upToPos(0, 0).map((tb) => tb.data)).toEqual([
      { textBlocks: [{ text: "", type: "text" }] },
    ]);
    expect(testContent.fromPos(2, 2).map((tb) => tb.data)).toEqual([
      { textBlocks: [{ text: "", type: "text" }] },
    ]);
    testContent.mergeLines(0);
    expect(testContent.text).toEqual("1234\n56");
    testContent.splitLine({
      startLine: 0,
      startChar: 3,
      endLine: 0,
      endChar: 3,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("123\n4\n56");
    testContent.splitLine({
      startLine: 0,
      startChar: 1,
      endLine: 2,
      endChar: 0,
      isCollapsed: false,
    });
    expect(testContent.text).toEqual("1\n56");
    testContent.splitLine({
      startLine: 4,
      startChar: 1,
      endLine: 5,
      endChar: 0,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n56");
    testContent.splitLine({
      startLine: 1,
      startChar: 2,
      endLine: 1,
      endChar: 2,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n56\n");
  });

  test("Delete character", async () => {
    const testContent = new EditorV3Content("12\n34\n56");
    testContent.deleteCharacter(false, {
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n34\n56");

    testContent.deleteCharacter(false, {
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("134\n56");

    testContent.splitLine({
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n34\n56");
    testContent.deleteCharacter(true, {
      startLine: 1,
      startChar: 0,
      endLine: 1,
      endChar: 2,
      isCollapsed: false,
    });
    expect(testContent.text).toEqual("1\n\n56");
    expect(testContent.lines[1].textBlocks.length).toEqual(1);

    testContent.deleteCharacter(true, {
      startLine: 2,
      startChar: 0,
      endLine: 2,
      endChar: 0,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n56");

    testContent.deleteCharacter(true, {
      startLine: 1,
      startChar: 2,
      endLine: 1,
      endChar: 2,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n5");

    testContent.deleteCharacter(true, {
      startLine: 2,
      startChar: 2,
      endLine: 1,
      endChar: 2,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n5");
  });

  test("Splice", async () => {
    const testContent = new EditorV3Content("123\n456\n789");
    const remove = testContent.splice({
      isCollapsed: false,
      startLine: 0,
      startChar: 1,
      endLine: 2,
      endChar: 1,
    });
    expect(remove.map((l) => l.lineText).join("\n")).toEqual("23\n456\n7");
    expect(testContent.text).toEqual("189");

    const testContent2 = new EditorV3Content("123\n456\n789");
    const remove2 = testContent.splice({
      isCollapsed: true,
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
    });
    expect(remove2.map((l) => l.lineText).join("\n")).toEqual("");
    expect(testContent2.text).toEqual("123\n456\n789");

    const testContent3 = new EditorV3Content("123\n456\n789");
    const remove3 = testContent3.splice({
      isCollapsed: false,
      startLine: 1,
      startChar: 0,
      endLine: 1,
      endChar: 2,
    });
    expect(remove3.map((l) => l.lineText).join("\n")).toEqual("45");
    expect(testContent3.text).toEqual("123\n6\n789");

    const testContent4 = new EditorV3Content("123\n456\n789");
    const remove4 = testContent4.splice({
      startLine: 0,
      startChar: 3,
      endLine: 2,
      endChar: 2,
    });
    expect(remove4.map((l) => l.lineText).join("\n")).toEqual("\n456\n78");
    expect(testContent4.text).toEqual("1239");

    const testContent5 = new EditorV3Content("123\n456\n789");
    const remove5 = testContent5.splice({
      startLine: 0,
      startChar: 3,
      endLine: 3,
      endChar: 2,
    });
    expect(remove5.map((l) => l.lineText).join("\n")).toEqual("\n456\n789");
    expect(testContent5.text).toEqual("123");

    const testContent6 = new EditorV3Content("123\n456\n789");
    testContent6.splice(
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
      },
      [new EditorV3Line([textBlockFactory({ text: "abc" })], defaultContentProps)],
    );
    expect(testContent6.text).toEqual("abc123\n456\n789");

    testContent6.splice(
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 3,
      },
      [new EditorV3Line([textBlockFactory({ text: "def" })], defaultContentProps)],
    );
    expect(testContent6.text).toEqual("abc123\ndef\n789");

    testContent6.splice(
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 4,
      },
      [new EditorV3Line([textBlockFactory({ text: "ghi" })], defaultContentProps)],
    );
    expect(testContent6.text).toEqual("abc123\nghi\n789");

    testContent6.splice(
      {
        startLine: 4,
        startChar: 0,
        endLine: 1,
        endChar: 4,
      },
      [new EditorV3Line([textBlockFactory({ text: "jkl" })], defaultContentProps)],
    );
    expect(testContent6.text).toEqual("abc123\nghi\n789");
  });

  test("Apply & remove style", async () => {
    const testContent = new EditorV3Content("123\n456\n789");
    testContent.applyStyle("shiny", {
      isCollapsed: false,
      startLine: 0,
      startChar: 1,
      endLine: 2,
      endChar: 1,
    });
    expect(testContent.text).toEqual("123\n456\n789");
    expect(testContent.getStyleAt(1, 1)).toEqual("shiny");
    expect(testContent.getStyleAt(0, 0)).toEqual(undefined);
    expect(testContent.getStyleAt(2, 1)).toEqual(undefined);
    expect(testContent.data.lines).toEqual([
      {
        textBlocks: [
          { text: "1", type: "text" },
          { text: "23", style: "shiny", type: "text" },
        ],
      },
      {
        textBlocks: [{ text: "456", style: "shiny", type: "text" }],
      },
      {
        textBlocks: [
          { text: "7", style: "shiny", type: "text" },
          { text: "89", type: "text" },
        ],
      },
    ]);
    testContent.removeStyle({ startLine: 1, startChar: 0, endLine: 1, endChar: 2 });
    expect(testContent.data.lines).toEqual([
      {
        textBlocks: [
          { text: "1", type: "text" },
          { text: "23", style: "shiny", type: "text" },
        ],
      },
      {
        textBlocks: [
          { text: "45", type: "text" },
          { text: "6", style: "shiny", type: "text" },
        ],
      },
      {
        textBlocks: [
          { text: "7", type: "text", style: "shiny" },
          { text: "89", type: "text" },
        ],
      },
    ]);
  });
});

describe("Render markdown text from content", () => {
  test("Render markdown text", async () => {
    const props = {
      ...defaultContentProps,
      styles: { shiny: { color: "pink" } },
      textAlignment: EditorV3Align.center,
      decimalAlignPercent: 80,
    };
    const testContent = new EditorV3Content("123\n456\n789", props);
    testContent.applyStyle("shiny", {
      isCollapsed: false,
      startLine: 0,
      startChar: 1,
      endLine: 2,
      endChar: 1,
    });
    expect(testContent.contentProps).toEqual(props);
    testContent.allowWindowView = true;
    testContent.allowMarkdown = true;
    testContent.allowNewLine = true;
    testContent.showMarkdown = true;
    const result = testContent.toMarkdownHtml({});
    const div = document.createElement("div");
    div.append(result);
    expect(div.innerHTML).toMatchSnapshot();
    // Eat your own tail
    const readDiv = new EditorV3Content(div.innerHTML);
    expect(readDiv.data).toEqual(testContent.data);
    const readDiv2 = new EditorV3Content(div);
    expect(readDiv2.data).toEqual(testContent.data);
  });
});

describe("Splice markdown tests", () => {
  test("Bad position return empty array", async () => {
    const testContent = new EditorV3Content("123\n456\n789", {
      ...defaultContentProps,
      allowMarkdown: true,
      showMarkdown: true,
    });
    const pasteContent = new EditorV3Content("abc");
    const pos = {
      startLine: 1,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    };
    expect(testContent.splice(pos, pasteContent.lines)).toEqual([]);
    expect(testContent.text).toEqual("123\n456\n789");
    // Check markdown render when not show markdown
    testContent.showMarkdown = false;
    const div = document.createElement("div");
    div.append(testContent.toMarkdownHtml({}));
    expect(div.innerHTML).toMatchSnapshot();
    expect(testContent.showMarkdown).toEqual(false);
  });
  test("Easy insert", async () => {
    const testContent = new EditorV3Content("123\n456\n789", {
      ...defaultContentProps,
      allowMarkdown: true,
      showMarkdown: true,
    });
    const pasteContent = new EditorV3Content("abc", {
      ...defaultContentProps,
      allowMarkdown: true,
      showMarkdown: true,
    });
    const pos = {
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    };
    testContent.splice(pos, pasteContent.lines);
    expect(testContent.text).toEqual("1abc23\n456\n789");
  });
  test("Easy update", async () => {
    const testContent = new EditorV3Content("123\n456\n789", {
      ...defaultContentProps,
      allowMarkdown: true,
      showMarkdown: true,
    });
    const pasteContent = new EditorV3Content("abc", {
      ...defaultContentProps,
      allowMarkdown: true,
      showMarkdown: true,
    });
    const pos = {
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 2,
      isCollapsed: false,
    };
    const splice = testContent.splice(pos, pasteContent.lines);
    expect(testContent.text).toEqual("1abc3\n456\n789");
    expect(splice.map((l) => l.lineText).join("\n")).toEqual("2");
  });
  test("Harder update", async () => {
    const testContent = new EditorV3Content("123\n456\n789", {
      ...defaultContentProps,
      allowMarkdown: true,
      showMarkdown: true,
    });
    const pasteContent = new EditorV3Content("ab\nc", {
      ...defaultContentProps,
      allowMarkdown: true,
      showMarkdown: true,
    });
    const pos = {
      startLine: 0,
      startChar: 1,
      endLine: 2,
      endChar: 3,
      isCollapsed: false,
    };
    const splice = testContent.splice(pos, pasteContent.lines);
    expect(splice.map((l) => l.lineText).join("\n")).toEqual("23\n456\n789");
    expect(testContent.text).toEqual("1ab\nc");
  });
  test("Splice with styles", async () => {
    const contentProps = {
      ...defaultContentProps,
      allowMarkdown: true,
      allowNewLine: true,
      decimalAlignPercent: 80,
      showMarkdown: true,
      styles: { shiny: { color: "pink" }, dull: { color: "grey" } },
      textAlignment: EditorV3Align.center,
    };
    const testContent = new EditorV3Content(
      JSON.stringify({
        lines: [{ textBlocks: [{ text: "34.56", style: "shiny" }] }],
        contentProps: contentProps,
      }),
    );
    expect(testContent.toMarkdownHtml({}).textContent).toEqual("<<shiny::34.56>>");
    const pasteContent = new EditorV3Line(
      { textBlocks: [{ text: "abc", style: "dull" }] },
      contentProps,
    );
    const pos = {
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    };
    const splice = testContent.splice(pos, [pasteContent]);
    expect(testContent.toMarkdownHtml({}).textContent).toEqual(
      "<<shiny::3>><<dull::abc>><<shiny::4.56>>",
    );
    expect(testContent.text).toEqual("3abc4.56");
    expect(splice.map((l) => l.lineText).join("\n")).toEqual("");

    // Change markdown settings
    testContent.markdownSettings = {
      ...testContent.markdownSettings,
      styleStartTag: "¬¬",
      styleEndTag: "^^",
    };
    expect(testContent.toMarkdownHtml({}).textContent).toEqual(
      "¬¬shiny::3^^¬¬dull::abc^^¬¬shiny::4.56^^",
    );
  });
});

describe("handleKeydown", () => {
  test("should select all when Ctrl + A is pressed", () => {
    const testContent = new EditorV3Content("Hello, World!");
    const event = {
      ctrlKey: true,
      code: "KeyA",
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    testContent.handleKeydown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(testContent.caretPosition).toEqual({
      startLine: 0,
      startChar: 0,
      endLine: 0,
      endChar: 13,
      isCollapsed: false,
      focusAt: "end",
    });
  });

  test("should handle cursor movement", () => {
    const testContent = new EditorV3Content("Hello, World!");
    testContent.caretPosition = {
      startLine: 0,
      startChar: 7,
      endLine: 0,
      endChar: 7,
    };
    const event = {
      key: "ArrowLeft",
      shiftKey: false,
      ctrlKey: false,
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    testContent.handleKeydown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(testContent.caretPosition).toEqual({
      startLine: 0,
      startChar: 6,
      endLine: 0,
      endChar: 6,
      isCollapsed: true,
      focusAt: "end",
    });
  });

  test("should delete character when Backspace is pressed", () => {
    const testContent = new EditorV3Content("Hello, World!");
    testContent.caretPosition = {
      startLine: 0,
      startChar: 13,
      endLine: 0,
      endChar: 13,
    };
    const event = {
      key: "Backspace",
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    testContent.handleKeydown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(testContent.text).toEqual("Hello, World");
  });

  test("should lock text blocks when Escape is pressed", () => {
    const testContent = new EditorV3Content({
      lines: [{ textBlocks: [textBlockFactory({ text: "@Hello, World!", type: "at" })] }],
    });
    testContent.caretPosition = {
      startLine: 0,
      startChar: 13,
      endLine: 0,
      endChar: 13,
    };
    testContent.lines[0].textBlocks[0].isLocked = undefined;
    testContent.lines[0].textBlocks[0].setActive(true);
    expect(testContent.lines[0].textBlocks[0].isLocked).toBe(undefined);
    expect(testContent.lines[0].textBlocks[0].isActive).toBe(true);
    expect(testContent.lines[0].textBlocks[0].type).toBe("at");

    const event = {
      key: "Escape",
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    testContent.handleKeydown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(testContent.lines[0].textBlocks[0].isLocked).toBe(true);
    expect(testContent.lines[0].textBlocks[0].isActive).toBe(false);
  });

  test("should split line when Enter is pressed", () => {
    const testContent = new EditorV3Content("Hello, World!");
    testContent.allowNewLine = true;
    testContent.caretPosition = {
      startLine: 0,
      startChar: 6,
      endLine: 0,
      endChar: 6,
    };
    const event = {
      key: "Enter",
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    testContent.handleKeydown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(testContent.text).toEqual("Hello,\n World!");
    expect(testContent.caretPosition).toEqual({
      startLine: 1,
      startChar: 0,
      endLine: 1,
      endChar: 0,
      isCollapsed: true,
      focusAt: "end",
    });
  });
});

describe("Search for text", () => {
  test("Find string", async () => {
    const testContent = new EditorV3Content("Hello, World!");

    expect(testContent.getTextPosition("x")).toEqual(null);

    expect(testContent.getTextPosition("Wor")).toEqual([
      {
        isCollapsed: false,
        startLine: 0,
        startChar: 7,
        endLine: 0,
        endChar: 10,
      },
    ]);

    expect(testContent.getTextPosition("o")).toEqual([
      { isCollapsed: false, startLine: 0, startChar: 4, endLine: 0, endChar: 5 },
      { isCollapsed: false, startLine: 0, startChar: 8, endLine: 0, endChar: 9 },
    ]);
  });

  test("Find string across multiple lines and blocks", async () => {
    const contentProps = {
      ...defaultContentProps,
      allowMarkdown: true,
      allowNewLine: true,
      decimalAlignPercent: 80,
      showMarkdown: true,
      styles: { shiny: { color: "pink" }, dull: { color: "grey" } },
      textAlignment: EditorV3Align.center,
    };
    const testContent = new EditorV3Content(
      JSON.stringify({
        lines: [
          { textBlocks: [{ text: "34.56", style: "shiny" }] },
          {
            textBlocks: [
              { text: "Hello" },
              { text: ", World", style: "dull", type: "at", isLocked: true, atData: { id: "123" } },
            ],
          },
          { textBlocks: [{ text: "th" }, { text: "is is it", style: "dull" }] },
        ],
        contentProps: contentProps,
      }),
    );
    expect(testContent.text).toEqual("34.56\nHello, World\nthis is it");
    expect(testContent.getTextPosition("o")).toEqual([
      {
        isCollapsed: false,
        startLine: 1,
        startChar: 4,
        endLine: 1,
        endChar: 5,
      },
      {
        isCollapsed: false,
        startLine: 1,
        startChar: 8,
        endLine: 1,
        endChar: 9,
      },
    ]);
    expect(testContent.getTextPosition("this")).toEqual(null);
    expect(testContent.getTextPosition("is")).toEqual([
      {
        isCollapsed: false,
        startLine: 2,
        startChar: 2,
        endLine: 2,
        endChar: 4,
      },
      {
        isCollapsed: false,
        startLine: 2,
        startChar: 5,
        endLine: 2,
        endChar: 7,
      },
    ]);
  });
});
