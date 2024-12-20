/* eslint-disable quotes */
import { defaultContentProps } from "./defaultContentProps";
import { EditorV3AtBlock } from "./EditorV3AtBlock";
import { EditorV3Line } from "./EditorV3Line";
import { EditorV3SelectBlock } from "./EditorV3SelectBlock";
import { EditorV3TextBlock } from "./EditorV3TextBlock";
import { EditorV3Align } from "./interface";
import { textBlockFactory } from "./textBlockFactory";

describe("Check basic EditorV3Line", () => {
  test("Load string", async () => {
    const testLine = new EditorV3Line([textBlockFactory({ text: "Hello world" })]);
    expect(testLine.toHtml({}).outerHTML).toMatchSnapshot();
    expect(testLine.lineText).toEqual("Hello world");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.left);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(60);
  });

  test("Load string with line breaks, tabs", async () => {
    const testLine = new EditorV3Line([textBlockFactory({ text: "  Hello \r\n\t world  " })], {
      ...defaultContentProps,
      textAlignment: EditorV3Align.center,
      decimalAlignPercent: 22,
    });
    expect(testLine.toHtml({}).outerHTML).toMatchSnapshot();
    expect(testLine.lineText).toEqual("  Hello  world  ");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.center);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(22);
  });

  test("Load textBlocks, test getStyleAt", async () => {
    const testLine = new EditorV3Line(
      [
        textBlockFactory({ text: "Hello\u00a0world, " }),
        textBlockFactory({ text: "How is it going?" }, { style: "shiny" }),
      ],
      defaultContentProps,
    );
    expect(testLine.toHtml({}).outerHTML).toMatchSnapshot();
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
        textBlockFactory({ text: "Hello\u00a0world. " }),
        textBlockFactory({ text: "How is it going?" }, { style: "shiny" }),
      ],
      { ...defaultContentProps, textAlignment: EditorV3Align.decimal },
    );
    expect(testLine.toHtml({}).outerHTML).toMatchSnapshot();
    expect(testLine.lineText).toEqual("Hello\u00a0world. How is it going?");
    expect(testLine.lineMarkdown).toEqual("Hello\u00a0world. (~(shiny::How is it going?)~)");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.decimal);
  });

  test("Load decimal text", async () => {
    const newDecimalTestLine = new EditorV3Line([textBlockFactory({ text: "q" })], {
      ...defaultContentProps,
      textAlignment: EditorV3Align.decimal,
    });
    expect(newDecimalTestLine.toHtml({}).outerHTML).toMatchSnapshot();
    const testLine = new EditorV3Line([textBlockFactory({ text: "12.34" })], {
      ...defaultContentProps,
      textAlignment: EditorV3Align.decimal,
    });
    expect(testLine.toHtml({}).outerHTML).toMatchSnapshot();
    expect(testLine.lineText).toEqual("12.34");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.contentProps.decimalAlignPercent).toEqual(60);
  });

  test("Load normal div", async () => {
    const testDiv = document.createElement("div");
    testDiv.classList.add("aiev3-line", "left");
    testDiv.innerHTML = "12.34";
    const testLine = new EditorV3Line(testDiv, {
      ...defaultContentProps,
      textAlignment: EditorV3Align.right,
    });

    expect(testLine.toHtml({}).outerHTML).toMatchSnapshot();
    expect(testLine.lineText).toEqual("12.34");
    expect(testLine.contentProps.textAlignment).toEqual(EditorV3Align.right);
  });

  test("Self equivalence for non-decimal", async () => {
    const firstLine = new EditorV3Line([textBlockFactory({ text: "12.34 Hello " })], {
      ...defaultContentProps,
      textAlignment: EditorV3Align.right,
    });
    expect(new EditorV3Line(firstLine.toHtml({}))).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.data)).toEqual(firstLine);
  });

  test("Self equivalence for decimal", async () => {
    const firstLine = new EditorV3Line([textBlockFactory({ text: "12.34" })], {
      ...defaultContentProps,
      textAlignment: EditorV3Align.decimal,
    });
    const readToHtml = new EditorV3Line(firstLine.toHtml({}));
    expect(readToHtml.data).toEqual(firstLine.data);
    const readData = new EditorV3Line(firstLine.data);
    expect(readData.data).toEqual(firstLine.data);
  });
});

