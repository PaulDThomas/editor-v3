/* eslint-disable quotes */
import { defaultContentProps } from "./EditorV3Content";
import { EditorV3Line } from "./EditorV3Line";
import { EditorV3TextBlock } from "./EditorV3TextBlock";
import { EditorV3Align } from "./interface";

describe("Check basic EditorV3Line", () => {
  test("Load string", async () => {
    const testLine = new EditorV3Line("Hello world");
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line left">' +
        '<span class="aiev3-tb">Hello&nbsp;</span>' +
        '<span class="aiev3-tb">world</span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("Hello world");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.left);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(60);
  });

  test("Load string with line breaks, tabs", async () => {
    const testLine = new EditorV3Line("  Hello \r\n\t world  ", {
      ...defaultContentProps,
      textAlignment: EditorV3Align.center,
      decimalAlignPercent: 22,
    });
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line center">' +
        '<span class="aiev3-tb">&nbsp;&nbsp;</span>' +
        '<span class="aiev3-tb">Hello&nbsp;</span>' +
        '<span class="aiev3-tb">&nbsp;</span>' +
        '<span class="aiev3-tb">world&nbsp;</span>' +
        '<span class="aiev3-tb">&nbsp;</span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("  Hello  world  ");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.center);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(22);
  });

  test("Load textBlocks, test getStyleAt", async () => {
    const testLine = new EditorV3Line(
      [
        new EditorV3TextBlock("Hello\u00A0world, "),
        new EditorV3TextBlock("How is it going?", "shiny"),
      ],
      defaultContentProps,
    );
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line left">' +
        '<span class="aiev3-tb">Hello&nbsp;world,&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">How&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">is&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">it&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">going?</span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("Hello\u00a0world, How is it going?");
    expect(testLine.lineLength).toEqual(29);
    expect(testLine.contentProps).toEqual(defaultContentProps);
    const styles: { l: number; v: string | undefined; c: string }[] = [];
    for (let i = 0; i <= testLine.lineLength; i++) {
      styles.push({
        l: i,
        v: testLine.getStyleAt(i),
        c: testLine.subBlocks(i, Math.min(i + 1, testLine.lineLength))[0]?.text,
      });
    }
    expect(styles).toEqual([
      { l: 0, v: undefined, c: "H" },
      { l: 1, v: undefined, c: "e" },
      { l: 2, v: undefined, c: "l" },
      { l: 3, v: undefined, c: "l" },
      { l: 4, v: undefined, c: "o" },
      { l: 5, v: undefined, c: "\u00a0" },
      { l: 6, v: undefined, c: "w" },
      { l: 7, v: undefined, c: "o" },
      { l: 8, v: undefined, c: "r" },
      { l: 9, v: undefined, c: "l" },
      { l: 10, v: undefined, c: "d" },
      { l: 11, v: undefined, c: "," },
      { l: 12, v: undefined, c: " " },
      { l: 13, v: "shiny", c: "H" },
      { l: 14, v: "shiny", c: "o" },
      { l: 15, v: "shiny", c: "w" },
      { l: 16, v: "shiny", c: " " },
      { l: 17, v: "shiny", c: "i" },
      { l: 18, v: "shiny", c: "s" },
      { l: 19, v: "shiny", c: " " },
      { l: 20, v: "shiny", c: "i" },
      { l: 21, v: "shiny", c: "t" },
      { l: 22, v: "shiny", c: " " },
      { l: 23, v: "shiny", c: "g" },
      { l: 24, v: "shiny", c: "o" },
      { l: 25, v: "shiny", c: "i" },
      { l: 26, v: "shiny", c: "n" },
      { l: 27, v: "shiny", c: "g" },
      { l: 28, v: "shiny", c: "?" },
      { l: 29, v: undefined, c: undefined },
    ]);
  });

  test("Load decimal textBlocks", async () => {
    const testLine = new EditorV3Line(
      [
        new EditorV3TextBlock("Hello\u00A0world. "),
        new EditorV3TextBlock("How is it going?", "shiny"),
      ],
      { ...defaultContentProps, textAlignment: EditorV3Align.decimal },
    );
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal" style="grid-template-columns: 60% 40%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">Hello&nbsp;world</span></span>' +
        '<span class="aiev3-span-point rhs">' +
        '<span class="aiev3-tb">.&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">How&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">is&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">it&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">going?</span>' +
        "</span>" +
        "</div>",
    );
    expect(testLine.lineText).toEqual("Hello\u00a0world. How is it going?");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.decimal);
  });

  test("Load decimal text", async () => {
    const newDecimalTestLine = new EditorV3Line("q", {
      ...defaultContentProps,
      textAlignment: EditorV3Align.decimal,
    });
    expect(newDecimalTestLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal" style="grid-template-columns: 60% 40%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">q</span></span>' +
        '<span class="aiev3-span-point rhs">\u2009</span>' +
        "</div>",
    );
    const testLine = new EditorV3Line("12.34", {
      ...defaultContentProps,
      textAlignment: EditorV3Align.decimal,
    });
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal" style="grid-template-columns: 60% 40%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">12</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb">.34</span></span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("12.34");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(60);
  });

  test("Load badly written decimal div", async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line decimal"><span data-style-name="shiny">12.34</span>&nbsp;slow</div>',
      { ...defaultContentProps, textAlignment: EditorV3Align.decimal },
    );

    expect(testLine.lineText).toEqual("12.34 slow");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(60);
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal" style="grid-template-columns: 60% 40%;">' +
        '<span class="aiev3-span-point lhs">' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">12</span>' +
        "</span>" +
        '<span class="aiev3-span-point rhs">' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">.34</span>' +
        '<span class="aiev3-tb">&nbsp;slow</span>' +
        "</span>" +
        "</div>",
    );
    expect(new EditorV3Line(testLine.toHtml())).toEqual(testLine);
    expect(JSON.parse(testLine.jsonString)).toEqual({
      contentProps: { textAlignment: "decimal" },
      textBlocks: [
        { text: "12.34", style: "shiny", type: "text" },
        { text: " slow", type: "text" },
      ],
    });
    expect(new EditorV3Line(testLine.jsonString)).toEqual(testLine);

    const testLine2 = new EditorV3Line(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs">' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">12.</span>' +
        "boys" +
        "</span>" +
        '<span class="aiev3-span-point rhs">' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">34</span>' +
        "&nbsp;slow" +
        '<script>console.error("Inject")</script>' +
        "<span> treats</span>" +
        "</span>" +
        "</div>",
    );
    expect(JSON.parse(testLine2.jsonString)).toEqual({
      contentProps: { textAlignment: "decimal" },
      textBlocks: [
        { text: "12.", style: "shiny", type: "text" },
        { text: "boys", type: "text" },
        { text: "34", style: "shiny", type: "text" },
        { text: " slow treats", type: "text" },
      ],
    });
  });

  test("Load normal div", async () => {
    const testLine = new EditorV3Line('<div class="aiev3-line left">12.34</div>', {
      ...defaultContentProps,
      textAlignment: EditorV3Align.right,
    });

    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line right"><span class="aiev3-tb">12.34</span></div>',
    );
    expect(testLine.lineText).toEqual("12.34");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.right);
  });

  test("Load badly written spanned div", async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line right"><span>12.34&nbsp;</span>wut?&nbsp;<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">5678</span></div>',
    );

    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line right">' +
        '<span class="aiev3-tb">12.34&nbsp;</span>' +
        '<span class="aiev3-tb">wut?&nbsp;</span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">5678</span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("12.34 wut? 5678");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.right);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(60);
  });

  test("Self equivalence for non-decimal", async () => {
    const firstLine = new EditorV3Line(
      [new EditorV3TextBlock("12.34"), new EditorV3TextBlock(" Hello ")],
      { ...defaultContentProps, textAlignment: EditorV3Align.right },
    );
    expect(new EditorV3Line(firstLine.toHtml())).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.toHtml().outerHTML)).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.jsonString)).toEqual(firstLine);
    expect(new EditorV3Line(JSON.stringify(firstLine))).toEqual(firstLine);
  });

  test("Self equivalence for decimal", async () => {
    const firstLine = new EditorV3Line("12.34", {
      ...defaultContentProps,
      textAlignment: EditorV3Align.decimal,
    });
    // expect(new EditorV3Line(firstLine.toHtml())).toEqual(firstLine);
    // expect(new EditorV3Line(firstLine.toHtml().outerHTML)).toEqual(firstLine);
    // expect(new EditorV3Line(firstLine.jsonString)).toEqual(firstLine);
    expect(new EditorV3Line(JSON.stringify(firstLine)).data).toEqual(firstLine.data);
  });
});

