import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorV3Content } from '../classes/EditorV3Content';
import { EditorV3Align } from '../classes/interface';
import { EditorV3 } from '../components/EditorV3';

const testContent = new EditorV3Content('34.45\n\nx.xx', {
  styles: { shiny: { color: 'pink', fontWeight: '700' } },
  textAlignment: EditorV3Align.decimal,
  decimalAlignPercent: 80,
});
testContent.applyStyle('shiny', { startLine: 2, startChar: 0, endLine: 2, endChar: 4 });

describe('Editor and functions', () => {
  test('Draw and fire cursor events', async () => {
    const user = userEvent.setup();
    expect;
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={testContent.jsonString}
          />
        </div>,
      );
    });
    const editor = (await screen.findByTestId('container')).children[0] as HTMLDivElement;
    expect(editor.outerHTML).toEqual(
      '<div class="aiev3" id="test-editor">' +
        '<div id="test-editor-editable" class="aiev3-editing" contenteditable="false" spellcheck="false">' +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span>34.</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span>45</span></span>' +
        '</div>' +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;">\u200b</span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;">\u200b</span>' +
        '</div>' +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span class="editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span class="editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">xx</span></span>' +
        '</div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>' +
        '</div></div>',
    );
    const firstSpan = editor.querySelector('span') as HTMLSpanElement;
    await user.click(firstSpan);
    fireEvent.keyDown(firstSpan, { key: 'Home' });
    for (let i = 0; i < 15; i++) {
      fireEvent.keyDown(firstSpan, { key: 'ArrowRight' });
    }
    for (let i = 0; i < 15; i++) {
      fireEvent.keyDown(firstSpan, { key: 'ArrowLeft' });
    }
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(firstSpan, { key: 'ArrowDown' });
    }
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(firstSpan, { key: 'ArrowUp' });
    }
  });

  test('Backspace and delete', async () => {
    const user = userEvent.setup();
    const mockSetJson = jest.fn();
    const mockSetHtml = jest.fn();
    const mockSetText = jest.fn();
    await act(async () => {
      render(
        <div data-testid='container'>
          <EditorV3
            id='test-editor'
            input={testContent.jsonString}
            setJson={mockSetJson}
            setHtml={mockSetHtml}
            setText={mockSetText}
            style={{ width: '200px' }}
            allowNewLine
          />
        </div>,
      );
    });
    expect(mockSetText).toHaveBeenCalledWith('34.45\n\nx.xx');
    expect(mockSetJson).toHaveBeenCalledWith(
      JSON.stringify({
        lines: [
          { textBlocks: [{ text: '34.45' }], textAlignment: 'decimal', decimalAlignPercent: 80 },
          { textBlocks: [{ text: '' }], textAlignment: 'decimal', decimalAlignPercent: 80 },
          {
            textBlocks: [{ text: 'x.xx', style: 'shiny' }],
            textAlignment: 'decimal',
            decimalAlignPercent: 80,
          },
        ],
        textAlignment: 'decimal',
        decimalAlignPercent: 80,
        styles: { shiny: { color: 'pink', fontWeight: '700' } },
      }),
    );
    const editor = (await screen.findByTestId('container')).children[0] as HTMLDivElement;
    let firstSpan = editor.querySelector('span') as HTMLSpanElement;

    await user.click(firstSpan);
    fireEvent.keyUp(firstSpan, { key: 'Enter' });
    // await user.keyboard('{End}');
    fireEvent.keyDown(firstSpan, { key: 'End' });
    await act(async () => {
      await user.keyboard('{Backspace}');
    });
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(2);
    expect(mockSetText).toHaveBeenNthCalledWith(2, '34.4\n\nx.xx');

    // Reacquire firstSpan
    firstSpan = editor.querySelector('span') as HTMLSpanElement;
    await user.click(firstSpan);
    // await user.keyboard('{Home}');
    fireEvent.keyDown(firstSpan, { key: 'Home' });
    await act(async () => {
      await user.keyboard('{Delete}');
      await user.keyboard('{Delete}');
      await user.keyboard('{Delete}');
    });
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(3);
    expect(mockSetText).toHaveBeenNthCalledWith(3, '4\n\nx.xx');

    // Reacquire firstSpan
    firstSpan = editor.querySelector('span') as HTMLSpanElement;
    await user.click(firstSpan);
    // await user.keyboard('{Home}');
    fireEvent.keyDown(firstSpan, { key: 'Home' });
    await act(async () => {
      await user.keyboard('{Enter}');
    });
    fireEvent.blur(editor);
    expect(mockSetText).toHaveBeenCalledTimes(4);
    expect(mockSetText).toHaveBeenNthCalledWith(4, '\n4\n\nx.xx');
    expect(mockSetJson).toHaveBeenNthCalledWith(
      4,
      JSON.stringify({
        lines: [
          { textBlocks: [{ text: '' }], textAlignment: 'decimal', decimalAlignPercent: 80 },
          { textBlocks: [{ text: '4' }], textAlignment: 'decimal', decimalAlignPercent: 80 },
          { textBlocks: [{ text: '' }], textAlignment: 'decimal', decimalAlignPercent: 80 },
          {
            textBlocks: [{ text: 'x.xx', style: 'shiny' }],
            textAlignment: 'decimal',
            decimalAlignPercent: 80,
          },
        ],
        textAlignment: 'decimal',
        decimalAlignPercent: 80,
        styles: { shiny: { color: 'pink', fontWeight: '700' } },
      }),
    );
    expect(mockSetHtml).toHaveBeenNthCalledWith(
      4,
      '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;">\u200b</span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;">\u200b</span>' +
        '</div>' +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span>4</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;">\u200b</span>' +
        '</div>' +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;">\u200b</span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;">\u200b</span>' +
        '</div>' +
        '<div class="aiev3-line decimal" style="height: 0px;">' +
        '<span class="aiev3-span-point lhs" style="right: 20%; min-width: 80%;"><span class="editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">x.</span></span>' +
        '<span class="aiev3-span-point rhs" style="left: 80%; min-width: 20%;"><span class="editorv3style-shiny" data-style-name="shiny" style="color: pink; font-weight: 700;">xx</span></span>' +
        '</div>' +
        '<div class="aiev3-style-info" data-style="{&quot;shiny&quot;:{&quot;color&quot;:&quot;pink&quot;,&quot;fontWeight&quot;:&quot;700&quot;}}"></div>',
    );
  });
});
