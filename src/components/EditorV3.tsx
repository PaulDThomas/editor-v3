import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorV3Content } from '../classes/EditorV3Content';
import { EditorV3Align, EditorV3Styles } from '../classes/interface';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getCurrentData } from '../functions/getCurrentData';
import { redraw } from '../functions/redraw';
import { setCaretPosition } from '../functions/setCaretPosition';
import './EditorV3.css';
import { moveCursor } from '../functions/moveCursor';
import { ContextMenuHandler, iMenuItem } from '@asup/context-menu';
import { applyStyle } from '../functions/applyStyle';
import { applyStylesToHTML } from '../functions/applyStylesToHTML';
import { EditorV3Line } from '../classes';

interface EditorV3Props {
  id: string;
  input: string;
  editable?: boolean;
  setHtml?: (ret: string) => void;
  setText?: (ret: string) => void;
  setJson?: (ret: string) => void;
  customStyleMap?: EditorV3Styles;
  allowNewLine?: boolean;
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  style?: CSSProperties;
}

export const EditorV3 = ({
  id,
  input,
  editable = true,
  setText,
  setHtml,
  setJson,
  customStyleMap,
  allowNewLine = false,
  textAlignment = EditorV3Align.left,
  decimalAlignPercent = 60,
  style,
}: EditorV3Props): JSX.Element => {
  // Set up reference to inner div
  const divRef = useRef<HTMLDivElement | null>(null);

  const menuItems = useMemo((): iMenuItem[] => {
    return [
      {
        label: `Style`,
        group: [
          ...(customStyleMap && Object.keys(customStyleMap).length > 0
            ? Object.keys(customStyleMap ?? {}).map((s) => {
                return {
                  label: s,
                  action: (target?: Range | null) => {
                    divRef.current && applyStyle(s, divRef.current, target);
                  },
                };
              })
            : [{ label: 'No styles defined', disabled: true }]),

          {
            label: 'Remove style',
            action: (target) => {
              divRef.current && applyStyle(null, divRef.current, target);
            },
          },
        ],
      },
    ];
  }, [customStyleMap]);

  // General return function
  const returnData = useCallback(
    (ret: { text: string; html: string; json: string }, force?: boolean) => {
      if (force || (ret.text !== input && ret.html !== input && ret.json !== input)) {
        setText && setText(ret.text);
        setHtml && setHtml(ret.html);
        setJson && setJson(ret.json);
      }
    },
    [input, setHtml, setJson, setText],
  );

  // Update if input changes
  useEffect(() => {
    const newContent = new EditorV3Content(input, {
      textAlignment,
      decimalAlignPercent,
      styles: customStyleMap,
    });
    divRef.current && redraw(divRef.current, newContent);
    returnData(getCurrentData(divRef), true);
  }, [customStyleMap, decimalAlignPercent, input, returnData, textAlignment]);

  // Work out backgroup colour and border
  const [inFocus, setInFocus] = useState<boolean>(false);
  const handleFocus = useCallback(() => {
    setInFocus(true);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Handle awkward keys
    if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      if (divRef.current) {
        const pos = getCaretPosition(divRef.current);
        // Enter
        if (pos && allowNewLine && e.key === 'Enter') {
          const content = new EditorV3Content(divRef.current.innerHTML);
          const newPos = content.splitLine(pos);
          redraw(divRef.current, content);
          setCaretPosition(divRef.current, newPos);
        }
        // Backspace and delete
        if (pos && ['Backspace', 'Delete'].includes(e.key)) {
          const content = new EditorV3Content(divRef.current.innerHTML);
          const newPos = content.deleteCharacter(pos, e.key === 'Backspace');
          redraw(divRef.current, content);
          setCaretPosition(divRef.current, newPos);
        }
      }
      return;
    } else if (
      divRef.current &&
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) &&
      !e.shiftKey &&
      !e.ctrlKey
    ) {
      moveCursor(divRef.current, e);
    }
  }

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Stop handled keys
    if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
  }, []);

  const handleCopy = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    if (divRef.current) {
      const pos = getCaretPosition(divRef.current);
      if (pos) {
        const content = new EditorV3Content(divRef.current.innerHTML);
        const toPaste = content.subLines(pos);
        e.clipboardData.setData('text/plain', toPaste.map((l) => l.lineText).join('\n'));
        e.clipboardData.setData(
          'text/html',
          toPaste.map((l) => applyStylesToHTML(l.el, content.styles).outerHTML).join(''),
        );
        e.clipboardData.setData('data/aiev3', JSON.stringify(toPaste));
        if (e.type === 'cut') {
          content.splice(pos);
          redraw(divRef.current, content);
          setCaretPosition(divRef.current, pos);
        }
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    try {
      const fromPaste = e.clipboardData.getData('data/aiev3');
      if (divRef.current && fromPaste) {
        const pos = getCaretPosition(divRef.current);
        if (pos) {
          const content = new EditorV3Content(divRef.current.innerHTML);
          const lines: EditorV3Line[] = JSON.parse(fromPaste).map(
            (l: unknown) => new EditorV3Line(JSON.stringify(l)),
          );
          content.splice(pos, lines);
          redraw(divRef.current, content);
          pos.startLine = pos.startLine + lines.length - 1;
          pos.startChar =
            lines.length === 1
              ? pos.startChar + lines[1].lineLength - 1
              : lines[lines.length - 1].lineLength;
          setCaretPosition(divRef.current, pos);
        }
        e.preventDefault();
        e.stopPropagation();
      }
    } catch {
      console.warn('Paste failed');
    }
  }, []);

  const handleBlur = useCallback(() => {
    setInFocus(false);
    returnData(getCurrentData(divRef));
  }, [returnData]);

  const widthStyle = useMemo(() => {
    const s = { ...style };
    // Remove padding/border width
    if (s.width) {
      s.width = `calc(${s.width} - 10px)`;
    }
    return s;
  }, [style]);

  return (
    <div
      className={`aiev3${inFocus ? ' editing' : ''}`}
      id={id}
      style={widthStyle}
      onFocusCapture={handleFocus}
      onBlur={handleBlur}
    >
      <ContextMenuHandler
        menuItems={menuItems}
        style={{ width: '100%', height: '100%' }}
      >
        <div
          id={`${id}-editable`}
          className='aiev3-editing'
          contentEditable={
            editable &&
            (typeof setHtml === 'function' ||
              typeof setJson === 'function' ||
              typeof setText === 'function')
          }
          suppressContentEditableWarning
          spellCheck={false}
          ref={divRef}
          onKeyUpCapture={handleKeyUp}
          onCut={handleCopy}
          onCopy={handleCopy}
          onPasteCapture={handlePaste}
          onKeyDownCapture={handleKeyDown}
          onBlurCapture={handleBlur}
          onFocusCapture={handleFocus}
        ></div>
      </ContextMenuHandler>
    </div>
  );
};
