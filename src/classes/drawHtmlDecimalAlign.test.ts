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
    expect(div.outerHTML).toEqual(
      `<div style="grid-template-columns: 40% 60%;">
        <span class="aiev3-span-point lhs"><span class="aiev3-tb">12.</span></span>
        <span class="aiev3-span-point rhs"><span class="aiev3-tb">34</span></span>
      </div>`
        .replaceAll(/[\r\n\t]/g, "")
        .replaceAll(/>\s{2,}</g, "><")
        .trim(),
    );
  });
  test("Draw without right", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(
      { currentEl: div },
      { ...defaultContentProps, decimalAlignPercent: 40 },
      [textBlockFactory({ text: "1234" })],
      [],
    );
    expect(div.outerHTML).toEqual(
      `<div style="grid-template-columns: 40% 60%;">
        <span class="aiev3-span-point lhs"><span class="aiev3-tb">1234</span></span>
        <span class="aiev3-span-point rhs">\u2009</span>
        </div>`
        .replaceAll(/[\r\n\t]/g, "")
        .replaceAll(/>\s{2,}</g, "><")
        .trim(),
    );
  });
  test("Draw without left", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(
      { currentEl: div },
      { ...defaultContentProps, decimalAlignPercent: 75 },
      [],
      [textBlockFactory({ text: "34" })],
    );
    expect(div.outerHTML).toEqual(
      `<div style="grid-template-columns: 75% 25%;">
        <span class="aiev3-span-point lhs">\u2009</span>
        <span class="aiev3-span-point rhs"><span class="aiev3-tb">34</span></span>
      </div>`
        .replaceAll(/[\r\n\t]/g, "")
        .replaceAll(/>\s{2,}</g, "><")
        .trim(),
    );
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
        <span class="aiev3-span-point lhs">\u2009</span>
        <span class="aiev3-span-point rhs">\u2009</span>
      </div>`
        .replaceAll(/[\r\n\t]/g, "")
        .replaceAll(/>\s{2,}</g, "><")
        .trim(),
    );
  });
});
