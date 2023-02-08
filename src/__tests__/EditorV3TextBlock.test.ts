import { EditorV3TextBlock } from '../classes/EditoryV3TextBlock';

// Load and read tests
describe('Check basic EditorV3TextBlock', () => {
  test('Load string', async () => {
    const testBlock = new EditorV3TextBlock('Hello world');
    expect(testBlock.text).toEqual('Hello world');
    expect(testBlock.html.outerHTML).toEqual('<span>Hello&nbsp;world</span>');
  });

  test('Load string with style', async () => {
    const testBlock2 = new EditorV3TextBlock('Hello world', 'shiny');
    expect(testBlock2.text).toEqual('Hello world');
    expect(testBlock2.html.outerHTML).toEqual(
      '<span class="editorv3style-shiny" data-style-name="shiny">Hello&nbsp;world</span>',
    );
  });
});
