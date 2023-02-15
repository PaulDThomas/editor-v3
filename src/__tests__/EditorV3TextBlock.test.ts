import { EditorV3TextBlock } from '../classes/EditorV3TextBlock';

// Load and read tests
describe('Check basic EditorV3TextBlock', () => {
  test('Load string', async () => {
    const testBlock = new EditorV3TextBlock('Helloworld');
    expect(testBlock.text).toEqual('Helloworld');
    expect(testBlock.el.outerHTML).toEqual('<span>Helloworld</span>');
    const testBlock2 = new EditorV3TextBlock('0');
    expect(testBlock2.text).toEqual('0');
    expect(testBlock2.jsonString).toEqual('{"text":"0"}');
    expect(testBlock2.el.outerHTML).toEqual('<span>0</span>');
  });

  test('Load string with style', async () => {
    const testBlock = new EditorV3TextBlock('Hello world ', 'shiny');
    expect(testBlock.text).toEqual('Hello world ');
    expect(testBlock.el.outerHTML).toEqual(
      '<span class="editorv3style-shiny" data-style-name="shiny">Hello&nbsp;world&nbsp;</span>',
    );
  });

  test('Load span with style, check it equals itself', async () => {
    const testSpan = document.createElement('span');
    testSpan.className = 'editorv3style-shiny';
    testSpan.dataset.styleName = 'shiny';
    testSpan.innerHTML = 'Hello world';
    const testBlock = new EditorV3TextBlock(testSpan);
    expect(testBlock.text).toEqual('Hello world');
    expect(testBlock.el.outerHTML).toEqual(
      '<span class="editorv3style-shiny" data-style-name="shiny">Hello&nbsp;world</span>',
    );
    expect(new EditorV3TextBlock(testBlock.el.outerHTML)).toEqual(testBlock);
    expect(new EditorV3TextBlock(testBlock.el)).toEqual(testBlock);
    expect(new EditorV3TextBlock(JSON.stringify(testBlock))).toEqual(testBlock);
    expect(new EditorV3TextBlock(testBlock.jsonString)).toEqual(testBlock);
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

  test('Load EditorV3TextBlock', async () => {
    const firstBlock = new EditorV3TextBlock('Hello world', 'shiny');
    const testBlock = new EditorV3TextBlock(firstBlock);
    expect(testBlock).toEqual(firstBlock);
  });

  test('Load Object', async () => {
    const obj = { text: 'Hello world' };
    const testBlock = new EditorV3TextBlock(obj);
    expect(testBlock).toEqual({ text: 'Hello world' });

    const obj2 = { text: 'Hello world', style: 'shiny' };
    const testBlock2 = new EditorV3TextBlock(obj2);
    expect(testBlock2).toEqual({ text: 'Hello world', style: 'shiny' });
  });
});
