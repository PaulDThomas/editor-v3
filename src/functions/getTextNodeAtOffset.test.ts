/* eslint-disable quotes */
import { getTextNodeAtOffset } from "./getTextNodeAtOffset";

describe("Test getTextNodeAtOffset", () => {
  test("Basic test", async () => {
    const div = document.createElement("div");
    div.innerHTML =
      '<div class="aiev3-line decimal" style="height: 0px;">' +
      '<span class="aiev3-span-point lhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.</span></span>' +
      '<span class="aiev3-span-point rhs"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">xx</span></span>' +
      "</div>" +
      '<div class="aiev3-content-info" data-styles="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>';
    const badRet = getTextNodeAtOffset(div, -1);
    expect(badRet).toEqual(null);
    const goodRet = getTextNodeAtOffset(div, 3);
    expect(goodRet?.node.textContent).toEqual("xx");
    expect(goodRet?.offset).toEqual(1);
  });

  test("Update locked block with extra Text node", async () => {
    const div = document.createElement("div");
    div.innerHTML =
      '<div class="aiev3-line left">' +
      '<span class="aiev3-tb at-block is-locked">@hello</span>' +
      '<span class="aiev3-tb"> world</span>' +
      "</div>" +
      '<div class="aiev3-contents-info"></div>';
    const goodRet = getTextNodeAtOffset(div, 1);
    expect(goodRet).toBeDefined();
    expect(goodRet?.node.textContent).toEqual("");
    expect(goodRet?.offset).toEqual(0);
    expect(goodRet?.node.previousSibling?.textContent).toEqual("@hello");
    expect(goodRet?.node.nextSibling?.textContent).toEqual(" world");
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line left">' +
        '<span class="aiev3-tb at-block is-locked">@hello</span>' +
        '<span class="aiev3-tb"> world</span>' +
        "</div>" +
        '<div class="aiev3-contents-info"></div>',
    );
  });

  test("Move from locked block to existing Text node (shouldn't happen)", async () => {
    const div = document.createElement("div");
    div.innerHTML =
      '<div class="aiev3-line left">' +
      '<span class="aiev3-tb at-block is-locked">@hello</span>' +
      " world" +
      "</div>" +
      '<div class="aiev3-contents-info"></div>';
    const goodRet = getTextNodeAtOffset(div, 6);
    expect(goodRet).toBeDefined();
    expect(goodRet?.node.textContent).toEqual(" world");
    expect(goodRet?.offset).toEqual(0);
    expect(goodRet?.node.previousSibling?.textContent).toEqual("@hello");
  });
});
