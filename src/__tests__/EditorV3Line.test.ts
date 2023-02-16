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
        '<span>12.34</span>' +
        '<span>&nbsp;wut?&nbsp;</span>' +
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
    expect(line.upToPos(0)).toEqual([{ text: '' }]);
    expect(line.upToPos(4)).toEqual([{ text: '0123' }]);
    expect(line.upToPos(7)).toEqual([{ text: '0123.45' }]);
    expect(line.upToPos(8)).toEqual([{ text: '0123.456' }]);
    expect(line.upToPos(10)).toEqual([{ text: '0123.456' }]);

    const line2 = new EditorV3Line([
      new EditorV3TextBlock('hello', 'world'),
      new EditorV3TextBlock(' slow'),
    ]);
    expect(line2.upToPos(0)).toEqual([{ text: '', style: 'world' }]);
    expect(line2.upToPos(4)).toEqual([{ text: 'hell', style: 'world' }]);
    expect(line2.upToPos(5)).toEqual([{ text: 'hello', style: 'world' }]);
    expect(line2.upToPos(6)).toEqual([{ text: 'hello', style: 'world' }, { text: ' ' }]);
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
    expect(line2.fromPos(4)).toEqual([{ text: 'o', style: 'world' }, { text: ' slow' }]);
    expect(line2.fromPos(5)).toEqual([{ text: ' slow' }]);
    expect(line2.fromPos(9)).toEqual([{ text: 'w' }]);
    expect(line2.fromPos(10)).toEqual([]);
  });

  test('splitLine', async () => {
    const line1 = new EditorV3Line('0123.456');
    const split1 = line1.splitLine(0);
    expect(split1?.textBlocks).toEqual([{ text: '0123.456' }]);
    expect(line1.textBlocks).toEqual([{ text: '' }]);

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
    expect(line2.textBlocks).toEqual([
      { text: '', style: 'world' },
      { text: 'ell', style: 'world' },
      { text: 'slow' },
    ]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks).toEqual([
      { text: '', style: 'world' },
      { text: 'ell', style: 'world' },
      { text: 'slo' },
    ]);
    line2.deleteCharacter(6);
    expect(line2.textBlocks).toEqual([
      { text: '', style: 'world' },
      { text: 'ell', style: 'world' },
      { text: 'slo' },
    ]);
  });

  //   const styles: iColourStyles = {
  //     red: { color: 'red' },
  //     blue: { color: 'blue' },
  //     green: { color: 'green' },
  //   };
  //   const tT1 = new ColouredLine('test one', styles);
  //   test('Returns text', async () => {
  //     expect(tT1.text).toEqual('test one');
  //     expect(tT1.htmlString).toEqual(
  //       '<div class="aie-line"><span class="aie-block">test&nbsp;one</span></div>',
  //     );
  //   });
  //   const styleBlocks: iStyleBlock[] = [
  //     { start: 1, end: 2, styleName: 'red' },
  //     { start: 2, end: 3, styleName: 'green' },
  //     { start: 3, end: 4, styleName: 'blue' },
  //   ];
  //   const tT2 = new ColouredLine('test two', styles, styleBlocks);
  //   test('Returns coloured', async () => {
  //     expect(tT2.text).toEqual('test two');
  //     expect(tT2.htmlString).toEqual(
  //       `
  // <div class="aie-line">
  //   <span class="aie-block">t</span>
  //   <span class="aie-block" data-style="red" style="color: red;">e</span>
  //   <span class="aie-block" data-style="green" style="color: green;">s</span>
  //   <span class="aie-block" data-style="blue" style="color: blue;">t</span>
  //   <span class="aie-block">&nbsp;two</span>
  // </div>
  //     `.replace(getMultiSpace, '$1$3'),
  //     );
  //   });
  //   test('Apply style', async () => {
  //     tT1.applyStyle('red', 4, 8);
  //     expect(tT1.htmlString).toEqual(
  //       `
  // <div class="aie-line">
  //   <span class="aie-block">test</span>
  //   <span class="aie-block" data-style="red" style="color: red;">&nbsp;one</span>
  // </div>
  //     `.replace(getMultiSpace, '$1$3'),
  //     );
  //   });
  //   test('Remove style', async () => {
  //     tT1.removeStyle(6, 7);
  //     expect(tT1.htmlString).toEqual(
  //       `
  // <div class="aie-line">
  //   <span class="aie-block">test</span>
  //   <span class="aie-block" data-style="red" style="color: red;">&nbsp;o</span>
  //   <span class="aie-block">n</span>
  //   <span class="aie-block" data-style="red" style="color: red;">e</span>
  // </div>
  //     `.replace(getMultiSpace, '$1$3'),
  //     );
  //   });
  //   test('Apply bad style', async () => {
  //     tT1.applyStyle('pink', 4, 8);
  //     expect(tT1.htmlString).toEqual(
  //       `
  // <div class="aie-line">
  //   <span class="aie-block">test&nbsp;one</span>
  // </div>
  //     `.replace(getMultiSpace, '$1$3'),
  //     );
  //   });
});
