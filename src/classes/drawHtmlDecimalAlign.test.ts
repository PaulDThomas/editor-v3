/* eslint-disable quotes */
import { drawHtmlDecimalAlign } from "./drawHtmlDecimalAlign";
import { EditorV3TextBlock } from "./EditorV3TextBlock";

describe("Test draw decimal align function", () => {
  test("Draw with point", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(div, 40, [new EditorV3TextBlock("12.")], [new EditorV3TextBlock("34")]);
    expect(div.outerHTML).toEqual(
      '<div style="grid-template-columns: 40% 60%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">12.</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb">34</span></span>' +
        "</div>",
    );
  });
  test("Draw without right", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(div, 40, [new EditorV3TextBlock("1234")], []);
    expect(div.outerHTML).toEqual(
      '<div style="grid-template-columns: 40% 60%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">1234</span></span>' +
        '<span class="aiev3-span-point rhs">\u2009</span>' +
        "</div>",
    );
  });
  test("Draw without left", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(div, 75, [], [new EditorV3TextBlock("34")]);
    expect(div.outerHTML).toEqual(
      '<div style="grid-template-columns: 75% 25%;">' +
        '<span class="aiev3-span-point lhs">\u2009</span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb">34</span></span>' +
        "</div>",
    );
  });
  test("Draw empty", async () => {
    const div = document.createElement("div");
    drawHtmlDecimalAlign(div, 35, [], []);
    expect(div.outerHTML).toEqual(
      '<div style="grid-template-columns: 35% 65%;">' +
        '<span class="aiev3-span-point lhs">\u2009</span>' +
        '<span class="aiev3-span-point rhs">\u2009</span>' +
        "</div>",
    );
  });
});
