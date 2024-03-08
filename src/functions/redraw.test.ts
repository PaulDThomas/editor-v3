/* eslint-disable quotes */
import { EditorV3Content } from "../classes/EditorV3Content";
import { EditorV3Align } from "../classes/interface";
import { defaultMarkdownSettings } from "../classes/markdown/MarkdownSettings";
import { redraw } from "./redraw";

describe("Test redraw function", () => {
  const mockContent = new EditorV3Content("34.45\n\nx.xx", {
    styles: { shiny: { color: "pink", fontWeight: "700" } },
    textAlignment: EditorV3Align.decimal,
    decimalAlignPercent: 80,
  });
  mockContent.applyStyle("shiny", { startLine: 2, startChar: 0, endLine: 2, endChar: 4 });

  test("Draw markdown", async () => {
    const el = document.createElement("div");
    redraw(el, mockContent, true, defaultMarkdownSettings);
    expect(el.innerHTML).toEqual(
      '<div class="aiev3-markdown-line">34.45</div>' +
        '<div class="aiev3-markdown-line"></div>' +
        '<div class="aiev3-markdown-line">&lt;&lt;shiny::x.xx&gt;&gt;</div>' +
        '<div class="aiev3-contents-info" data-decimal-align-percent="80" data-show-markdown="true" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}" data-text-alignment="&quot;decimal&quot;"></div>',
    );
  });

  test("Draw html", async () => {
    const el = document.createElement("div");
    redraw(el, mockContent, false, defaultMarkdownSettings);
    expect(el.innerHTML).toEqual(
      '<div class="aiev3-line decimal" style="grid-template-columns: 80% 20%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb">34</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb">.45</span></span></div>' +
        '<div class="aiev3-line decimal" style="grid-template-columns: 80% 20%;">' +
        '<span class="aiev3-span-point lhs">\u2009</span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb">\u2009</span></span></div>' +
        '<div class="aiev3-line decimal" style="grid-template-columns: 80% 20%;">' +
        '<span class="aiev3-span-point lhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x</span></span>' +
        '<span class="aiev3-span-point rhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">.xx</span></span></div>' +
        '<div class="aiev3-contents-info" data-decimal-align-percent="80" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}" data-text-alignment="&quot;decimal&quot;"></div>',
    );
  });
});
