/* eslint-disable quotes */
import { defaultContentProps } from "classes/defaultContentProps";
import { textBlockFactory } from "../classes/textBlockFactory";
import { readV3Html } from "./readV3Html";

describe("readV3Html tests", () => {
  test("Read v3-html string input with line nodes", async () => {
    const text = `
      <div class="aiev3-line left"><span class="aiev3-tb">Hello world</span></div>
      <div class="aiev3-line left"><span class="aiev3-tb">How are you?</span></div>
      `
      .replaceAll(/[\r\n\t]/g, "")
      .replaceAll(/>\s{2,}</g, "><")
      .trim();
    const result = readV3Html(text, defaultContentProps);
    expect(result.lines.length).toEqual(2);
    expect(result.lines[0].textBlocks[0]).toEqual(textBlockFactory({ text: "Hello world" }));
    expect(result.lines[1].textBlocks[0]).toEqual(textBlockFactory({ text: "How are you?" }));
  });

  test("Read v3-markdown string input with line nodes", async () => {
    const text = `
      <div class="aiev3-markdown-line">(~(Hello world)~)</div>
      <div class="aiev3-markdown-line">(~(st1::How are you?)~)</div>
      `
      .replaceAll(/[\r\n\t]/g, "")
      .replaceAll(/>\s{2,}</g, "><")
      .trim();
    const result = readV3Html(text, defaultContentProps);
    expect(result.lines.length).toEqual(2);
    expect(result.lines[0].textBlocks).toEqual([
      textBlockFactory({ text: "Hello world", style: "defaultStyle" }),
    ]);
    expect(result.lines[1].textBlocks).toEqual([
      textBlockFactory({ text: "How are you?", style: "st1" }),
    ]);
  });

  test("Read text(ish) input", async () => {
    const text = "Hello world\nHow are you?";
    const result = readV3Html(text, defaultContentProps);
    expect(result.lines.length).toEqual(2);
    expect(result.lines[0].textBlocks).toEqual([textBlockFactory({ text: "Hello world" })]);
    expect(result.lines[1].textBlocks).toEqual([textBlockFactory({ text: "How are you?" })]);
  });

  test("Read in at block", async () => {
    const text = `
      <div class="aiev3-line left">
        <span class="aiev3-tb at-block" data-type="at" title="Hello@world">@Hello world</span>
      </div>
      `
      .replaceAll(/[\r\n\t]/g, "")
      .replaceAll(/>\s{1,}</g, "><")
      .trim();
    const result = readV3Html(text, defaultContentProps);
    expect(result.lines.length).toEqual(1);
    expect(result.lines[0].textBlocks).toMatchSnapshot();
  });
});