describe("Check EditorV3Line functions", () => {
  test("upToPos", async () => {
    const line = new EditorV3Line("0123.456", defaultContentProps);
    expect(line.upToPos(0).map((tb) => tb.data)).toEqual([]);
    expect(line.upToPos(4).map((tb) => tb.data)).toEqual([{ text: "0123", type: "text" }]);
    expect(line.upToPos(7).map((tb) => tb.data)).toEqual([{ text: "0123.45", type: "text" }]);
    expect(line.upToPos(8).map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
    expect(line.upToPos(10).map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);

    const line2 = new EditorV3Line(
      [new EditorV3TextBlock("hello", "world"), new EditorV3TextBlock(" slow")],
      defaultContentProps,
    );
    expect(line2.upToPos(0).map((tb) => tb.data)).toEqual([]);
    expect(line2.upToPos(1).map((tb) => tb.data)).toEqual([
      { text: "h", style: "world", type: "text" },
    ]);
    expect(line2.upToPos(2).map((tb) => tb.data)).toEqual([
      { text: "he", style: "world", type: "text" },
    ]);
    expect(line2.upToPos(3).map((tb) => tb.data)).toEqual([
      { text: "hel", style: "world", type: "text" },
    ]);
    expect(line2.upToPos(4).map((tb) => tb.data)).toEqual([
      { text: "hell", style: "world", type: "text" },
    ]);
    expect(line2.upToPos(5).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
    ]);
    expect(line2.upToPos(6).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
      { text: " ", type: "text" },
    ]);
    expect(line2.upToPos(7).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
      { text: " s", type: "text" },
    ]);
    expect(line2.upToPos(8).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
      { text: " sl", type: "text" },
    ]);
    expect(line2.upToPos(9).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
      { text: " slo", type: "text" },
    ]);
    expect(line2.upToPos(10).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
    expect(line2.upToPos(11).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
  });

  test("fromPos", async () => {
    const line = new EditorV3Line("0123.456", defaultContentProps);
    expect(line.fromPos(0).map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
    expect(line.fromPos(4).map((tb) => tb.data)).toEqual([{ text: ".456", type: "text" }]);
    expect(line.fromPos(7).map((tb) => tb.data)).toEqual([{ text: "6", type: "text" }]);
    expect(line.fromPos(8).map((tb) => tb.data)).toEqual([]);

    const line2 = new EditorV3Line(
      [new EditorV3TextBlock("hello", "world"), new EditorV3TextBlock(" slow")],
      defaultContentProps,
    );
    expect(line2.fromPos(0).map((tb) => tb.data)).toEqual([
      { text: "hello", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
    expect(line2.fromPos(1).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
    expect(line2.fromPos(2).map((tb) => tb.data)).toEqual([
      { text: "llo", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
    expect(line2.fromPos(3).map((tb) => tb.data)).toEqual([
      { text: "lo", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
    expect(line2.fromPos(4).map((tb) => tb.data)).toEqual([
      { text: "o", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
    expect(line2.fromPos(5).map((tb) => tb.data)).toEqual([{ text: " slow", type: "text" }]);
    expect(line2.fromPos(6).map((tb) => tb.data)).toEqual([{ text: "slow", type: "text" }]);
    expect(line2.fromPos(7).map((tb) => tb.data)).toEqual([{ text: "low", type: "text" }]);
    expect(line2.fromPos(8).map((tb) => tb.data)).toEqual([{ text: "ow", type: "text" }]);
    expect(line2.fromPos(9).map((tb) => tb.data)).toEqual([{ text: "w", type: "text" }]);
    expect(line2.fromPos(10).map((tb) => tb.data)).toEqual([]);
  });

  test("subBlocks", () => {
    const line2 = new EditorV3Line(
      [new EditorV3TextBlock("hello", "world"), new EditorV3TextBlock(" slow")],
      defaultContentProps,
    );
    expect(line2.subBlocks(1, 1).map((tb) => tb.data)).toEqual([]);
    expect(line2.subBlocks(1, 2).map((tb) => tb.data)).toEqual([
      { text: "e", style: "world", type: "text" },
    ]);
    expect(line2.subBlocks(1, 3).map((tb) => tb.data)).toEqual([
      { text: "el", style: "world", type: "text" },
    ]);
    expect(line2.subBlocks(1, 4).map((tb) => tb.data)).toEqual([
      { text: "ell", style: "world", type: "text" },
    ]);
    expect(line2.subBlocks(1, 5).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
    ]);
    expect(line2.subBlocks(1, 6).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " ", type: "text" },
    ]);
    expect(line2.subBlocks(1, 7).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " s", type: "text" },
    ]);
    expect(line2.subBlocks(1, 8).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " sl", type: "text" },
    ]);
    expect(line2.subBlocks(1, 9).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " slo", type: "text" },
    ]);
    expect(line2.subBlocks(2, 9).map((tb) => tb.data)).toEqual([
      { text: "llo", style: "world", type: "text" },
      { text: " slo", type: "text" },
    ]);
    expect(line2.subBlocks(3, 9).map((tb) => tb.data)).toEqual([
      { text: "lo", style: "world", type: "text" },
      { text: " slo", type: "text" },
    ]);
    expect(line2.subBlocks(4, 9).map((tb) => tb.data)).toEqual([
      { text: "o", style: "world", type: "text" },
      { text: " slo", type: "text" },
    ]);
    expect(line2.subBlocks(5, 9).map((tb) => tb.data)).toEqual([{ text: " slo", type: "text" }]);
    expect(line2.subBlocks(6, 9).map((tb) => tb.data)).toEqual([{ text: "slo", type: "text" }]);
    expect(line2.subBlocks(7, 9).map((tb) => tb.data)).toEqual([{ text: "lo", type: "text" }]);
    expect(line2.subBlocks(8, 9).map((tb) => tb.data)).toEqual([{ text: "o", type: "text" }]);
    expect(line2.subBlocks(9, 9).map((tb) => tb.data)).toEqual([]);
  });

  test("splitLine", async () => {
    const line1 = new EditorV3Line("0123.456", defaultContentProps);
    const split1 = line1.splitLine(0);
    expect(split1?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
    expect(line1.textBlocks.map((tb) => tb.data)).toEqual([{ text: "", type: "text" }]);

    const line2 = new EditorV3Line("0123.456", defaultContentProps);
    const split2 = line2.splitLine(4);
    expect(split2?.textBlocks.map((tb) => tb.data)).toEqual([{ text: ".456", type: "text" }]);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123", type: "text" }]);

    const line3 = new EditorV3Line("0123.456", defaultContentProps);
    const split3 = line3.splitLine(7);
    expect(split3?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "6", type: "text" }]);
    expect(line3.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.45", type: "text" }]);

    const line4 = new EditorV3Line("0123.456", defaultContentProps);
    const split4 = line4.splitLine(8);
    expect(split4?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "", type: "text" }]);
    expect(line4.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);

    const line5 = new EditorV3Line("0123.456", defaultContentProps);
    const split5 = line5.splitLine(9);
    expect(split5?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "", type: "text" }]);
    expect(line5.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
  });

  test("insertBlocks", async () => {
    const line1 = new EditorV3Line("0123.456", defaultContentProps);
    line1.insertBlocks([new EditorV3TextBlock("hello")], 3);
    expect(line1.lineText).toEqual("012hello3.456");
    expect(line1.textBlocks.length).toEqual(1);

    const line2 = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
    ]);
    line2.insertBlocks(
      [
        new EditorV3TextBlock("tree"),
        new EditorV3TextBlock("pie", "lid"),
        new EditorV3TextBlock("pie", "world"),
      ],
      0,
    );
    expect(JSON.parse(line2.jsonString)).toEqual({
      textBlocks: [
        { text: "tree", type: "text" },
        { text: "pie", style: "lid", type: "text" },
        { text: "piehello", style: "world", type: "text" },
        { text: " slow", type: "text" },
      ],
    });
  });

  test("removeSection", async () => {
    const line1 = new EditorV3Line("0123.456", defaultContentProps);
    line1.insertBlocks([new EditorV3TextBlock("hello")], 3);
    expect(line1.lineText).toEqual("012hello3.456");
    expect(line1.textBlocks.length).toEqual(1);
    const line2 = new EditorV3Line(
      [new EditorV3TextBlock("hello", "world"), new EditorV3TextBlock(" slow")],
      defaultContentProps,
    );
    line2.removeSection(4, 7);
    expect(JSON.parse(line2.jsonString)).toEqual({
      textBlocks: [
        { text: "hell", style: "world", type: "text" },
        { text: "low", type: "text" },
      ],
    });
  });

  test("deleteCharacter", async () => {
    const line2 = new EditorV3Line(
      [new EditorV3TextBlock("hello", "world"), new EditorV3TextBlock(" slow")],
      defaultContentProps,
    );
    line2.deleteCharacter(4);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hell", style: "world", type: "text" },
      { text: " slow", type: "text" },
    ]);
    line2.deleteCharacter(4);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hell", style: "world", type: "text" },
      { text: "slow", type: "text" },
    ]);
    line2.deleteCharacter(41);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hell", style: "world", type: "text" },
      { text: "slow", type: "text" },
    ]);
    line2.deleteCharacter(0);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "ell", style: "world", type: "text" },
      { text: "slow", type: "text" },
    ]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "ell", style: "world", type: "text" },
      { text: "slo", type: "text" },
    ]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "ell", style: "world", type: "text" },
      { text: "slo", type: "text" },
    ]);
  });

  test("applyStyle & removeStyle", async () => {
    const line2 = new EditorV3Line(
      [new EditorV3TextBlock("hello", "world"), new EditorV3TextBlock(" slow")],
      defaultContentProps,
    );
    line2.applyStyle("drive", 3, 6);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hel", style: "world", type: "text" },
      { text: "lo ", style: "drive", type: "text" },
      { text: "slow", type: "text" },
    ]);
    line2.applyStyle("world", 3, 4);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hell", style: "world", type: "text" },
      { text: "o ", style: "drive", type: "text" },
      { text: "slow", type: "text" },
    ]);
    line2.applyStyle("caps", 0, 0);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hell", style: "world", type: "text" },
      { text: "o ", style: "drive", type: "text" },
      { text: "slow", type: "text" },
    ]);
    line2.removeStyle(3, 7);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hel", style: "world", type: "text" },
      { text: "lo slow", type: "text" },
    ]);
    line2.removeStyle(1, 1);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hel", style: "world", type: "text" },
      { text: "lo slow", type: "text" },
    ]);
  });

  test("Generate markdown", async () => {
    const mdLine = new EditorV3Line(
      [
        new EditorV3TextBlock("hello", "world"),
        new EditorV3TextBlock(" slow"),
        new EditorV3TextBlock("and?fat", "defaultStyle"),
      ],
      defaultContentProps,
    );
    expect(mdLine.toMarkdown()).toEqual("<<world::hello>> slow<<and?fat>>");
  });

  test("Load markdown html strings", async () => {
    const htmlString = '<div class="aiev3-markdown-line">Some html</div>';
    const testLine = new EditorV3Line(htmlString, defaultContentProps);
    expect(testLine.textBlocks).toEqual([new EditorV3TextBlock("Some html")]);
    expect(testLine.contentProps).toEqual(defaultContentProps);

    const htmlString2 =
      '<div class="aiev3-markdown-line">&lt;&lt;red::Hello world&gt;&gt;</span></div>';
    const testLine2 = new EditorV3Line(htmlString2, defaultContentProps);
    expect(testLine2.textBlocks).toEqual([
      new EditorV3TextBlock({ text: "Hello world", style: "red" }),
    ]);
  });

  test("Load markdown div elements", async () => {
    const div = document.createElement("div");
    const text = document.createTextNode("<<st1::what>> are you doing? <<with that>> thing?");
    div.appendChild(text);

    const result = new EditorV3Line(div, defaultContentProps);

    expect(result.textBlocks).toEqual([
      new EditorV3TextBlock({ text: "what", style: "st1" }),
      new EditorV3TextBlock(" are you doing? "),
      new EditorV3TextBlock({ text: "with that", style: "defaultStyle" }),
      new EditorV3TextBlock(" thing?"),
    ]);
  });
});

describe("Read in v2 div element", () => {
  test("Read basic div element", async () => {
    const htmlString =
      '<div classname="aie-text" data-key="3fsuc" data-type="unstyled" data-inline-style-ranges=\'[{"offset":32,"length":9,"style":"Optional"}]\'>[b] CR, non-measurable disease: <span classname="Optional" style="color:seagreen">Confirmed</span>' +
      " CR response but subject has non-measurable disease at baseline.</div>";
    const result = new EditorV3Line(htmlString, defaultContentProps);
    expect(result.textBlocks.length).toEqual(3);
    expect(result.textBlocks[0].data).toEqual({
      style: undefined,
      text: "[b] CR, non-measurable disease: ",
      type: "text",
    });
    expect(result.textBlocks[1].data).toEqual({
      style: "Optional",
      text: "Confirmed",
      type: "text",
    });
    expect(result.textBlocks[2].data).toEqual({
      style: undefined,
      text: " CR response but subject has non-measurable disease at baseline.",
      type: "text",
    });
  });
});
