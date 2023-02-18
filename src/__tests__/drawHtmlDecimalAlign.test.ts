import { drawHtmlDecimalAlign } from '../classes/drawHtmlDecimalAlign';
import { EditorV3TextBlock } from '../classes/EditorV3TextBlock';

describe('Test draw decimal align function', () => {
  test('Draw with point', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, 40, [new EditorV3TextBlock('12.')], [new EditorV3TextBlock('34')]);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 60%; min-width: 40%;"><span>12.</span></span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 40%; min-width: 60%;"><span>34</span></span>' +
        '</div>',
    );
  });
  test('Draw without right', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, 40, [new EditorV3TextBlock('1234')], []);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 60%; min-width: 40%;"><span>1234</span></span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 40%; min-width: 60%;">\u200b</span>' +
        '</div>',
    );
  });
  test('Draw without left', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, 75, [], [new EditorV3TextBlock('34')]);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 25%; min-width: 75%;">\u200b</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 75%; min-width: 25%;"><span>34</span></span>' +
        '</div>',
    );
  });
  test('Draw empty', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, 35, [], []);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 65%; min-width: 35%;">\u200b</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 35%; min-width: 65%;">\u200b</span>' +
        '</div>',
    );
  });
});
