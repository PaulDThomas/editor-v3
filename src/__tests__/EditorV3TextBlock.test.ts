import { EditorV3TextBlock } from '../classes/EditoryV3TextBlock';

// Load and read tests
describe('Check basic EditorV3TextBlock', () => {
  test('Load string', async () => {
    const testBlock = new EditorV3TextBlock('Hello world');
    expect(testBlock.text).toEqual('Hello world');
    expect(testBlock.el.outerHTML).toEqual('<span>Hello&nbsp;world</span>');
  });

  test('Load string with style', async () => {
    const testBlock = new EditorV3TextBlock('Hello world', 'shiny');
    expect(testBlock.text).toEqual('Hello world');
    expect(testBlock.el.outerHTML).toEqual(
      '<span class="editorv3style-shiny" data-style-name="shiny">Hello&nbsp;world</span>',
    );
  });

  test('Load span with style', async () => {
    const testSpan = document.createElement('span');
    testSpan.className = 'editorv3style-shiny';
    testSpan.dataset.styleName = 'shiny';
    testSpan.innerHTML = 'Hello world';
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual('Hello world');
    expect(testBlock.el.outerHTML).toEqual(
      '<span class="editorv3style-shiny" data-style-name="shiny">Hello&nbsp;world</span>',
    );
  });

  test('Load span with no content', async () => {
    const testSpan = document.createElement('span');
    testSpan.textContent = null;
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual('');
    expect(testBlock.el.outerHTML).toEqual('<span>\u200b</span>');
  });

  test('Load text node', async () => {
    const testSpan = document.createTextNode('12.34');
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual('12.34');
    expect(testBlock.el.outerHTML).toEqual('<span>12.34</span>');
  });
});
