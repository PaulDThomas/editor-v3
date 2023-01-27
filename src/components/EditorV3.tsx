import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { drawInnerHtml } from '../functions/drawInnerHtml';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getHTMLfromV2Text } from '../functions/getHTMLfromV2Text';
import { getV2TextStyle } from '../functions/getV2TextStyle';
import { AieStyleMap, EditorV3Align } from '../functions/interface';
import './EditorV3.css';

interface EditorV3Props {
  id: string;
  text: string;
  setText?: (ret: string) => void;
  customStyleMap?: AieStyleMap;
  allowNewLine?: boolean;
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  style?: CSSProperties;
}

export const EditorV3 = ({
  id,
  text,
  setText,
  customStyleMap,
  allowNewLine = false,
  textAlignment = EditorV3Align.left,
  decimalAlignPercent = 60,
  style,
}: EditorV3Props): JSX.Element => {
  // Set up reference to inner div
  const divRef = useRef<HTMLDivElement | null>(null);
  const [currentStyleName, setCurrentStyleName] = useState<string>('');
  const [currentStyle, setCurrentStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    const { newText, styleName } = getV2TextStyle(text);
    setCurrentStyleName(styleName);
    drawInnerHtml(divRef, getCaretPosition, textAlignment, decimalAlignPercent, newText);
  }, [decimalAlignPercent, text, textAlignment]);

  const returnData = useCallback(
    (ret: { text?: string }) => {
      // Do nothing if there is nothing to do
      if (typeof setText !== 'function') return;
      // Update via parent function
      setText(ret.text ?? text ?? '');
    },
    [setText, text],
  );

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
    if (typeof setText === 'function') {
      returnData({ text: getHTMLfromV2Text(divRef, currentStyleName, currentStyle) });
    }
  }, [currentStyle, currentStyleName, returnData, setText]);

  useEffect(() => {
    if (customStyleMap === undefined) return;
    const ix = Object.keys(customStyleMap).findIndex((c) => c === currentStyleName);
    if (ix === -1) {
      setCurrentStyle({});
      return;
    } else {
      setCurrentStyle(customStyleMap[currentStyleName].css);
    }
  }, [currentStyleName, customStyleMap]);

  return (
    <div
      className={`aiev2-outer ${inFocus ? 'editing' : ''}`}
      id={id}
      style={style}
    >
      <div
        id={`${id}-line0-holder`}
        className='aiev2-line'
        style={{
          ...includeStyle,
          ...currentStyle,
        }}
        onFocusCapture={handleFocus}
        onBlur={handleBlur}
      >
        <div
          id={`${id}-line0-editable`}
          className='aiev2-editing'
          contentEditable={typeof setText === 'function'}
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
