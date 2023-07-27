import { ContextMenuHandler, iMenuItem } from '@asup/context-menu';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorV3Line, EditorV3TextBlock } from '../classes';
import { EditorV3Content } from '../classes/EditorV3Content';
import { EditorV3Align, EditorV3LineImport, EditorV3Styles } from '../classes/interface';
import { applyStyle } from '../functions/applyStyle';
import { applyStylesToHTML } from '../functions/applyStylesToHTML';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getCurrentData } from '../functions/getCurrentData';
import { moveCursor } from '../functions/moveCursor';
import { redraw } from '../functions/redraw';
import { setCaretPosition } from '../functions/setCaretPosition';
import './EditorV3.css';

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
  resize?: boolean;
  spellCheck?: boolean;
  styleOnContextMenu?: boolean;
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
  resize = false,
  spellCheck = false,
  styleOnContextMenu = true,
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
    const pos = (divRef.current && getCaretPosition(divRef.current)) ?? null;
    if (!pos && divRef.current) {
      setCaretPosition(divRef.current, { startLine: 0, startChar: 0, endLine: 0, endChar: 0 });
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Handle awkward keys
      if (['Enter', 'Backspace', 'Delete'].includes(e.key) && divRef.current) {
        e.stopPropagation();
        e.preventDefault();
        const pos = getCaretPosition(divRef.current);
        // Enter
        if (pos && allowNewLine && e.key === 'Enter') {
          const content = new EditorV3Content(divRef.current.innerHTML, {
            textAlignment,
            decimalAlignPercent,
            styles: customStyleMap,
          });
          const newPos = content.splitLine(pos);
          redraw(divRef.current, content);
          setCaretPosition(divRef.current, newPos);
        }
        // Backspace and delete
        if (pos && ['Backspace', 'Delete'].includes(e.key)) {
          const content = new EditorV3Content(divRef.current.innerHTML, {
            textAlignment,
            decimalAlignPercent,
            styles: customStyleMap,
          });
          const newPos = content.deleteCharacter(pos, e.key === 'Backspace');
          redraw(divRef.current, content);
          setCaretPosition(divRef.current, newPos);
        }
        return;
      } else if (
        divRef.current &&
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)
      ) {
        moveCursor(divRef.current, e);
      }
      // Decimal handling
      else if (divRef.current && e.key === '.' && textAlignment === EditorV3Align.decimal) {
        e.stopPropagation();
        e.preventDefault();
        const pos = getCaretPosition(divRef.current);
        if (pos) {
          const content = new EditorV3Content(divRef.current.innerHTML, {
            textAlignment,
            decimalAlignPercent,
            styles: customStyleMap,
          });
          if (!content.lines[pos.startLine].lineText.includes('.')) {
            content.splice(pos, [new EditorV3Line('.')]);
            redraw(divRef.current, content);
            setCaretPosition(divRef.current, {
              startLine: pos.startLine,
              startChar: pos.startChar + 1,
              isCollapsed: true,
              endLine: pos.startLine,
              endChar: pos.startChar + 1,
            });
          }
        }
      }
    },
    [allowNewLine, customStyleMap, decimalAlignPercent, textAlignment],
  );

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Stop handled keys
    if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
  }, []);

  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        if (divRef.current) {
          const pos = getCaretPosition(divRef.current);
          if (pos) {
            const content = new EditorV3Content(divRef.current.innerHTML, {
              textAlignment,
              decimalAlignPercent,
              styles: customStyleMap,
            });
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
              setCaretPosition(divRef.current, {
                ...pos,
                endLine: pos.startLine,
                endChar: pos.startChar,
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Copy failed because ${error}`);
      }
    },
    [customStyleMap, decimalAlignPercent, textAlignment],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      try {
        if (!divRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        const pos = getCaretPosition(divRef.current);
        if (pos) {
          const content = new EditorV3Content(divRef.current.innerHTML, {
            textAlignment,
            decimalAlignPercent,
            styles: customStyleMap,
          });
          const lines: EditorV3Line[] = [];
          const linesImport = (
            e.clipboardData.getData('data/aiev3') !== ''
              ? JSON.parse(e.clipboardData.getData('data/aiev3'))
              : e.clipboardData
                  .getData('text/plain')
                  .split('\n')
                  .map((t) => ({
                    textBlocks: [{ text: t }],
                    textAlignment,
                    decimalAlignPercent,
                  }))
          ) as EditorV3LineImport[];
          // Just text blocks if only one line is allowed
          if (linesImport.length > 1 && !allowNewLine) {
            const textBlocks: EditorV3TextBlock[] = linesImport
              .flatMap((l) => l.textBlocks)
              .map((tb) => new EditorV3TextBlock(tb));
            lines.push(
              new EditorV3Line(
                textBlocks,
                linesImport[0].textAlignment as EditorV3Align,
                linesImport[0].decimalAlignPercent,
              ),
            );
          } else {
            lines.push(...linesImport.map((l) => new EditorV3Line(JSON.stringify(l))));
          }
          // Splice in new data and redraw
          content.splice(pos, lines);
          redraw(divRef.current, content);
          pos.startLine = pos.startLine + lines.length - 1;
          pos.startChar =
            lines.length === 1
              ? pos.startChar + lines[0].lineLength
              : lines[lines.length - 1].lineLength;
          setCaretPosition(divRef.current, {
            ...pos,
            endLine: pos.startLine,
            endChar: pos.startChar,
          });
        }
      } catch (error) {
        console.warn(`Paste failed because: ${error}`);
      }
    },
    [allowNewLine, customStyleMap, decimalAlignPercent, textAlignment],
  );

  const handleBlur = useCallback(() => {
    setInFocus(false);
    returnData(getCurrentData(divRef));
  }, [returnData]);

  const styleRecalc = useMemo(() => {
    const s = { ...style };
    // Remove padding/border width
    if (s.width) {
      s.width = `calc(${s.width} - 10px)`;
    }
    if (resize) {
      s.resize = 'both';
      s.overflow = 'auto';
    }
    return s;
  }, [resize, style]);

  return (
    <div
      className={`aiev3${inFocus ? ' editing' : ''}`}
      id={id}
      onFocusCapture={handleFocus}
      onBlur={handleBlur}
    >
      <ContextMenuHandler
        menuItems={menuItems}
        style={{ width: '100%', height: '100%' }}
        showLowMenu={spellCheck || !styleOnContextMenu}
      >
        <div
          id={`${id}-editable`}
          className='aiev3-editing'
          style={styleRecalc}
          contentEditable={
            editable &&
            (typeof setHtml === 'function' ||
              typeof setJson === 'function' ||
              typeof setText === 'function')
          }
          suppressContentEditableWarning
          spellCheck={spellCheck}
          ref={divRef}
          onFocus={handleFocus}
          onKeyUpCapture={handleKeyUp}
          onCut={handleCopy}
          onCopy={handleCopy}
          onPasteCapture={handlePaste}
          onKeyDownCapture={handleKeyDown}
          onBlurCapture={handleBlur}
          onFocusCapture={handleFocus}
          // Add resizable? when required ?
        />
      </ContextMenuHandler>
    </div>
  );
};

EditorV3.displayName = 'EditorV3';
