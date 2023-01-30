import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { drawInnerHtml } from '../functions/drawInnerHtml';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getCurrentData } from '../functions/getCurrentData';
import { getV3Html } from '../functions/getV3Html';
import { AieStyleMap, EditorV3Align } from '../functions/interface';
import './EditorV3.css';

interface EditorV3Props {
  id: string;
  input: string;
  editable?: boolean;
  setHtml?: (ret: string) => void;
  setText?: (ret: string) => void;
  setJson?: (ret: string) => void;
  customStyleMap?: AieStyleMap;
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
  const [currentStyleName, setCurrentStyleName] = useState<string>('');

  // General return function
  const returnData = useCallback(
    (ret: { text: string; html: string; json: string }) => {
      setHtml && setHtml(ret.html);
      setJson && setJson(ret.json);
      setText && setText(ret.text);
    },
    [setHtml, setJson, setText],
  );

  useEffect(() => {
    const { newText, styleName } = getV3Html(input);
    setCurrentStyleName(styleName);
    drawInnerHtml(divRef, getCaretPosition, textAlignment, decimalAlignPercent, newText);
    returnData(getCurrentData(divRef));
  }, [decimalAlignPercent, input, returnData, textAlignment]);

  // Work out backgroup colour and border
  const [inFocus, setInFocus] = useState<boolean>(false);
  const includeStyle = useMemo((): CSSProperties => {
    return {
      display: textAlignment === EditorV3Align.decimal.valueOf() ? 'block' : 'flex',
      flexDirection: 'row',
      justifyContent:
        textAlignment === EditorV3Align.left.valueOf()
          ? 'start'
          : textAlignment === EditorV3Align.center.valueOf()
          ? 'center'
          : textAlignment === EditorV3Align.right.valueOf()
          ? 'end'
          : undefined,
    };
  }, [textAlignment]);

  const handleFocus = useCallback(() => {
    setInFocus(true);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
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
    // console.log("Key select");
    // if (divRef.current) console.log(getCaretPosition(divRef.current));
  }

  const handleBlur = useCallback(() => {
    setInFocus(false);
    returnData(getCurrentData(divRef));
  }, [returnData]);

  const currentStyle = useMemo(() => {
    if (customStyleMap === undefined) return;
    const ix = Object.keys(customStyleMap).findIndex((c) => c === currentStyleName);
    if (ix === -1) {
      return {};
    } else {
      return customStyleMap[currentStyleName].style;
    }
  }, [currentStyleName, customStyleMap]);

  return (
    <div
      className={`aiev3 ${inFocus ? 'editing' : ''}`}
      id={id}
      style={style}
      onFocusCapture={handleFocus}
      onBlur={handleBlur}
    >
      <div
        id={`${id}-line0-holder`}
        className='aiev3-line'
        style={{
          ...includeStyle,
          ...currentStyle,
        }}
      >
        <div
          id={`${id}-line0-editable`}
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
    </div>
  );
};
