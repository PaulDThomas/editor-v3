import { EditorV3Content } from '../classes/EditorV3Content';
import { EditorV3Align } from '../classes/interface';

// Load and read tests
describe('Check basic EditorV3Content', () => {
  test('Load basic string, test getters and setters', async () => {
    const testContent = new EditorV3Content('12.34');
    expect(testContent.text).toEqual('12.34');
    const div = document.createElement('div');
    div.append(testContent.el);
    expect(div.innerHTML).toEqual('<div class="aiev3-line left"><span>12.34</span></div>');
    expect(testContent.decimalAlignPercent).toEqual(60);
    expect(testContent.textAlignment).toEqual('left');
    testContent.textAlignment = EditorV3Align.decimal;
    expect(testContent.textAlignment).toEqual('decimal');
    testContent.decimalAlignPercent = 30;
    expect(testContent.decimalAlignPercent).toEqual(30);
    testContent.styles = { shiny: { color: 'pink' } };
    expect(JSON.parse(testContent.jsonString)).toEqual({
      lines: [
        { textBlocks: [{ text: '12.34' }], textAlignment: 'decimal', decimalAlignPercent: 30 },
      ],
      textAlignment: 'decimal',
      decimalAlignPercent: 30,
      styles: { shiny: { color: 'pink' } },
    });
  });

  test('Load string with style info', async () => {
    const testContent = new EditorV3Content('34.56', {
      styles: { shiny: { color: 'pink' } },
      textAlignment: EditorV3Align.center,
      decimalAlignPercent: 80,
    });
    expect(testContent.text).toEqual('34.56');
    expect(testContent.styles).toEqual({ shiny: { color: 'pink' } });
    expect(testContent.decimalAlignPercent).toEqual(80);
    expect(testContent.textAlignment).toEqual('center');
    expect(testContent.lines).toEqual([
      { textBlocks: [{ text: '34.56' }], textAlignment: 'center', decimalAlignPercent: 80 },
    ]);
    expect(JSON.parse(testContent.jsonString)).toEqual({
      lines: [
        { textBlocks: [{ text: '34.56' }], textAlignment: 'center', decimalAlignPercent: 80 },
      ],
      decimalAlignPercent: 80,
      textAlignment: 'center',
      styles: { shiny: { color: 'pink' } },
    });
    const div = document.createElement('div');
    div.append(testContent.el);
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}"></div>' +
        '<div class="aiev3-line center">' +
        '<span>34.56</span>' +
        '</div>',
    );

    // Check self equivalence
    expect(new EditorV3Content(testContent.jsonString)).toEqual(testContent);
    // Need to change back to default, as attribute is not used
    testContent.decimalAlignPercent = 60;
    expect(new EditorV3Content(div.innerHTML)).toEqual(testContent);

    // Repeat as decimal
    testContent.decimalAlignPercent = 80;
    testContent.textAlignment = EditorV3Align.decimal;
    expect(new EditorV3Content(testContent.jsonString)).toEqual(testContent);
    div.innerHTML = '';
    div.appendChild(testContent.el);
    expect(new EditorV3Content(div.innerHTML)).toEqual(testContent);
  });

  test('Load multiline string', async () => {
    const testContent = new EditorV3Content('Hello\n.World\u200b');
    expect(testContent.text).toEqual('Hello\n.World');
    expect(JSON.parse(testContent.jsonString)).toEqual({
      lines: [
        { textBlocks: [{ text: 'Hello' }], textAlignment: 'left', decimalAlignPercent: 60 },
        { textBlocks: [{ text: '.World' }], textAlignment: 'left', decimalAlignPercent: 60 },
      ],
      decimalAlignPercent: 60,
      textAlignment: 'left',
      styles: {},
    });
    const div = document.createElement('div');
    div.append(testContent.el);
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line left"><span>Hello</span></div>' +
        '<div class="aiev3-line left"><span>.World</span></div>',
    );

    // Updates need to flow through
    testContent.decimalAlignPercent = 55;
    testContent.styles = { shiny: { color: 'pink' } };
    testContent.textAlignment = EditorV3Align.decimal;
    expect(testContent.text).toEqual('Hello\n.World');
    expect(JSON.parse(testContent.jsonString)).toEqual({
      lines: [
        { textBlocks: [{ text: 'Hello' }], textAlignment: 'decimal', decimalAlignPercent: 55 },
        { textBlocks: [{ text: '.World' }], textAlignment: 'decimal', decimalAlignPercent: 55 },
      ],
      decimalAlignPercent: 55,
      textAlignment: 'decimal',
      styles: { shiny: { color: 'pink' } },
    });
    div.innerHTML = '';
    div.appendChild(testContent.el);
    expect(div.innerHTML).toEqual(
      '<div class="aiev3-line style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;}}"></div>' +
        '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 45%; min-width: 55%;">Hello</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 55%; min-width: 45%;">\u200b</span>' +
        '</div>' +
        '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 45%; min-width: 55%;">.</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 55%; min-width: 45%;">World</span>' +
        '</div>',
    );
    expect(new EditorV3Content(div.innerHTML)).toEqual(testContent);
    expect(new EditorV3Content(testContent.jsonString)).toEqual(testContent);
  });
});

describe('Content functions', () => {
  test('Merge and split lines', async () => {
    const testContent = new EditorV3Content('12\n34\n56');
    testContent.mergeLines(0);
    expect(testContent.text).toEqual('1234\n56');
    testContent.splitLine({
      startLine: 0,
      startChar: 3,
      endLine: 0,
      endChar: 3,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual('123\n4\n56');
    testContent.splitLine({
      startLine: 0,
      startChar: 1,
      endLine: 2,
      endChar: 0,
      isCollapsed: false,
    });
    expect(testContent.text).toEqual('1\n56');
    testContent.splitLine({
      startLine: 4,
      startChar: 1,
      endLine: 5,
      endChar: 0,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual('1\n56');
  });
  test('Delete character', async () => {
    const testContent = new EditorV3Content('12\n34\n56');
    testContent.deleteCharacter({
      startLine: 0,
      startChar: 1,
      endLine: 0,
      endChar: 1,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual('1\n34\n56');
    testContent.deleteCharacter({
      startLine: 0,
      startChar: 4,
      endLine: 0,
      endChar: 4,
      isCollapsed: true,
    });
    expect(testContent.text).toEqual('1\n34\n56');
  });
});
