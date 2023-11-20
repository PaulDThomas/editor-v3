import { EditorV3Line } from "./EditorV3Line";
import { EditorV3TextBlock } from "./EditorV3TextBlock";
import { EditorV3Align } from "./interface";

describe("Check basic EditorV3Line", () => {
  test("Load string", async () => {
    const testLine = new EditorV3Line("Hello world");
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line left"><span class="aiev3-tb">Hello world</span></div>',
    );
    expect(testLine.lineText).toEqual("Hello world");
    expect(testLine.textAlignment).toEqual(EditorV3Align.left);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test("Load string with line breaks, tabs", async () => {
    const testLine = new EditorV3Line("  Hello \r\n\t world  ", EditorV3Align.center, 22);
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line center"><span class="aiev3-tb">  Hello  world  </span></div>',
    );
    expect(testLine.lineText).toEqual("  Hello  world  ");
    expect(testLine.textAlignment).toEqual(EditorV3Align.center);
    expect(testLine.decimalAlignPercent).toEqual(22);
  });

  test("Load textBlocks, test getStyleAt", async () => {
    const testLine = new EditorV3Line([
      new EditorV3TextBlock("Hello\u00A0world, "),
      new EditorV3TextBlock("How is it going?", "shiny"),
    ]);
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line left">' +
        '<span class="aiev3-tb">Hello&nbsp;world, </span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">How is it going?</span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("Hello\u00a0world, How is it going?");
    expect(testLine.lineLength).toEqual(29);
    expect(testLine.textAlignment).toEqual(EditorV3Align.left);
    expect(testLine.decimalAlignPercent).toEqual(60);
    const styles: { l: number; v: string | undefined }[] = [];
    for (let i = 0; i <= testLine.lineLength + 1; i++) {
      styles.push({ l: i, v: testLine.getStyleAt(i) });
    }
    expect(styles).toEqual([
      { l: 0, v: undefined },
      { l: 1, v: undefined },
      { l: 2, v: undefined },
      { l: 3, v: undefined },
      { l: 4, v: undefined },
      { l: 5, v: undefined },
      { l: 6, v: undefined },
      { l: 7, v: undefined },
      { l: 8, v: undefined },
      { l: 9, v: undefined },
      { l: 10, v: undefined },
      { l: 11, v: undefined },
      { l: 12, v: undefined },
      { l: 13, v: undefined },
      { l: 14, v: "shiny" },
      { l: 15, v: "shiny" },
      { l: 16, v: "shiny" },
      { l: 17, v: "shiny" },
      { l: 18, v: "shiny" },
      { l: 19, v: "shiny" },
      { l: 20, v: "shiny" },
      { l: 21, v: "shiny" },
      { l: 22, v: "shiny" },
      { l: 23, v: "shiny" },
      { l: 24, v: "shiny" },
      { l: 25, v: "shiny" },
      { l: 26, v: "shiny" },
      { l: 27, v: "shiny" },
      { l: 28, v: "shiny" },
      { l: 29, v: "shiny" },
      { l: 30, v: undefined },
    ]);
  });

  test("Load decimal textBlocks", async () => {
    const testLine = new EditorV3Line(
      [
        new EditorV3TextBlock("Hello\u00A0world. "),
        new EditorV3TextBlock("How is it going?", "shiny"),
      ],
      EditorV3Align.decimal,
    );
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs" style="right: 40%; min-width: 60%;"><span class="aiev3-tb">Hello&nbsp;world</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 60%; min-width: 40%;">' +
        '<span class="aiev3-tb">. </span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">How is it going?</span>' +
        "</span>" +
        "</div>",
    );
    expect(testLine.lineText).toEqual("Hello\u00a0world. How is it going?");
    expect(testLine.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test("Load decimal text", async () => {
    const newDecimalTestLine = new EditorV3Line("q", EditorV3Align.decimal);
    expect(newDecimalTestLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs" style="right: 40%; min-width: 60%;"><span class="aiev3-tb">q</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 60%; min-width: 40%;"><span class="aiev3-tb">\u2009</span></span>' +
        "</div>",
    );
    const testLine = new EditorV3Line("12.34", EditorV3Align.decimal);
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs" style="right: 40%; min-width: 60%;"><span class="aiev3-tb">12</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 60%; min-width: 40%;"><span class="aiev3-tb">.34</span></span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("12.34");
    expect(testLine.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test("Load badly written decimal div", async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line decimal"><span data-style-name="shiny">12.34</span>&nbsp;slow</div>',
      EditorV3Align.decimal,
    );

    expect(testLine.lineText).toEqual("12.34\u00a0slow");
    expect(testLine.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.decimalAlignPercent).toEqual(60);
    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span-point lhs" style="right: 40%; min-width: 60%;">' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">12</span>' +
        "</span>" +
        '<span class="aiev3-span-point rhs" style="left: 60%; min-width: 40%;">' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">.34</span>' +
        '<span class="aiev3-tb">&nbsp;slow</span>' +
        "</span>" +
        "</div>",
    );
    expect(JSON.parse(testLine.jsonString)).toEqual({
      decimalAlignPercent: 60,
      textAlignment: "decimal",
      textBlocks: [{ text: "12.34", style: "shiny" }, { text: "\u00a0slow" }],
    });
    expect(new EditorV3Line(testLine.jsonString)).toEqual(testLine);
    expect(new EditorV3Line(testLine.toHtml())).toEqual(testLine);

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
      EditorV3Align.decimal,
    );
    expect(JSON.parse(testLine2.jsonString)).toEqual({
      decimalAlignPercent: 60,
      textAlignment: "decimal",
      textBlocks: [
        { text: "12.", style: "shiny" },
        { text: "boys" },
        { text: "34", style: "shiny" },
        { text: "\u00a0slow treats" },
      ],
    });
  });

  test("Load normal div", async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line left">12.34</div>',
      EditorV3Align.right,
    );

    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line right"><span class="aiev3-tb">12.34</span></div>',
    );
    expect(testLine.lineText).toEqual("12.34");
    expect(testLine.textAlignment).toEqual(EditorV3Align.right);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test("Load badly written spanned div", async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line right"><span>12.34</span> wut? <span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">5678</span></div>',
    );

    expect(testLine.toHtml().outerHTML).toEqual(
      '<div class="aiev3-line right">' +
        '<span class="aiev3-tb">12.34 wut? </span>' +
        '<span class="aiev3-tb editorv3style-shiny" data-style-name="shiny">5678</span>' +
        "</div>",
    );
    expect(testLine.lineText).toEqual("12.34 wut? 5678");
    expect(testLine.textAlignment).toEqual(EditorV3Align.right);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test("Self equivalence for non-decimal", async () => {
    const firstLine = new EditorV3Line(
      [new EditorV3TextBlock("12.34"), new EditorV3TextBlock(" Hello ")],
      EditorV3Align.left,
    );
    expect(new EditorV3Line(firstLine.toHtml())).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.toHtml().outerHTML)).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.jsonString)).toEqual(firstLine);
    expect(new EditorV3Line(JSON.stringify(firstLine))).toEqual(firstLine);
  });

  test("Self equivalence for decimal", async () => {
    const firstLine = new EditorV3Line("12.34", EditorV3Align.decimal);
    expect(new EditorV3Line(firstLine.toHtml())).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.toHtml().outerHTML)).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.jsonString)).toEqual(firstLine);
    expect(new EditorV3Line(JSON.stringify(firstLine))).toEqual(firstLine);
  });
});

