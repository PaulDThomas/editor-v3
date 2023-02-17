import { EditorV3Line } from '../classes/EditorV3Line';
import { EditorV3TextBlock } from '../classes/EditorV3TextBlock';
import { EditorV3Align } from '../classes/interface';

describe('Check basic EditorV3Line', () => {
  test('Load string', async () => {
    const testLine = new EditorV3Line('Hello world');
    expect(testLine.el.outerHTML).toEqual(
      '<div class="aiev3-line left"><span>Hello&nbsp;world</span></div>',
    );
    expect(testLine.lineText).toEqual('Hello world');
    expect(testLine.textAlignment).toEqual(EditorV3Align.left);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test('Load string with line breaks, tabs', async () => {
    const testLine = new EditorV3Line('  Hello \r\n\t world  ', EditorV3Align.center, 22);
    expect(testLine.el.outerHTML).toEqual(
      '<div class="aiev3-line center"><span>&nbsp;&nbsp;Hello&nbsp;&nbsp;world&nbsp;&nbsp;</span></div>',
    );
    expect(testLine.lineText).toEqual('  Hello  world  ');
    expect(testLine.textAlignment).toEqual(EditorV3Align.center);
    expect(testLine.decimalAlignPercent).toEqual(22);
  });

  test('Load textBlocks', async () => {
    const testLine = new EditorV3Line([
      new EditorV3TextBlock('Hello\u00A0world, '),
      new EditorV3TextBlock('How is it going?', 'shiny'),
    ]);
    expect(testLine.el.outerHTML).toEqual(
      '<div class="aiev3-line left">' +
        '<span>Hello&nbsp;world,&nbsp;</span>' +
        '<span class="editorv3style-shiny" data-style-name="shiny">How&nbsp;is&nbsp;it&nbsp;going?</span>' +
        '</div>',
    );
    expect(testLine.lineText).toEqual('Hello world, How is it going?');
    expect(testLine.textAlignment).toEqual(EditorV3Align.left);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test('Load decimal textBlocks', async () => {
    const testLine = new EditorV3Line(
      [
        new EditorV3TextBlock('Hello\u00A0world. '),
        new EditorV3TextBlock('How is it going?', 'shiny'),
      ],
      EditorV3Align.decimal,
    );
    expect(testLine.el.outerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 40%; min-width: 60%;">Hello&nbsp;world.</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 60%; min-width: 40%;">&nbsp;How&nbsp;is&nbsp;it&nbsp;going?</span>' +
        '</div>',
    );
    expect(testLine.lineText).toEqual('Hello world. How is it going?');
    expect(testLine.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test('Load decimal text', async () => {
    const testLine = new EditorV3Line('12.34', EditorV3Align.decimal);
    expect(testLine.el.outerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 40%; min-width: 60%;">12.</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 60%; min-width: 40%;">34</span>' +
        '</div>',
    );
    expect(testLine.lineText).toEqual('12.34');
    expect(testLine.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test('Load badly written decimal div', async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line decimal">12.34</div>',
      EditorV3Align.decimal,
    );

    expect(testLine.el.outerHTML).toEqual(
      '<div class="aiev3-line decimal">' +
        '<span class="aiev3-span aiev3-span-point lhs" style="right: 40%; min-width: 60%;">12.</span>' +
        '<span class="aiev3-span aiev3-span-point rhs" style="left: 60%; min-width: 40%;">34</span>' +
        '</div>',
    );
    expect(testLine.lineText).toEqual('12.34');
    expect(testLine.textAlignment).toEqual(EditorV3Align.decimal);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test('Load normal div', async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line left">12.34</div>',
      EditorV3Align.right,
    );

    expect(testLine.el.outerHTML).toEqual('<div class="aiev3-line right"><span>12.34</span></div>');
    expect(testLine.lineText).toEqual('12.34');
    expect(testLine.textAlignment).toEqual(EditorV3Align.right);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test('Load badly written spanned div', async () => {
    const testLine = new EditorV3Line(
      '<div class="aiev3-line right"><span>12.34</span> wut? <span class="editorv3style-shiny" data-style-name="shiny">5678</span></div>',
    );

    expect(testLine.el.outerHTML).toEqual(
      '<div class="aiev3-line right">' +
        '<span>12.34&nbsp;wut?&nbsp;</span>' +
        '<span class="editorv3style-shiny" data-style-name="shiny">5678</span>' +
        '</div>',
    );
    expect(testLine.lineText).toEqual('12.34 wut? 5678');
    expect(testLine.textAlignment).toEqual(EditorV3Align.right);
    expect(testLine.decimalAlignPercent).toEqual(60);
  });

  test('Self equivalence for non-decimal', async () => {
    const firstLine = new EditorV3Line(
      [new EditorV3TextBlock('12.34'), new EditorV3TextBlock(' Hello ')],
      EditorV3Align.left,
    );
    expect(new EditorV3Line(firstLine.el)).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.el.outerHTML)).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.jsonString)).toEqual(firstLine);
    expect(new EditorV3Line(JSON.stringify(firstLine))).toEqual(firstLine);
  });

  test('Self equivalence for decimal', async () => {
    const firstLine = new EditorV3Line('12.34', EditorV3Align.decimal);
    expect(new EditorV3Line(firstLine.el)).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.el.outerHTML)).toEqual(firstLine);
    expect(new EditorV3Line(firstLine.jsonString)).toEqual(firstLine);
    expect(new EditorV3Line(JSON.stringify(firstLine))).toEqual(firstLine);
  });
});

describe('Check EditorV3Line functions', () => {
  test('upToPos', async () => {
    const line = new EditorV3Line('0123.456');
    expect(line.upToPos(0)).toEqual([]);
    expect(line.upToPos(4)).toEqual([{ text: '0123' }]);
    expect(line.upToPos(7)).toEqual([{ text: '0123.45' }]);
    expect(line.upToPos(8)).toEqual([{ text: '0123.456' }]);
    expect(line.upToPos(10)).toEqual([{ text: '0123.456' }]);

    const line2 = new EditorV3Line([
      new EditorV3TextBlock('hello', 'world'),
      new EditorV3TextBlock(' slow'),
    ]);
    expect(line2.upToPos(0)).toEqual([]);
    expect(line2.upToPos(1)).toEqual([{ text: 'h', style: 'world' }]);
    expect(line2.upToPos(2)).toEqual([{ text: 'he', style: 'world' }]);
    expect(line2.upToPos(3)).toEqual([{ text: 'hel', style: 'world' }]);
    expect(line2.upToPos(4)).toEqual([{ text: 'hell', style: 'world' }]);
    expect(line2.upToPos(5)).toEqual([{ text: 'hello', style: 'world' }]);
    expect(line2.upToPos(6)).toEqual([{ text: 'hello', style: 'world' }, { text: ' ' }]);
    expect(line2.upToPos(7)).toEqual([{ text: 'hello', style: 'world' }, { text: ' s' }]);
    expect(line2.upToPos(8)).toEqual([{ text: 'hello', style: 'world' }, { text: ' sl' }]);
    expect(line2.upToPos(9)).toEqual([{ text: 'hello', style: 'world' }, { text: ' slo' }]);
    expect(line2.upToPos(10)).toEqual([{ text: 'hello', style: 'world' }, { text: ' slow' }]);
    expect(line2.upToPos(11)).toEqual([{ text: 'hello', style: 'world' }, { text: ' slow' }]);
  });

  test('fromPos', async () => {
    const line = new EditorV3Line('0123.456');
    expect(line.fromPos(0)).toEqual([{ text: '0123.456' }]);
    expect(line.fromPos(4)).toEqual([{ text: '.456' }]);
    expect(line.fromPos(7)).toEqual([{ text: '6' }]);
    expect(line.fromPos(8)).toEqual([]);

    const line2 = new EditorV3Line([
      new EditorV3TextBlock('hello', 'world'),
      new EditorV3TextBlock(' slow'),
    ]);
    expect(line2.fromPos(0)).toEqual([{ text: 'hello', style: 'world' }, { text: ' slow' }]);
    expect(line2.fromPos(1)).toEqual([{ text: 'ello', style: 'world' }, { text: ' slow' }]);
    expect(line2.fromPos(2)).toEqual([{ text: 'llo', style: 'world' }, { text: ' slow' }]);
    expect(line2.fromPos(3)).toEqual([{ text: 'lo', style: 'world' }, { text: ' slow' }]);
    expect(line2.fromPos(4)).toEqual([{ text: 'o', style: 'world' }, { text: ' slow' }]);
    expect(line2.fromPos(5)).toEqual([{ text: ' slow' }]);
    expect(line2.fromPos(6)).toEqual([{ text: 'slow' }]);
    expect(line2.fromPos(7)).toEqual([{ text: 'low' }]);
    expect(line2.fromPos(8)).toEqual([{ text: 'ow' }]);
    expect(line2.fromPos(9)).toEqual([{ text: 'w' }]);
    expect(line2.fromPos(10)).toEqual([]);
  });

  test('subBlocks', () => {
    const line2 = new EditorV3Line([
      new EditorV3TextBlock('hello', 'world'),
      new EditorV3TextBlock(' slow'),
    ]);
    expect(line2.subBlocks(1, 1)).toEqual([]);
    expect(line2.subBlocks(1, 2)).toEqual([{ text: 'e', style: 'world' }]);
    expect(line2.subBlocks(1, 3)).toEqual([{ text: 'el', style: 'world' }]);
    expect(line2.subBlocks(1, 4)).toEqual([{ text: 'ell', style: 'world' }]);
    expect(line2.subBlocks(1, 5)).toEqual([{ text: 'ello', style: 'world' }]);
    expect(line2.subBlocks(1, 6)).toEqual([{ text: 'ello', style: 'world' }, { text: ' ' }]);
    expect(line2.subBlocks(1, 7)).toEqual([{ text: 'ello', style: 'world' }, { text: ' s' }]);
    expect(line2.subBlocks(1, 8)).toEqual([{ text: 'ello', style: 'world' }, { text: ' sl' }]);
    expect(line2.subBlocks(1, 9)).toEqual([{ text: 'ello', style: 'world' }, { text: ' slo' }]);
    expect(line2.subBlocks(2, 9)).toEqual([{ text: 'llo', style: 'world' }, { text: ' slo' }]);
    expect(line2.subBlocks(3, 9)).toEqual([{ text: 'lo', style: 'world' }, { text: ' slo' }]);
    expect(line2.subBlocks(4, 9)).toEqual([{ text: 'o', style: 'world' }, { text: ' slo' }]);
    expect(line2.subBlocks(5, 9)).toEqual([{ text: ' slo' }]);
    expect(line2.subBlocks(6, 9)).toEqual([{ text: 'slo' }]);
    expect(line2.subBlocks(7, 9)).toEqual([{ text: 'lo' }]);
    expect(line2.subBlocks(8, 9)).toEqual([{ text: 'o' }]);
    expect(line2.subBlocks(9, 9)).toEqual([]);
  });

  test('splitLine', async () => {
    const line1 = new EditorV3Line('0123.456');
    const split1 = line1.splitLine(0);
    expect(split1?.textBlocks).toEqual([{ text: '0123.456' }]);
    expect(line1.textBlocks).toEqual([]);

    const line2 = new EditorV3Line('0123.456');
    const split2 = line2.splitLine(4);
    expect(split2?.textBlocks).toEqual([{ text: '.456' }]);
    expect(line2.textBlocks).toEqual([{ text: '0123' }]);

    const line3 = new EditorV3Line('0123.456');
    const split3 = line3.splitLine(7);
    expect(split3?.textBlocks).toEqual([{ text: '6' }]);
    expect(line3.textBlocks).toEqual([{ text: '0123.45' }]);

    const line4 = new EditorV3Line('0123.456');
    const split4 = line4.splitLine(8);
    expect(split4?.textBlocks).toEqual([{ text: '' }]);
    expect(line4.textBlocks).toEqual([{ text: '0123.456' }]);

    const line5 = new EditorV3Line('0123.456');
    const split5 = line5.splitLine(9);
    expect(split5).toEqual(null);
    expect(line5.textBlocks).toEqual([{ text: '0123.456' }]);
  });

  test('deleteCharacter', async () => {
    const line2 = new EditorV3Line([
      new EditorV3TextBlock('hello', 'world'),
      new EditorV3TextBlock(' slow'),
    ]);
    line2.deleteCharacter(4);
    expect(line2.textBlocks).toEqual([{ text: 'hell', style: 'world' }, { text: ' slow' }]);
    line2.deleteCharacter(4);
    expect(line2.textBlocks).toEqual([{ text: 'hell', style: 'world' }, { text: 'slow' }]);
    line2.deleteCharacter(41);
    expect(line2.textBlocks).toEqual([{ text: 'hell', style: 'world' }, { text: 'slow' }]);
    line2.deleteCharacter(0);
    expect(line2.textBlocks).toEqual([{ text: 'ell', style: 'world' }, { text: 'slow' }]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks).toEqual([{ text: 'ell', style: 'world' }, { text: 'slo' }]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks).toEqual([{ text: 'ell', style: 'world' }, { text: 'slo' }]);
  });

  test('applyStyle & removeStyle', async () => {
    const line2 = new EditorV3Line([
      new EditorV3TextBlock('hello', 'world'),
      new EditorV3TextBlock(' slow'),
    ]);
    line2.applyStyle('drive', 3, 6);
    expect(line2.textBlocks).toEqual([
      { text: 'hel', style: 'world' },
      { text: 'lo ', style: 'drive' },
      { text: 'slow' },
    ]);
    line2.applyStyle('world', 3, 4);
    expect(line2.textBlocks).toEqual([
      { text: 'hell', style: 'world' },
      { text: 'o ', style: 'drive' },
      { text: 'slow' },
    ]);
    line2.applyStyle('caps', 0, 0);
    expect(line2.textBlocks).toEqual([
      { text: 'hell', style: 'world' },
      { text: 'o ', style: 'drive' },
      { text: 'slow' },
    ]);
    line2.removeStyle(3, 7);
    expect(line2.textBlocks).toEqual([{ text: 'hel', style: 'world' }, { text: 'lo slow' }]);
    line2.removeStyle(1, 1);
    expect(line2.textBlocks).toEqual([{ text: 'hel', style: 'world' }, { text: 'lo slow' }]);
  });
});
