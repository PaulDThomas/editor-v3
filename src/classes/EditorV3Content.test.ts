import { EditorV3Content } from "./EditorV3Content";
import { EditorV3Line } from "./EditorV3Line";
import { EditorV3Align } from "./interface";

// Load and read tests
describe("Check basic EditorV3Content", () => {
  test("Load basic string, test getters and setters", async () => {
    const testContent = new EditorV3Content("12.34");
    expect(testContent.text).toEqual("12.34");
    const div = document.createElement("div");
    div.append(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line left"><span class="aiev3-tb">12.34</span></div>',
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
        { textBlocks: [{ text: "12.34" }], textAlignment: "decimal", decimalAlignPercent: 30 },
      ],
      textAlignment: "decimal",
      decimalAlignPercent: 30,
      styles: { shiny: { color: "pink" } },
    });
  });

  test("Load string with style info", async () => {
    const testContent = new EditorV3Content("34.56", {
      styles: { shiny: { color: "pink" } },
      textAlignment: EditorV3Align.center,
      decimalAlignPercent: 80,
    });
    expect(testContent.text).toEqual("34.56");
    expect(testContent.styles).toEqual({ shiny: { color: "pink" } });
    expect(testContent.decimalAlignPercent).toEqual(80);
    expect(testContent.textAlignment).toEqual("center");
    expect(testContent.lines).toEqual([
      { textBlocks: [{ text: "34.56" }], textAlignment: "center", decimalAlignPercent: 80 },
    ]);
    expect(JSON.parse(testContent.jsonString)).toEqual({
      lines: [
        { textBlocks: [{ text: "34.56" }], textAlignment: "center", decimalAlignPercent: 80 },
      ],
      decimalAlignPercent: 80,
      textAlignment: "center",
      styles: { shiny: { color: "pink" } },
    });
    const div = document.createElement("div");
    div.append(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line center">' +
        '<span class="aiev3-tb">34.56</span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}"></div>',
    );

    // Check self equivalence
    expect(new EditorV3Content(testContent.jsonString)).toEqual(testContent);
    // Need to change back to default, as attribute is not used
    testContent.decimalAlignPercent = 60;
    expect(new EditorV3Content(div.innerHTML)).toEqual(testContent);

    // Repeat as decimal
    testContent.decimalAlignPercent = 80;
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
        { textBlocks: [{ text: "Hello" }], textAlignment: "left", decimalAlignPercent: 60 },
        { textBlocks: [{ text: ".World" }], textAlignment: "left", decimalAlignPercent: 60 },
      ],
      decimalAlignPercent: 60,
      textAlignment: "left",
      styles: {},
    });
    const div = document.createElement("div");
    div.append(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line left"><span class="aiev3-tb">Hello</span></div>' +
        '<div class="aiev3-line left"><span class="aiev3-tb">.World</span></div>',
    );

    // Updates need to flow through
    testContent.decimalAlignPercent = 55;
    testContent.styles = { shiny: { color: "pink" } };
    testContent.textAlignment = EditorV3Align.decimal;
    expect(testContent.text).toEqual("Hello\n.World");
    expect(JSON.parse(testContent.jsonString)).toEqual({
      lines: [
        { textBlocks: [{ text: "Hello" }], textAlignment: "decimal", decimalAlignPercent: 55 },
        { textBlocks: [{ text: ".World" }], textAlignment: "decimal", decimalAlignPercent: 55 },
      ],
      decimalAlignPercent: 55,
      textAlignment: "decimal",
      styles: { shiny: { color: "pink" } },
    });
    div.innerHTML = "";
    div.appendChild(testContent.toHtml());
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs" style="right: 45%; min-width: 55%;"><span class="aiev3-tb">Hello</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 55%; min-width: 45%;"><span class="aiev3-tb">\u2009</span></span>' +
        "</div>" +
        '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs" style="right: 45%; min-width: 55%;"><span class="aiev3-tb">\u2009</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 55%; min-width: 45%;"><span class="aiev3-tb">.World</span></span>' +
        "</div>" +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}"></div>',
    );
    expect(new EditorV3Content(div.innerHTML)).toEqual(testContent);
    expect(new EditorV3Content(testContent.jsonString)).toEqual(testContent);
  });
});