describe("Check EditorV3Line functions", () => {
  test("upToPos", async () => {
    const line = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    expect(line.upToPos(0).map((tb) => tb.data)).toEqual([]);
    expect(line.upToPos(4).map((tb) => tb.data)).toEqual([{ text: "0123", type: "text" }]);
    expect(line.upToPos(7).map((tb) => tb.data)).toEqual([{ text: "0123.45", type: "text" }]);
    expect(line.upToPos(8).map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
    expect(line.upToPos(10).map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);

    const line2 = new EditorV3Line(
      [
        textBlockFactory({ text: "hello" }, { style: "world" }),
        textBlockFactory({ text: " slow" }),
      ],
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
    const line = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    expect(line.fromPos(0).map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
    expect(line.fromPos(4).map((tb) => tb.data)).toEqual([{ text: ".456", type: "text" }]);
    expect(line.fromPos(7).map((tb) => tb.data)).toEqual([{ text: "6", type: "text" }]);
    expect(line.fromPos(8).map((tb) => tb.data)).toEqual([]);

    const line2 = new EditorV3Line(
      [
        textBlockFactory({ text: "hello" }, { style: "world" }),
        textBlockFactory({ text: " slow" }),
      ],
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

  test("subBlocks by hand", () => {
    const line2 = new EditorV3Line(
      [
        textBlockFactory({ text: "hello" }, { style: "world" }),
        new EditorV3SelectBlock({ text: " locked" }),
        textBlockFactory({ text: " slow", label: "end" }),
      ],
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
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
    ]);
    expect(line2.subBlocks(1, 12).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
    ]);
    expect(line2.subBlocks(1, 13).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " ", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(1, 14).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " s", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(1, 15).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " sl", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(1, 16).map((tb) => tb.data)).toEqual([
      { text: "ello", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " slo", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(2, 16).map((tb) => tb.data)).toEqual([
      { text: "llo", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " slo", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(3, 16).map((tb) => tb.data)).toEqual([
      { text: "lo", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " slo", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(4, 16).map((tb) => tb.data)).toEqual([
      { text: "o", style: "world", type: "text" },
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " slo", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(5, 18).map((tb) => tb.data)).toEqual([
      { text: " locked", type: "select", availableOptions: [], isLocked: true },
      { text: " slow", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(6, 18, true).map((tb) => tb.data)).toEqual([
      { text: "locked", type: "select", availableOptions: [], isLocked: true },
      { text: " slow", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(6, 18).map((tb) => tb.data)).toEqual([
      { text: " slow", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(12, 18, true).map((tb) => tb.data)).toEqual([
      { text: " slow", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(12, 18).map((tb) => tb.data)).toEqual([
      { text: " slow", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(13, 18).map((tb) => tb.data)).toEqual([
      { text: "slow", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(14, 16).map((tb) => tb.data)).toEqual([
      { text: "lo", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(15, 16).map((tb) => tb.data)).toEqual([
      { text: "o", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(16, 17).map((tb) => tb.data)).toEqual([
      { text: "w", type: "text", label: "end" },
    ]);
    expect(line2.subBlocks(17, 17).map((tb) => tb.data)).toEqual([]);
  });

  test("subblock by text with split", () => {
    const line = new EditorV3Line([
      new EditorV3TextBlock({ text: "11111", style: "text" }),
      new EditorV3SelectBlock({
        text: "222222",
        style: "select",
        availableOptions: [
          {
            text: "one",
            data: { style: "pink" },
          },
          {
            text: "two",
            data: { noStyle: "true " },
          },
        ],
      }),
      new EditorV3AtBlock({
        text: "3333333",
        label: "end",
        style: "at",
        isLocked: true,
        atData: { email: "some@one", id: "great" },
      }),
    ]);
    const lineText: { start: number; end: number; text: string }[] = [];
    const subblocksText: { start: number; end: number; text: string }[] = [];
    const subblocksStyleType = new Set<string>();
    for (let start = 0; start < line.lineLength; start++) {
      for (let end = start + 1; end <= line.lineLength; end++) {
        lineText.push({ start, end, text: line.lineText.slice(start, end) });
        const res = line.subBlocks(start, end, true);
        subblocksText.push({
          start,
          end,
          text: res.map((tb) => tb.text).join(""),
        });
        res.map((tb) => `${tb.type}-${tb.style}`).forEach((s) => subblocksStyleType.add(s));
      }
    }
    expect(subblocksText).toEqual(lineText);
    expect(subblocksStyleType).toEqual(new Set(["text-text", "select-select", "at-at"]));
  });

  test("subblock by text with no split", () => {
    const line = new EditorV3Line([
      new EditorV3TextBlock({ text: "11111", style: "text" }),
      new EditorV3SelectBlock({
        text: "222222",
        style: "select",
        availableOptions: [
          {
            text: "one",
            data: { style: "pink" },
          },
          {
            text: "two",
            data: { noStyle: "true " },
          },
        ],
      }),
      new EditorV3AtBlock({
        text: "3333333",
        label: "end",
        style: "at",
        isLocked: true,
        atData: { email: "some@one", id: "great" },
      }),
    ]);
    const lineText: { start: number; end: number; text: string }[] = [];
    const subblocksText: { start: number; end: number; text: string }[] = [];
    const subblocksStyleType = new Set<string>();
    for (let start = 0; start < line.lineLength; start++) {
      for (let end = start + 1; end <= line.lineLength; end++) {
        const lockedStart = start < 6 ? start : start < 12 ? 11 : line.lineLength;
        const lockedEnd = end < 6 ? end : end < 12 ? 11 : line.lineLength;
        lineText.push({
          start: start,
          end: end,
          text: line.lineText.slice(lockedStart, lockedEnd),
        });
        const res = line.subBlocks(start, end, false);
        subblocksText.push({
          start,
          end,
          text: res.map((tb) => tb.text).join(""),
        });
        res.map((tb) => `${tb.type}-${tb.style}`).forEach((s) => subblocksStyleType.add(s));
      }
    }
    expect(subblocksText).toEqual(lineText);
    expect(subblocksStyleType).toEqual(new Set(["text-text", "select-select", "at-at"]));
  });

  test("splitLine", async () => {
    const line1 = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    const split1 = line1.splitLine(0);
    expect(split1?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
    expect(line1.textBlocks.map((tb) => tb.data)).toEqual([{ text: "", type: "text" }]);

    const line2 = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    const split2 = line2.splitLine(4);
    expect(split2?.textBlocks.map((tb) => tb.data)).toEqual([{ text: ".456", type: "text" }]);
    expect(line2.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123", type: "text" }]);

    const line3 = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    const split3 = line3.splitLine(7);
    expect(split3?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "6", type: "text" }]);
    expect(line3.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.45", type: "text" }]);

    const line4 = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    const split4 = line4.splitLine(8);
    expect(split4?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "", type: "text" }]);
    expect(line4.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);

    const line5 = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    const split5 = line5.splitLine(9);
    expect(split5?.textBlocks.map((tb) => tb.data)).toEqual([{ text: "", type: "text" }]);
    expect(line5.textBlocks.map((tb) => tb.data)).toEqual([{ text: "0123.456", type: "text" }]);
  });

  test("insertBlocks", async () => {
    const line1 = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    line1.insertBlocks([textBlockFactory({ text: "hello" })], 3);
    expect(line1.lineText).toEqual("012hello3.456");
    expect(line1.textBlocks.length).toEqual(1);

    const line2 = new EditorV3Line([
      textBlockFactory({ text: "hello" }, { style: "world" }),
      textBlockFactory({ text: " slow" }),
    ]);
    line2.insertBlocks(
      [
        textBlockFactory({ text: "tree" }),
        textBlockFactory({ text: "pie" }, { style: "lid" }),
        textBlockFactory({ text: "pie" }, { style: "world" }),
      ],
      0,
    );
    expect(line2.data).toEqual({
      textBlocks: [
        { text: "tree", type: "text" },
        { text: "pie", style: "lid", type: "text" },
        { text: "piehello", style: "world", type: "text" },
        { text: " slow", type: "text" },
      ],
    });
  });

  test("removeSection", async () => {
    const line1 = new EditorV3Line([textBlockFactory({ text: "0123.456" })], defaultContentProps);
    line1.insertBlocks([textBlockFactory({ text: "hello" })], 3);
    expect(line1.lineText).toEqual("012hello3.456");
    expect(line1.textBlocks.length).toEqual(1);
    const line2 = new EditorV3Line(
      [
        textBlockFactory({ text: "hello" }, { style: "world" }),
        textBlockFactory({ text: " slow" }),
      ],
      defaultContentProps,
    );
    line2.removeSection(4, 7);
    expect(line2.data).toEqual({
      textBlocks: [
        { text: "hell", style: "world", type: "text" },
        { text: "low", type: "text" },
      ],
    });
  });

  test("deleteCharacter", async () => {
    const line2 = new EditorV3Line(
      [
        textBlockFactory({ text: "hello" }, { style: "world" }),
        textBlockFactory({ text: " slow" }),
      ],
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
      [
        textBlockFactory({ text: "hello" }, { style: "world" }),
        textBlockFactory({ text: " slow" }),
      ],
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
        textBlockFactory({ text: "hello" }, { style: "world", label: "label" }),
        textBlockFactory({ text: " slow" }),
        textBlockFactory({ text: "and?fat" }, { style: "defaultStyle" }),
      ],
      defaultContentProps,
    );
    expect(mdLine.toMarkdown({}).textContent).toEqual(
      "(~(world::label::hello)~) slow(~(and?fat)~)",
    );
  });

  test("Load markdown div elements", async () => {
    const mdText =
      "(~(st1::what)~) are you doing? @[st2::Hello@bloke**{}@] fancy coming back to my (~(green::color::green)~)(¬(choose**home||green::lily pad||garage)¬)?";
    const div = document.createElement("div");
    div.classList.add("aiev3-markdown-line");
    const text = document.createTextNode(mdText);
    div.appendChild(text);

    const result = new EditorV3Line(div, defaultContentProps);
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([
      { type: "text", text: "what", style: "st1" },
      { type: "text", text: " are you doing? " },
      { type: "at", text: "Hello@bloke", style: "st2" },
      { type: "text", text: " fancy coming back to my " },
      { type: "text", text: "green", label: "color", style: "green" },
      {
        type: "select",
        text: "choose",
        isLocked: true,
        availableOptions: [
          { text: "home", data: { noStyle: "true" } },
          { text: "lily pad", data: { style: "green" } },
          { text: "garage", data: { noStyle: "true" } },
        ],
      },
      { type: "text", text: "?" },
    ]);

    const result2 = new EditorV3Line(mdText);
    expect(result2.textBlocks.map((tb) => tb.data)).toEqual(result.textBlocks.map((tb) => tb.data));
  });
});

describe("Check active block", () => {
  const tb = new EditorV3TextBlock({ text: "one " });
  const ta = new EditorV3AtBlock({ text: "two " });
  const ts = new EditorV3SelectBlock({ text: "three " });
  const line = new EditorV3Line([tb, ta, ts]);
  test("Set first block active", async () => {
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
      }),
    ).toEqual({ ...tb, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 1,
        endLine: 0,
        endChar: 1,
      }),
    ).toEqual({ ...tb, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 2,
        endLine: 0,
        endChar: 2,
      }),
    ).toEqual({ ...tb, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 3,
        endLine: 0,
        endChar: 3,
      }),
    ).toEqual({ ...tb, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 4,
        endLine: 0,
        endChar: 4,
      }),
    ).toEqual({ ...ta, lineStartPosition: 4, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 5,
      }),
    ).toEqual({ ...ta, lineStartPosition: 4, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 6,
        endLine: 0,
        endChar: 6,
      }),
    ).toEqual({ ...ta, lineStartPosition: 4, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 7,
        endLine: 0,
        endChar: 7,
      }),
    ).toEqual({ ...ta, lineStartPosition: 4, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 8,
        endLine: 0,
        endChar: 8,
      }),
    ).toEqual({ ...ta, lineStartPosition: 4, isActive: true });
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 9,
        endLine: 0,
        endChar: 9,
      })?.data,
    ).toEqual(ts.data);
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
      })?.data,
    ).toEqual(ts.data);
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 11,
        endLine: 0,
        endChar: 11,
      })?.data,
    ).toEqual(ts.data);
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 12,
        endLine: 0,
        endChar: 12,
      })?.data,
    ).toEqual(ts.data);
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 13,
        endLine: 0,
        endChar: 13,
      })?.data,
    ).toEqual(ts.data);
    expect(
      line.setActiveBlock({
        isCollapsed: true,
        startLine: 0,
        startChar: 14,
        endLine: 0,
        endChar: 14,
      }),
    ).toEqual(undefined);
  });
});

