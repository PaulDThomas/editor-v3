import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorV3Content } from '../classes/EditorV3Content';
import { EditorV3Align, EditorV3Styles } from '../classes/interface';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getCurrentData } from '../functions/getCurrentData';
import { setCaretPosition } from '../functions/setCaretPosition';
import './EditorV3.css';
import { redraw } from '../functions/redraw';

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
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
        // Backspace
        if (pos && ['Backspace', 'Delete'].includes(e.key)) {
          const content = new EditorV3Content(divRef.current.innerHTML);
          const newPos = content.deleteCharacter(pos, e.key === 'Backspace');
          redraw(divRef.current, content);
          console.log(newPos);
          setCaretPosition(divRef.current, newPos);
        }
      }
      return;
    } else if (
      divRef.current &&
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
      !e.shiftKey &&
      !e.ctrlKey
    ) {
      const pos = getCaretPosition(divRef.current);
      // Left arrow
      if (pos?.isCollapsed) {
        e.preventDefault();
        e.stopPropagation();
        const newPos = { ...pos };
        const thisLine =
          divRef.current.querySelectorAll('div.aiev3-line').length < pos.startLine
            ? (divRef.current.querySelectorAll('div.aiev3-line')[pos.startLine] as HTMLDivElement)
            : null;
        switch (e.key) {
          case 'ArrowLeft':
            newPos.startLine =
              pos.startChar === 0 && pos.startLine > 0 ? pos.startLine - 1 : pos.startLine;
            newPos.startChar =
              pos.startChar === 0 && pos.startLine > 0
                ? (
                    divRef.current.querySelectorAll('div.aiev3-line')[
                      pos.startLine - 1
                    ] as HTMLDivElement
                  ).innerText.length
                : Math.max(0, pos.startChar - 1);
            break;
          case 'ArrowRight':
            if (thisLine && pos.startChar + 1 < thisLine.innerText.length) {
              newPos.startChar = pos.startChar + 1;
            } else if (
              thisLine &&
              pos.startChar === thisLine.innerText.length &&
              pos.startLine + 1 < divRef.current.querySelectorAll('div.aiev3-line').length
            ) {
              newPos.startLine = pos.startLine + 1;
              newPos.startChar = 0;
            }
            newPos.startLine =
              divRef.current.querySelectorAll('div.aiev3-line').length > pos.startLine + 1 &&
              (divRef.current.querySelectorAll('div.aiev3-line')[pos.startLine] as HTMLDivElement)
                .innerText.length <= pos.startChar
                ? pos.startLine + 1
                : pos.startLine;
            newPos.startChar =
              divRef.current.querySelectorAll('div.aiev3-line').length > pos.startLine + 1 &&
              (divRef.current.querySelectorAll('div.aiev3-line')[pos.startLine] as HTMLDivElement)
                .innerText.length <= pos.startChar
                ? 0
                : pos.startChar + 1;
            break;
          case 'ArrowDown':
            if (divRef.current.querySelectorAll('div.aiev3-line').length > pos.startLine + 1) {
              const nextLine = divRef.current.querySelectorAll('div.aiev3-line')[
                pos.startLine + 1
              ] as HTMLDivElement;
              newPos.startLine = pos.startLine + 1;
              newPos.startChar = Math.min(nextLine.innerText.length, pos.startChar);
            }
            break;
          case 'ArrowUp':
          default:
            if (pos.startLine > 0) {
              const nextLine = divRef.current.querySelectorAll('div.aiev3-line')[
                pos.startLine - 1
              ] as HTMLDivElement;
              newPos.startLine = pos.startLine - 1;
              newPos.startChar = Math.min(nextLine.innerText.length, pos.startChar);
            }
        }
        newPos.endChar = newPos.startChar;
        newPos.endLine = newPos.startLine;
        console.log(`Key: ${e.key}\nFrom: ${JSON.stringify(pos)}\nTo: ${JSON.stringify(newPos)}`);
        setCaretPosition(divRef.current, newPos);
      }
    }
  }

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLSpanElement>) => {
    // Stop handled keys
    if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
  }, []);

  // function handleSelect(_e: React.SyntheticEvent<HTMLDivElement>) {
  // console.log('Select event');
  // console.log(e);
  // divRef.current &&
  //   console.log(`Handle select: ${JSON.stringify(getCaretPosition(divRef.current))}`);
  // }

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
      className={`aiev3 ${inFocus ? 'editing' : ''}`}
      id={id}
      style={widthStyle}
      onFocusCapture={handleFocus}
      onBlur={handleBlur}
    >
      <div
        id={`${id}-editable`}
        className='aiev3-editing'
        contentEditable={editable && typeof setHtml === 'function'}
        suppressContentEditableWarning
        spellCheck={false}
        ref={divRef}
        onKeyUpCapture={handleKeyUp}
        // onSelectCapture={handleSelect}
        onPasteCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Pasting...');
          console.log(e.clipboardData);
          console.log(e.clipboardData.getData('Text'));
          console.log(e.clipboardData.getData('text/plain'));
          console.log(e.clipboardData.getData('text/html'));
          console.log(e.clipboardData.getData('text/rtf'));

          console.log(e.clipboardData.getData('Url'));
          console.log(e.clipboardData.getData('text/uri-list'));
          console.log(e.clipboardData.getData('text/x-moz-url'));
        }}
        onKeyDownCapture={handleKeyDown}
        onBlurCapture={handleBlur}
        onFocus={handleFocus}
      ></div>
    </div>
  );
};