describe("Content functions", () => {
  test("Merge and split lines", async () => {
    const testContent = new EditorV3Content("12\n34\n56");
    expect(testContent.upToPos(0, 0)).toEqual([
      { textBlocks: [{ text: "" }], decimalAlignPercent: 60, textAlignment: "left" },
    ]);
    expect(testContent.fromPos(2, 2)).toEqual([
      { textBlocks: [{ text: "" }], decimalAlignPercent: 60, textAlignment: "left" },
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
      [new EditorV3Line("abc")],
    );
    expect(testContent6.text).toEqual("abc123\n456\n789");

    testContent6.splice(
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 3,
      },
      [new EditorV3Line("def")],
    );
    expect(testContent6.text).toEqual("abc123\ndef\n789");

    testContent6.splice(
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 4,
      },
      [new EditorV3Line("ghi")],
    );
    expect(testContent6.text).toEqual("abc123\nghi\n789");

    testContent6.splice(
      {
        startLine: 4,
        startChar: 0,
        endLine: 1,
        endChar: 4,
      },
      [new EditorV3Line("jkl")],
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
        decimalAlignPercent: 60,
        textAlignment: "left",
        textBlocks: [{ text: "1" }, { text: "23", style: "shiny" }],
      },
      {
        decimalAlignPercent: 60,
        textAlignment: "left",
        textBlocks: [{ text: "456", style: "shiny" }],
      },
      {
        decimalAlignPercent: 60,
        textAlignment: "left",
        textBlocks: [{ text: "7", style: "shiny" }, { text: "89" }],
      },
    ]);
    expect(
      JSON.parse(
        testContent.removeStyle({ startLine: 1, startChar: 0, endLine: 1, endChar: 2 }).jsonString,
      ).lines,
    ).toEqual([
      {
        decimalAlignPercent: 60,
        textAlignment: "left",
        textBlocks: [{ text: "1" }, { text: "23", style: "shiny" }],
      },
      {
        decimalAlignPercent: 60,
        textAlignment: "left",
        textBlocks: [{ text: "45" }, { text: "6", style: "shiny" }],
      },
      {
        decimalAlignPercent: 60,
        textAlignment: "left",
        textBlocks: [{ text: "7", style: "shiny" }, { text: "89" }],
      },
    ]);
  });
});

describe("Render markdown text from content", () => {
  test("Render markdown text", async () => {
    const props = {
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
    const result = testContent.toMarkdownHtml();
    const div = document.createElement("div");
    div.append(result);
    expect(div.innerHTML).toEqual(
      `<div class="aiev3-markdown-line" data-text-alignment="center" data-decimal-align-percent="80">1&lt;&lt;shiny::23&gt;&gt;</div>` +
        `<div class="aiev3-markdown-line" data-text-alignment="center" data-decimal-align-percent="80">&lt;&lt;shiny::456&gt;&gt;</div>` +
        `<div class="aiev3-markdown-line" data-text-alignment="center" data-decimal-align-percent="80">&lt;&lt;shiny::7&gt;&gt;89</div>` +
        `<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}"></div>`,
    );
    // Eat your own tail
    expect(new EditorV3Content(div.innerHTML)).toEqual(testContent);
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
      { text: "N", style: "Notes" },
      { text: "ote", style: "Optional" },
      { text: "s", style: "Notes" },
      { text: "  w", style: undefined },
    ]);
    expect(result.lines[1].textBlocks.map((t) => t.data)).toEqual([{ text: "", style: undefined }]);
    expect(result.lines[2].textBlocks.map((t) => t.data)).toEqual([
      { text: "ork", style: undefined },
    ]);
  });
});