describe("Get word boundaries", () => {
  test("One word", async () => {
    const line = new EditorV3Line([textBlockFactory({ text: "Hello" })]);
    expect(line.wordPositions).toEqual([{ line: -1, startChar: 0, endChar: 5, isLocked: false }]);
    const line2 = new EditorV3Line([new EditorV3AtBlock({ text: "@Hello", isLocked: true })]);
    expect(line2.wordPositions).toEqual([{ line: -1, startChar: 0, endChar: 6, isLocked: true }]);
  });
  test("Many words", async () => {
    const line = new EditorV3Line([textBlockFactory({ text: "  What is going on \u00a0here?  " })]);
    expect(line.wordPositions).toEqual([
      { line: -1, startChar: 2, endChar: 6, isLocked: false },
      { line: -1, startChar: 7, endChar: 9, isLocked: false },
      { line: -1, startChar: 10, endChar: 15, isLocked: false },
      { line: -1, startChar: 16, endChar: 18, isLocked: false },
      { line: -1, startChar: 20, endChar: 25, isLocked: false },
    ]);
    const line2 = new EditorV3Line([
      new EditorV3TextBlock({ text: "What " }),
      new EditorV3AtBlock({ text: "@is", isLocked: true }),
      new EditorV3TextBlock({ text: " going on \u00a0here?" }),
    ]);
    expect(line2.wordPositions).toEqual([
      { line: -1, startChar: 0, endChar: 4, isLocked: false },
      { line: -1, startChar: 5, endChar: 8, isLocked: true },
      { line: -1, startChar: 9, endChar: 14, isLocked: false },
      { line: -1, startChar: 15, endChar: 17, isLocked: false },
      { line: -1, startChar: 19, endChar: 24, isLocked: false },
    ]);
  });
});

