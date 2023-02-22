import { getTextNodeAtOffset } from '../functions/getTextNodeAtOffset';

describe('Test getTextNodeAtOffset', () => {
  test('Basic test', async () => {
    const div = document.createElement('div');
    div.innerHTML =
      '<div class="aiev3-line decimal" style="height: 0px;">' +
      '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span class="editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.</span></span>' +
      '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span class="editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">xx</span></span>' +
      '</div>' +
      '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>';
    const badRet = getTextNodeAtOffset(div, -1);
    expect(badRet).toEqual(null);
    const goodRet = getTextNodeAtOffset(div, 3);
    expect(goodRet?.node.textContent).toEqual('xx');
    expect(goodRet?.offset).toEqual(1);
  });
});
