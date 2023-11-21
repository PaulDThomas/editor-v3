import { readV3Html } from "./readV3Html";
import { EditorV3Align } from "../classes/interface";
import { EditorV3TextBlock } from "../classes/EditorV3TextBlock";

describe("readV3Html tests", () => {
  test("Read v3-html string input with line nodes", async () => {
    const text =
      `<div class="aiev3-line left"><span class="aiev3-tb">Hello world</span></div>` +
      `<div class="aiev3-line center"><span class="aiev3-tb">How are you?</span></div>`
        .replaceAll(/[\r\n\t]/g, "")
        .replaceAll(/>\s{2,}</g, "><")
        .trim();
    const result = readV3Html(text);
    expect(result.lines.length).toEqual(2);
    expect(result.lines[0].textBlocks[0]).toEqual(new EditorV3TextBlock("Hello world"));
    expect(result.lines[0].textAlignment).toEqual(EditorV3Align.left);
    expect(result.lines[1].textBlocks[0]).toEqual(new EditorV3TextBlock("How are you?"));
    expect(result.lines[1].textAlignment).toEqual(EditorV3Align.center);
  });

  test("Read v3-html string input with style node", () => {
    const text = `
      <div class="aiev3-line left">
        <span class="aiev3-tb">Hello world</span>
      </div>
      <div class="aiev3-style-info" data-style='{"color": "red"}'></div>
    `
      .replaceAll(/[\r\n\t]/g, "")
      .replaceAll(/>\s{2,}</g, "><")
      .trim();
    const result = readV3Html(text);
    expect(result.styles).toEqual({ color: "red" });
  });

  test("Read v3-markdown string input with line nodes", async () => {
    const text = `
      <div class="aiev3-markdown-line">&lt;&lt;Hello world&gt;&gt;</div>
      <div class="aiev3-markdown-line">&lt;&lt;st1::How are you?&gt;&gt;</div>
    `
      .replaceAll(/[\r\n\t]/g, "")
      .replaceAll(/>\s{2,}</g, "><")
      .trim();
    const result = readV3Html(text);
    expect(result.lines.length).toEqual(2);
    expect(result.lines[0].textBlocks).toEqual([
      new EditorV3TextBlock({ text: "Hello world", style: "defaultStyle" }),
    ]);
    expect(result.lines[1].textBlocks).toEqual([
      new EditorV3TextBlock({ text: "How are you?", style: "st1" }),
    ]);
  });

  test("Read v3-markdown string input with style node", async () => {
    const text = `
      <div class="aiev3-markdown-line">&lt;&lt;red::Hello world&gt;&gt;</div>
      <div class="aiev3-style-info" data-style='[{"redStyle":{"color": "red"}}]'></div>
    `
      .replaceAll(/[\r\n\t]/g, "")
      .replaceAll(/>\s{1,}</g, "><")
      .trim();
    const result = readV3Html(text);
    expect(result.styles).toEqual([{ redStyle: { color: "red" } }]);
  });

  test("Read text(ish) input", async () => {
    const text = "Hello world\nHow are you?";
    const result = readV3Html(text);
    expect(result.lines.length).toEqual(2);
    expect(result.lines[0].textBlocks).toEqual([new EditorV3TextBlock("Hello world")]);
    expect(result.lines[1].textBlocks).toEqual([new EditorV3TextBlock("How are you?")]);
  });
});