describe("Don't destroy at block!", () => {
  test("At block preserved", async () => {
    const line = new EditorV3Line([
      new EditorV3TextBlock({ text: "Who is " }),
      new EditorV3AtBlock({
        text: "@Jackie",
        isLocked: true,
        atData: { email: "Jackie@someEmail.com" },
      }),
      new EditorV3TextBlock({ text: ", and what is she doing there?" }),
    ]);
    expect(line.data).toEqual({
      textBlocks: [
        { text: "Who is ", type: "text" },
        { text: "@Jackie", type: "at", isLocked: true, atData: { email: "Jackie@someEmail.com" } },
        { text: ", and what is she doing there?", type: "text" },
      ],
    });
    expect(line.lineText).toEqual("Who is @Jackie, and what is she doing there?");
    // Apply style
    line.applyStyle("red", 0, line.lineLength);
    expect(line.data).toEqual({
      textBlocks: [
        { text: "Who is ", type: "text", style: "red" },
        {
          text: "@Jackie",
          type: "at",
          isLocked: true,
          style: "red",
          atData: { email: "Jackie@someEmail.com" },
        },
        { text: ", and what is she doing there?", type: "text", style: "red" },
      ],
    });
  });
});

describe("Don't destroy select block!", () => {
  test("Select block preserved", async () => {
    const line = new EditorV3Line([
      new EditorV3TextBlock({ text: "Who is " }),
      new EditorV3SelectBlock({
        text: "-- person --",
        label: "Select person",
        availableOptions: [{ text: "Rita" }, { text: "Bob" }, { text: "Sue" }],
      }),
    ]);
    expect(line.data).toEqual({
      textBlocks: [
        { text: "Who is ", type: "text" },
        {
          text: "-- person --",
          type: "select",
          isLocked: true,
          availableOptions: [
            {
              text: "Rita",
              data: { noStyle: "true" },
            },
            {
              text: "Bob",
              data: { noStyle: "true" },
            },
            {
              text: "Sue",
              data: { noStyle: "true" },
            },
          ],
          label: "Select person",
        },
      ],
    });
    expect(line.lineText).toEqual("Who is -- person --");
    // Apply style
    line.applyStyle("red", 0, line.lineLength - 2);
    expect(line.data).toEqual({
      textBlocks: [
        { text: "Who is ", type: "text", style: "red" },
        {
          text: "-- person --",
          type: "select",
          style: "red",
          isLocked: true,
          availableOptions: [
            {
              text: "Rita",
              data: { noStyle: "true" },
            },
            {
              text: "Bob",
              data: { noStyle: "true" },
            },
            {
              text: "Sue",
              data: { noStyle: "true" },
            },
          ],
          label: "Select person",
        },
      ],
    });
  });
});