describe("Check EditorV3Line functions", () => {
  test("upToPos", async () => {
    const line = new EditorV3Line("0123.456");
    expect(line.upToPos(0)).toEqual([{ text: "" }]);
    expect(line.upToPos(4)).toEqual([{ text: "0123" }]);
    expect(line.upToPos(7)).toEqual([{ text: "0123.45" }]);
    expect(line.upToPos(8)).toEqual([{ text: "0123.456" }]);
    expect(line.upToPos(10)).toEqual([{ text: "0123.456" }]);

    const line2 = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
    ]);
    expect(line2.upToPos(0)).toEqual([{ text: "", style: "world" }]);
    expect(line2.upToPos(1)).toEqual([{ text: "h", style: "world" }]);
    expect(line2.upToPos(2)).toEqual([{ text: "he", style: "world" }]);
    expect(line2.upToPos(3)).toEqual([{ text: "hel", style: "world" }]);
    expect(line2.upToPos(4)).toEqual([{ text: "hell", style: "world" }]);
    expect(line2.upToPos(5)).toEqual([{ text: "hello", style: "world" }]);
    expect(line2.upToPos(6)).toEqual([{ text: "hello", style: "world" }, { text: " " }]);
    expect(line2.upToPos(7)).toEqual([{ text: "hello", style: "world" }, { text: " s" }]);
    expect(line2.upToPos(8)).toEqual([{ text: "hello", style: "world" }, { text: " sl" }]);
    expect(line2.upToPos(9)).toEqual([{ text: "hello", style: "world" }, { text: " slo" }]);
    expect(line2.upToPos(10)).toEqual([{ text: "hello", style: "world" }, { text: " slow" }]);
    expect(line2.upToPos(11)).toEqual([{ text: "hello", style: "world" }, { text: " slow" }]);
  });

  test("fromPos", async () => {
    const line = new EditorV3Line("0123.456");
    expect(line.fromPos(0)).toEqual([{ text: "0123.456" }]);
    expect(line.fromPos(4)).toEqual([{ text: ".456" }]);
    expect(line.fromPos(7)).toEqual([{ text: "6" }]);
    expect(line.fromPos(8)).toEqual([{ text: "" }]);

    const line2 = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
    ]);
    expect(line2.fromPos(0)).toEqual([{ text: "hello", style: "world" }, { text: " slow" }]);
    expect(line2.fromPos(1)).toEqual([{ text: "ello", style: "world" }, { text: " slow" }]);
    expect(line2.fromPos(2)).toEqual([{ text: "llo", style: "world" }, { text: " slow" }]);
    expect(line2.fromPos(3)).toEqual([{ text: "lo", style: "world" }, { text: " slow" }]);
    expect(line2.fromPos(4)).toEqual([{ text: "o", style: "world" }, { text: " slow" }]);
    expect(line2.fromPos(5)).toEqual([{ text: " slow" }]);
    expect(line2.fromPos(6)).toEqual([{ text: "slow" }]);
    expect(line2.fromPos(7)).toEqual([{ text: "low" }]);
    expect(line2.fromPos(8)).toEqual([{ text: "ow" }]);
    expect(line2.fromPos(9)).toEqual([{ text: "w" }]);
    expect(line2.fromPos(10)).toEqual([{ text: "" }]);
  });

  test("subBlocks", () => {
    const line2 = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
    ]);
    expect(line2.subBlocks(1, 1)).toEqual([{ text: "", style: "world" }]);
    expect(line2.subBlocks(1, 2)).toEqual([{ text: "e", style: "world" }]);
    expect(line2.subBlocks(1, 3)).toEqual([{ text: "el", style: "world" }]);
    expect(line2.subBlocks(1, 4)).toEqual([{ text: "ell", style: "world" }]);
    expect(line2.subBlocks(1, 5)).toEqual([{ text: "ello", style: "world" }]);
    expect(line2.subBlocks(1, 6)).toEqual([{ text: "ello", style: "world" }, { text: " " }]);
    expect(line2.subBlocks(1, 7)).toEqual([{ text: "ello", style: "world" }, { text: " s" }]);
    expect(line2.subBlocks(1, 8)).toEqual([{ text: "ello", style: "world" }, { text: " sl" }]);
    expect(line2.subBlocks(1, 9)).toEqual([{ text: "ello", style: "world" }, { text: " slo" }]);
    expect(line2.subBlocks(2, 9)).toEqual([{ text: "llo", style: "world" }, { text: " slo" }]);
    expect(line2.subBlocks(3, 9)).toEqual([{ text: "lo", style: "world" }, { text: " slo" }]);
    expect(line2.subBlocks(4, 9)).toEqual([{ text: "o", style: "world" }, { text: " slo" }]);
    expect(line2.subBlocks(5, 9)).toEqual([{ text: " slo" }]);
    expect(line2.subBlocks(6, 9)).toEqual([{ text: "slo" }]);
    expect(line2.subBlocks(7, 9)).toEqual([{ text: "lo" }]);
    expect(line2.subBlocks(8, 9)).toEqual([{ text: "o" }]);
    expect(line2.subBlocks(9, 9)).toEqual([{ text: "" }]);
  });

  test("splitLine", async () => {
    const line1 = new EditorV3Line("0123.456");
    const split1 = line1.splitLine(0);
    expect(split1?.textBlocks).toEqual([{ text: "0123.456" }]);
    expect(line1.textBlocks).toEqual([{ text: "" }]);

    const line2 = new EditorV3Line("0123.456");
    const split2 = line2.splitLine(4);
    expect(split2?.textBlocks).toEqual([{ text: ".456" }]);
    expect(line2.textBlocks).toEqual([{ text: "0123" }]);

    const line3 = new EditorV3Line("0123.456");
    const split3 = line3.splitLine(7);
    expect(split3?.textBlocks).toEqual([{ text: "6" }]);
    expect(line3.textBlocks).toEqual([{ text: "0123.45" }]);

    const line4 = new EditorV3Line("0123.456");
    const split4 = line4.splitLine(8);
    expect(split4?.textBlocks).toEqual([{ text: "" }]);
    expect(line4.textBlocks).toEqual([{ text: "0123.456" }]);

    const line5 = new EditorV3Line("0123.456");
    const split5 = line5.splitLine(9);
    expect(split5?.textBlocks).toEqual([{ text: "" }]);
    expect(line5.textBlocks).toEqual([{ text: "0123.456" }]);
  });

  test("insertBlocks", async () => {
    const line1 = new EditorV3Line("0123.456");
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
      decimalAlignPercent: 60,
      textAlignment: "left",
      textBlocks: [
        { text: "tree" },
        { text: "pie", style: "lid" },
        { text: "piehello", style: "world" },
        { text: " slow" },
      ],
    });
  });

  test("removeSection", async () => {
    const line1 = new EditorV3Line("0123.456");
    line1.insertBlocks([new EditorV3TextBlock("hello")], 3);
    expect(line1.lineText).toEqual("012hello3.456");
    expect(line1.textBlocks.length).toEqual(1);
    const line2 = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
    ]);
    line2.removeSection(4, 7);
    expect(JSON.parse(line2.jsonString)).toEqual({
      textBlocks: [{ text: "hell", style: "world" }, { text: "low" }],
      decimalAlignPercent: 60,
      textAlignment: "left",
    });
  });

  test("deleteCharacter", async () => {
    const line2 = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
    ]);
    line2.deleteCharacter(4);
    expect(line2.textBlocks).toEqual([{ text: "hell", style: "world" }, { text: " slow" }]);
    line2.deleteCharacter(4);
    expect(line2.textBlocks).toEqual([{ text: "hell", style: "world" }, { text: "slow" }]);
    line2.deleteCharacter(41);
    expect(line2.textBlocks).toEqual([{ text: "hell", style: "world" }, { text: "slow" }]);
    line2.deleteCharacter(0);
    expect(line2.textBlocks).toEqual([{ text: "ell", style: "world" }, { text: "slow" }]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks).toEqual([{ text: "ell", style: "world" }, { text: "slo" }]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks).toEqual([{ text: "ell", style: "world" }, { text: "slo" }]);
  });

  test("applyStyle & removeStyle", async () => {
    const line2 = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
    ]);
    line2.applyStyle("drive", 3, 6);
    expect(line2.textBlocks).toEqual([
      { text: "hel", style: "world" },
      { text: "lo ", style: "drive" },
      { text: "slow" },
    ]);
    line2.applyStyle("world", 3, 4);
    expect(line2.textBlocks).toEqual([
      { text: "hell", style: "world" },
      { text: "o ", style: "drive" },
      { text: "slow" },
    ]);
    line2.applyStyle("caps", 0, 0);
    expect(line2.textBlocks).toEqual([
      { text: "hell", style: "world" },
      { text: "o ", style: "drive" },
      { text: "slow" },
    ]);
    line2.removeStyle(3, 7);
    expect(line2.textBlocks).toEqual([{ text: "hel", style: "world" }, { text: "lo slow" }]);
    line2.removeStyle(1, 1);
    expect(line2.textBlocks).toEqual([{ text: "hel", style: "world" }, { text: "lo slow" }]);
  });

  test("Generate markdown", async () => {
    const mdLine = new EditorV3Line([
      new EditorV3TextBlock("hello", "world"),
      new EditorV3TextBlock(" slow"),
      new EditorV3TextBlock("and?fat", "defaultStyle"),
    ]);
    expect(mdLine.toMarkdown()).toEqual("<<world::hello>> slow<<and?fat>>");
  });
});
