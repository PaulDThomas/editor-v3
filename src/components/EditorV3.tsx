import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorV3Content } from '../classes/EditorV3Content';
import { EditorV3Align, EditorV3Position, EditorV3Styles } from '../classes/interface';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getCurrentData } from '../functions/getCurrentData';
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
  // const [keyDownContent, setKeyDownContent] = useState<EditorV3Content | null>(null);
  const [keyDownPosition, setKeyDownPosition] = useState<EditorV3Position | null>(null);
  // const [currentStyleName, setCurrentStyleName] = useState<string>('');

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

  // Redraw function
  const redraw = useCallback(
    (el: HTMLDivElement | null, content: EditorV3Content) => {
      if (el) {
        el.innerHTML = '';
        el.append(content.el);
        // Update height after render for decimals because of absolute positioning
        if (textAlignment === EditorV3Align.decimal) {
          [...el.querySelectorAll('.aiev3-line.decimal')].forEach((line) => {
            (line as HTMLDivElement).style.height = `${Math.max(
              ...(Array.from(el.getElementsByClassName('aiev3-span')) as HTMLSpanElement[]).map(
                (el) => el.clientHeight,
              ),
            )}px`;
          });
        }
      }
    },
    [textAlignment],
  );

  // Update if input changes
  useEffect(() => {
    const newContent = new EditorV3Content(input, {
      textAlignment,
      decimalAlignPercent,
      styles: customStyleMap,
    });
    redraw(divRef.current, newContent);
    returnData(getCurrentData(divRef), true);
  }, [customStyleMap, decimalAlignPercent, input, redraw, returnData, textAlignment]);

  // Work out backgroup colour and border
  const [inFocus, setInFocus] = useState<boolean>(false);
  const handleFocus = useCallback(() => {
    setInFocus(true);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    // No new lines
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    // Handle decimal state deletes
    else if (
      divRef.current &&
      ['Backspace', 'Delete'].includes(e.key) &&
      textAlignment === EditorV3Align.decimal
    ) {
      const range = window.getSelection();
      if (
        range &&
        range.anchorNode === range.focusNode &&
        range.anchorOffset === range.focusOffset
      ) {
        e.stopPropagation();
        e.preventDefault();
        setKeyDownPosition(getCaretPosition(divRef.current));
        return;
      }
      // Doing the delete, so set these to null
      else {
        // setKeyDownContent(null);
        setKeyDownPosition(null);
        return;
      }
    }
    // Handle decimal state moves
    else if (
      divRef.current &&
      ['ArrowRight', 'ArrowDown', 'Home', 'End'].includes(e.key) &&
      textAlignment === EditorV3Align.decimal &&
      window.getSelection()?.isCollapsed
    ) {
      const caret = getCaretPosition(divRef.current);
      const els = [...(divRef.current as HTMLDivElement).querySelectorAll('.aiev3-line')];
      if (caret && e.key === 'Home') {
        setCaretPosition(divRef.current, {
          startLine: caret.startLine,
          startChar: 0,
          isCollapsed: true,
          endLine: caret.startLine,
          endChar: 0,
        });
      } else if (
        caret &&
        (e.key === 'End' || (e.key === 'ArrowDown' && els.length === caret.startLine + 1))
      ) {
        setCaretPosition(divRef.current, {
          startLine: caret.startLine,
          startChar:
            (divRef.current as HTMLDivElement).querySelectorAll('.aiev3-line')[caret.startLine]
              .textContent?.length ?? 0,
          isCollapsed: true,
          endLine: caret.startLine,
          endChar:
            (divRef.current as HTMLDivElement).querySelectorAll('.aiev3-line')[caret.startLine]
              .textContent?.length ?? 0,
        });
      } else if (caret && e.key === 'ArrowDown' && els.length > caret.startLine + 1) {
        setCaretPosition(divRef.current, {
          startLine: caret.startLine + 1,
          startChar: caret.startChar,
          isCollapsed: true,
          endLine: caret.startLine + 1,
          endChar: caret.startChar,
        });
      } else if (caret && e.key === 'ArrowRight') {
        const decPos = els[caret.startLine].textContent?.replace(/\u200b/g, '').match(/\./)?.index;
        if (
          decPos === caret.startChar - 1 &&
          (els[caret.startLine].textContent?.replace(/\u200b/g, '').length ?? 0) > caret.startChar
        ) {
          setCaretPosition(divRef.current, {
            startLine: caret.startLine,
            startChar: caret.startChar + 1,
            isCollapsed: true,
            endLine: caret.startLine,
            endChar: caret.startChar + 1,
          });
          e.preventDefault();
          e.stopPropagation();
        } else if (
          caret.startChar >=
            (els[caret.startLine].textContent?.replace(/\u200b/g, '').length ?? 0) &&
          els.length > caret.startLine + 1
        ) {
          setCaretPosition(divRef.current, {
            startLine: caret.startLine + 1,
            startChar: 0,
            isCollapsed: true,
            endLine: caret.startLine + 1,
            endChar: 0,
          });
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
    // What has been pressed
    // else {
    //   console.log(`Key down ${e.key}`);
    // }
  }

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      // No new lines
      if (e.key === 'Enter' && !allowNewLine) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      const sel: Selection | null = window.getSelection();
      if (divRef.current && sel && sel.rangeCount > 0) {
        const range: Range = sel.getRangeAt(0);
        // Add new line
        const caret = getCaretPosition(divRef.current);
        const newContent = new EditorV3Content(divRef.current.innerHTML, {
          textAlignment,
          decimalAlignPercent,
          styles: customStyleMap,
        });

        // Enter pressed
        if (e.key === 'Enter' && allowNewLine && caret) {
          newContent.splitLine(caret);
          caret.startChar = 0;
          caret.startLine = caret.startLine + 1;
          redraw(divRef.current, newContent);
          caret && setCaretPosition(divRef.current, caret);
        } else if (range.collapsed) {
          // Remove line break with backspace in decimal form
          if (
            textAlignment === EditorV3Align.decimal &&
            e.key === 'Backspace' &&
            caret &&
            keyDownPosition
          ) {
            if (caret.startChar > 0) {
              caret.startChar = caret.startChar - 1;
              newContent.deleteCharacter(caret);
            } else if (caret.startLine > 0 && caret.startChar === 0) {
              caret.startLine = caret.startLine - 1;
              caret.startChar = newContent.lines[caret.startLine].text.length;
              newContent.mergeLines(caret.startLine);
            }
          }
          // Remove line break with delete in decimal form
          else if (textAlignment === EditorV3Align.decimal && e.key === 'Delete' && caret) {
            if (
              caret.startChar === newContent.lines[caret.startLine]?.text.length &&
              newContent.lines.length > caret.startLine + 1
            )
              newContent.mergeLines(caret.startLine);
            else if (caret.startChar < (newContent.lines[caret.startLine]?.text.length ?? 0)) {
              newContent.deleteCharacter(caret);
            }
          }
          redraw(divRef.current, newContent);
          caret && setCaretPosition(divRef.current, caret);
        }
      }
    },
    [allowNewLine, customStyleMap, decimalAlignPercent, keyDownPosition, redraw, textAlignment],
  );

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
        onKeyDownCapture={handleKeyDown}
        onBlurCapture={handleBlur}
        onFocus={handleFocus}
      ></div>
    </div>
  );
};
