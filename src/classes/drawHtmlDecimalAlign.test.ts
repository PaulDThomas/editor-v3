import { defaultContentProps } from "./defaultContentProps";
import { drawHtmlDecimalAlign } from "./drawHtmlDecimalAlign";
import { textBlockFactory } from "./textBlockFactory";

describe("Test draw decimal align function", () => {
  test("Draw with point", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(
      { currentEl: div },
      { ...defaultContentProps, decimalAlignPercent: 40 },
      [textBlockFactory({ text: "12." })],
      [textBlockFactory({ text: "34" })],
    );
    expect(div.outerHTML).toMatchSnapshot();
  });
  test("Draw without right", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(
      { currentEl: div },
      { ...defaultContentProps, decimalAlignPercent: 40 },
      [textBlockFactory({ text: "1234" })],
      [],
    );
    expect(div.outerHTML).toMatchSnapshot();
  });
  test("Draw without left", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(
      { currentEl: div },
      { ...defaultContentProps, decimalAlignPercent: 75 },
      [],
      [textBlockFactory({ text: "34" })],
    );
    expect(div.outerHTML).toMatchSnapshot();
  });
  test("Draw empty", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(
      { currentEl: div },
      { ...defaultContentProps, decimalAlignPercent: 35 },
      [],
      [],
    );
    expect(div.outerHTML).toEqual(
      `<div style="grid-template-columns: 35% 65%;">
        <span class="aiev3-span-point lhs">\u200b</span>
        <span class="aiev3-span-point rhs">\u200b</span>
      </div>`
        .replaceAll(/[\r\n\t]/g, "")
        .replaceAll(/>\s{2,}</g, "><")
        .trim(),
    );
  });
});
