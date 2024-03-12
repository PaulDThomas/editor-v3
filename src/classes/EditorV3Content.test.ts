/* eslint-disable quotes */
import { EditorV3Content, defaultContentProps } from "./EditorV3Content";
import { EditorV3Line } from "./EditorV3Line";
import { EditorV3Align, EditorV3ContentPropsInput } from "./interface";

// Load and read tests
describe("Check basic EditorV3Content", () => {
  test("Load basic string, test getters and setters", async () => {
    const testContent = new EditorV3Content("12.34");
    expect(testContent.text).toEqual("12.34");
    const div = document.createElement("div");
    div.append(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line left"><span class="aiev3-tb">12.34</span></div>' +
        '<div class="aiev3-contents-info"></div>',
    );
    expect(testContent.decimalAlignPercent).toEqual(60);
    expect(testContent.textAlignment).toEqual("left");
    testContent.textAlignment = EditorV3Align.decimal;
    expect(testContent.textAlignment).toEqual("decimal");
    testContent.decimalAlignPercent = 30;
    expect(testContent.decimalAlignPercent).toEqual(30);
    testContent.styles = { shiny: { color: "pink" } };
    expect(JSON.parse(testContent.jsonString)).toEqual({
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
    expect(JSON.parse(testContent.jsonString)).toEqual({
      contentProps: testProps,
      lines: [
        {
          textBlocks: [{ text: "34.56", type: "text" }],
        },
      ],
    });
    const div = document.createElement("div");
    div.append(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line center">' +
        '<span class="aiev3-tb">34.56</span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-decimal-align-percent="80" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}" data-text-alignment="&quot;center&quot;"></div>',
    );

    // Check self equivalence
    const read1 = new EditorV3Content(testContent.jsonString);
    expect(read1.data).toEqual(testContent.data);
    const read2 = new EditorV3Content(div);
    expect(read2.data).toEqual(testContent.data);
    expect(new EditorV3Content(div.innerHTML).data).toEqual(testContent.data);

    // Repeat as decimal
    testContent.textAlignment = EditorV3Align.decimal;
    expect(new EditorV3Content(testContent.jsonString)).toEqual(testContent);
    div.innerHTML = "";
    div.appendChild(testContent.toHtml());
    expect(new EditorV3Content(div.innerHTML)).toEqual(testContent);
  });

  test("Load multiline string", async () => {
    const testContent = new EditorV3Content("Hello\n.World\u2009");
    expect(testContent.text).toEqual("Hello\n.World");
    expect(JSON.parse(testContent.jsonString)).toEqual({
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
    div.append(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line left"><span class="aiev3-tb">Hello</span></div>' +
        '<div class="aiev3-line left"><span class="aiev3-tb">.World</span></div>' +
        '<div class="aiev3-contents-info"></div>',
    );

    // Updates need to flow through
    testContent.decimalAlignPercent = 55;
    testContent.styles = { shiny: { color: "pink" } };
    testContent.textAlignment = EditorV3Align.decimal;
    expect(testContent.text).toEqual("Hello\n.World");
    expect(JSON.parse(testContent.jsonString)).toEqual({
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
    div.appendChild(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line decimal" style="grid-template-columns: 55% 45%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">Hello</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb">\u2009</span></span>' +
        "</div>" +
        '<div class="aiev3-line decimal" style="grid-template-columns: 55% 45%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">\u2009</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb">.World</span></span>' +
        "</div>" +
        '<div class="aiev3-contents-info" data-decimal-align-percent="55" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}" data-text-alignment="&quot;decimal&quot;"></div>',
    );
    expect(new EditorV3Content(div.innerHTML).data).toEqual(testContent.data);
    expect(new EditorV3Content(testContent.jsonString).data).toEqual(testContent.data);
  });
});

describe("Content functions", () => {
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
    testContent.deleteCharacter(
      {
        startLine: 0,
        startChar: 1,
        endLine: 0,
        endChar: 1,
        isCollapsed: true,
      },
      false,
    );
    expect(testContent.text).toEqual("1\n34\n56");

    testContent.deleteCharacter(
      {
        startLine: 0,
        startChar: 4,
        endLine: 0,
        endChar: 4,
        isCollapsed: true,
      },
      false,
    );
    expect(testContent.text).toEqual("134\n56");

    testContent.splitLine({
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual("1\n34\n56");
    testContent.deleteCharacter(
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 2,
        isCollapsed: false,
      },
      true,
    );
    expect(testContent.text).toEqual("1\n\n56");
    expect(testContent.lines[1].textBlocks.length).toEqual(1);

    testContent.deleteCharacter(
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      true,
    );
    expect(testContent.text).toEqual("1\n56");

    testContent.deleteCharacter(
      {
        startLine: 1,
        startChar: 2,
        endLine: 1,
        endChar: 2,
        isCollapsed: true,
      },
      true,
    );
    expect(testContent.text).toEqual("1\n5");

    testContent.deleteCharacter(
      {
        startLine: 2,
        startChar: 2,
        endLine: 1,
        endChar: 2,
        isCollapsed: true,
      },
      true,
    );
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
      [new EditorV3Line("abc", defaultContentProps)],
    );
    expect(testContent6.text).toEqual("abc123\n456\n789");

    testContent6.splice(
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 3,
      },
      [new EditorV3Line("def", defaultContentProps)],
    );
    expect(testContent6.text).toEqual("abc123\ndef\n789");

    testContent6.splice(
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 4,
      },
      [new EditorV3Line("ghi", defaultContentProps)],
    );
    expect(testContent6.text).toEqual("abc123\nghi\n789");

    testContent6.splice(
      {
        startLine: 4,
        startChar: 0,
        endLine: 1,
        endChar: 4,
      },
      [new EditorV3Line("jkl", defaultContentProps)],
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
    expect(testContent.getStyleAt(0, 1)).toEqual(undefined);
    expect(JSON.parse(testContent.jsonString).lines).toEqual([
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
    expect(
      JSON.parse(
        testContent.removeStyle({ startLine: 1, startChar: 0, endLine: 1, endChar: 2 }).jsonString,
      ).lines,
    ).toEqual([
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
    testContent.allowMarkdown = true;
    testContent.allowNewLine = true;
    testContent.showMarkdown = true;
    const result = testContent.toMarkdownHtml();
    const div = document.createElement("div");
    div.append(result);
    expect(div.innerHTML).toEqual(
      `<div class="aiev3-markdown-line">1&lt;&lt;shiny::23&gt;&gt;</div>` +
        `<div class="aiev3-markdown-line">&lt;&lt;shiny::456&gt;&gt;</div>` +
        `<div class="aiev3-markdown-line">&lt;&lt;shiny::7&gt;&gt;89</div>` +
        `<div class="aiev3-contents-info" data-allow-new-line="true" data-decimal-align-percent="80" data-show-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}" data-text-alignment="&quot;center&quot;"></div>`,
    );
    // Eat your own tail
    const readDiv = new EditorV3Content(div.innerHTML);
    expect(readDiv.data).toEqual(testContent.data);
    const readDiv2 = new EditorV3Content(div);
    expect(readDiv2.data).toEqual(testContent.data);
  });
});

describe("Render html text from v2 content", () => {
  test("Load multiple v2 lines", async () => {
    const textString =
      `<div classname="aie-text" data-key="2v9v5" data-type="unstyled" data-inline-style-ranges='[{"offset":0,"length":1,"style":"Notes"},{"offset":4,"length":1,"style":"Notes"},{"offset":1,"length":3,"style":"Optional"}]'><span classname="Notes" style="color:blue;font-size:16pt">N</span><span classname="Optional" style="color:green;font-weight:100;font-family:serif;font-size:16pt">ote</span><span classname="Notes" style="color:blue;font-size:16pt">s</span>  w</div>` +
      `<div classname="aie-text" data-key="1u61b" data-type="unstyled" data-inline-style-ranges='[]'></div>` +
      `<div classname="aie-text" data-key="4l4fu" data-type="unstyled" data-inline-style-ranges='[]'>ork</div>`;
    const result = new EditorV3Content(textString);
    expect(result.lines.length).toEqual(3);
    expect(result.lines[0].textBlocks.map((t) => t.data)).toEqual([
      { text: "N", style: "Notes", type: "text" },
      { text: "ote", style: "Optional", type: "text" },
      { text: "s", style: "Notes", type: "text" },
      { text: "  w", style: undefined, type: "text" },
    ]);
    expect(result.lines[1].textBlocks.map((t) => t.data)).toEqual([
      { text: "", style: undefined, type: "text" },
    ]);
    expect(result.lines[2].textBlocks.map((t) => t.data)).toEqual([
      { text: "ork", style: undefined, type: "text" },
    ]);
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
    div.append(testContent.toMarkdownHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-markdown-line">123</div>' +
        '<div class="aiev3-markdown-line">456</div>' +
        '<div class="aiev3-markdown-line">789</div>' +
        '<div class="aiev3-contents-info" data-show-markdown="true"></div>',
    );
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
    expect(testContent.text).toEqual("1ab\nc");
    expect(splice.map((l) => l.lineText).join("\n")).toEqual("23\n456\n789");
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
    expect(testContent.toMarkdownHtml().textContent).toEqual("<<shiny::34.56>>");
    const pasteContent = new EditorV3Line(
      `{"textBlocks":[{"text":"abc","style":"dull"}]}`,
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
    expect(testContent.toMarkdownHtml().textContent).toEqual("<<<dull::abc>><shiny::34.56>>");
    expect(testContent.text).toEqual("<abc<shiny::34.56>>");
    expect(splice.map((l) => l.lineText).join("\n")).toEqual("");

    // Change markdown settings
    testContent.markdownSettings = {
      ...testContent.markdownSettings,
      styleStartTag: "¬¬",
      styleEndTag: "^^",
    };
    expect(testContent.toMarkdownHtml().textContent).toEqual("<¬¬dull::abc^^<shiny::34.56>>");
  });
});