describe("Lock style blocks", () => {
  test("Lock style blocks are created", async () => {
    const line = new EditorV3Line(
      {
        textBlocks: [
          new EditorV3TextBlock({ text: "Who is " }),
          new EditorV3TextBlock({ text: "Jackie", style: "red" }),
          new EditorV3TextBlock({ text: "Jack", style: "red" }),
        ],
        contentProps: {
          ...defaultContentProps,
          styles: { red: { color: "red", font: "courier", isLocked: false } },
        },
      },
      { ...defaultContentProps, styles: { red: { color: "red", isLocked: true } } },
    );
    expect(line.data.textBlocks).toEqual([
      { text: "Who is ", type: "text" },
      { text: "Jackie", type: "text", style: "red", isLocked: true },
      { text: "Jack", type: "text", style: "red", isLocked: true },
    ]);
  });
  test("Lock style is applied", async () => {
    const line = new EditorV3Line([new EditorV3TextBlock({ text: "Who is JackieJack" })], {
      ...defaultContentProps,
      styles: { red: { color: "red", isLocked: true } },
    });
    line.applyStyle("red", 4, 13);
    expect(line.data.textBlocks).toEqual([
      { text: "Who ", type: "text" },
      { text: "is Jackie", type: "text", style: "red", isLocked: true },
      { text: "Jack", type: "text" },
    ]);
  });
});
