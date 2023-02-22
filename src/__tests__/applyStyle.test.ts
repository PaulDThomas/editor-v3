import { applyStyle } from '../functions/applyStyle';

describe('Test apply style', () => {
  test('Draw with point', async () => {
    const div = document.createElement('div');
    div.innerHTML =
      '<div class="aiev3-line decimal" style="height: 0px;">' +
      '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.</span></span>' +
      '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">xx</span></span>' +
      '</div>' +
      '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>';
    // Remove style
    let range = document.createRange();
    let lhs = div.querySelector('span.lhs') as HTMLSpanElement;
    let rhs = div.querySelector('span.rhs') as HTMLSpanElement;
    range.selectNodeContents(lhs);
    range.setEndAfter(rhs);
    applyStyle(null, div, range);
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span class="aiev3-tb">x.</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span class="aiev3-tb">xx</span></span>' +
        '</div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>',
    );
    // Add style
    range = document.createRange();
    lhs = div.querySelector('span.lhs') as HTMLSpanElement;
    rhs = div.querySelector('span.rhs') as HTMLSpanElement;
    range.selectNodeContents(lhs);
    range.setEndAfter(rhs);
    // const sel = window.getSelection() as Selection;
    // sel.removeAllRanges();
    // sel.addRange(range);
    applyStyle('shiny', div, range);
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span class="aiev3-tb editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">xx</span></span>' +
        '</div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>',
    );
  });
});
