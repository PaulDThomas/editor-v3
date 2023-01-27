import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { drawInnerHtml } from '../functions/drawInnerHtml';
import { getCaretPosition } from '../functions/getCaretPosition';
import { getHTMLfromV2Text } from '../functions/getHTMLfromV2Text';
import { getV2TextStyle } from '../functions/getV2TextStyle';
import { AieStyleMap, EditorV3Align } from '../functions/interface';
import { AieStyleButtonRow } from './AieStyleButtonRow';
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
  const [currentText, setCurrentText] = useState<string>('');
  const [currentStyleName, setCurrentStyleName] = useState<string>('');
  const [currentStyle, setCurrentStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    const { newText, styleName } = getV2TextStyle(text);
    setCurrentText(newText);
    setCurrentStyleName(styleName);
    drawInnerHtml(
      divRef,
      setCurrentText,
      getCaretPosition,
      textAlignment,
      decimalAlignPercent,
      newText,
    );
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
    const j =
      textAlignment === EditorV3Align.left.valueOf()
        ? 'start'
        : textAlignment === EditorV3Align.center.valueOf()
        ? 'center'
        : textAlignment === EditorV3Align.right.valueOf()
        ? 'end'
        : undefined;
    return {
      background: inFocus ? 'white' : 'inherit',
      border: inFocus ? '1px solid grey' : '1px solid transparent',
      display: textAlignment === EditorV3Align.decimal.valueOf() ? 'block' : 'flex',
      flexDirection: 'row',
      justifyContent: j,
    };
  }, [inFocus, textAlignment]);

  // // Work out justification
  // const [just, setJust] = useState<React.CSSProperties>({});
  // useEffect(() => {
  //   switch (textAlignment) {
  //     case EditorV3Align.right:
  //       setJust({
  //         display: 'flex',
  //         flexDirection: 'row',
  //         justifyContent: 'end',
  //       });
  //       break;
  //     case EditorV3Align.center:
  //       setJust({
  //         display: 'flex',
  //         flexDirection: 'row',
  //         justifyContent: 'center',
  //       });
  //       break;
  //     case EditorV3Align.decimal:
  //       setJust({
  //         display: 'block',
  //       });
  //       break;
  //     case EditorV3Align.left:
  //     default:
  //       setJust({
  //         display: 'flex',
  //         flexDirection: 'row',
  //         justifyContent: 'start',
  //       });
  //   }
  // }, [textAlignment]);

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
            setCurrentText,
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

  const handleBlur = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (e: React.FocusEvent<HTMLDivElement>) => {
      setInFocus(false);
      if (typeof setText === 'function') {
        returnData({ text: getHTMLfromV2Text(currentText, currentStyleName, currentStyle) });
      }
    },
    [currentStyle, currentStyleName, currentText, returnData, setText],
  );

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
      className='aiev2-outer'
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
      {typeof setText === 'function' && inFocus && (
        <div className='aie-button-position center'>
          <div className='aie-button-holder'>
            <AieStyleButtonRow
              id={`${id}-stylebuttons`}
              styleList={Object.keys(customStyleMap || {})}
              currentStyle={currentStyleName}
              applyStyleFunction={(ret: string) => {
                const newStyle = ret === currentStyleName ? '' : ret;
                setCurrentStyleName(newStyle);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
