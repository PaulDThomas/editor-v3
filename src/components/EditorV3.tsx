import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorV3Content } from '../classes/EditorV3Content';
import { EditorV3Align, EditorV3Styles } from '../classes/interface';
import { drawInnerHtml } from '../functions/drawInnerHtml';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getCurrentData } from '../functions/getCurrentData';
import { updateInnerHtml } from '../functions/updateInnerHtml';
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

  useEffect(() => {
    const newInnerHtmls = new EditorV3Content(input, {
      textAlignment,
      decimalAlignPercent,
      styles: customStyleMap,
    });
    divRef.current && updateInnerHtml(divRef.current, newInnerHtmls);
  }, [customStyleMap, decimalAlignPercent, input, returnData, textAlignment]);

  // Work out backgroup colour and border
  const [inFocus, setInFocus] = useState<boolean>(false);
  const handleFocus = useCallback(() => {
    setInFocus(true);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // const sel: Selection | null = window.getSelection();
    if (e.key === 'Enter' && !allowNewLine) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const sel: Selection | null = window.getSelection();
      if (sel && divRef.current) {
        const range: Range = sel.getRangeAt(0);
        if (range.collapsed) {
          drawInnerHtml(
            divRef,
            getCaretPosition,
            textAlignment,
            decimalAlignPercent,
            undefined,
            e,
            range,
          );
        }
      }
    },
    [decimalAlignPercent, textAlignment],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSelect(e: React.SyntheticEvent<HTMLDivElement>) {
    // divRef.current &&
    //   console.log(`Handle select: ${JSON.stringify(getCaretPosition(divRef.current))}`);
  }

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
        onSelectCapture={handleSelect}
        onKeyDownCapture={handleKeyDown}
        onBlurCapture={handleBlur}
        onFocus={handleFocus}
      ></div>
    </div>
  );
};
