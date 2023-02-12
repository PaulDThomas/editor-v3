import { drawHtmlDecimalAlign } from '../classes/drawHtmlDecimalAlign';

describe('Test draw decimal align function', () => {
  test('Draw with point', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, '12.34', 40);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 60%; min-width: 40%;">12.</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 40%; min-width: 60%;">34</span>' +
        '</div>',
    );
  });
  test('Draw without point', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, '1234', 40);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 60%; min-width: 40%;">1234</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 40%; min-width: 60%;">\u200b</span>' +
        '</div>',
    );
  });
  test('Draw with two points', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, '1.23.4', 75);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 25%; min-width: 75%;">1.</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 75%; min-width: 25%;">23.4</span>' +
        '</div>',
    );
  });
  test('Draw empty', async () => {
    const div = document.createElement('div');
    drawHtmlDecimalAlign(div, '', 35);
    expect(div.outerHTML).toEqual(
      '<div>' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 65%; min-width: 35%;">\u200b</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 35%; min-width: 65%;">\u200b</span>' +
        '</div>',
    );
  });
});
