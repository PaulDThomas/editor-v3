import { useCallback, useEffect, useState } from 'react';
import { AieStyleMap } from '../functions/interface';
import { EditorV3 } from './EditorV3';
import './EditorV3.css';

/** Interface for the AsupInternalEditor component */
interface AsupInternalEditorProps {
  id: string;
  value: string;
  setValue?: (ret: string) => void;
  style?: React.CSSProperties;
  styleMap?: AieStyleMap;
  textAlignment?: 'left' | 'center' | 'right' | 'decimal';
  decimalAlignPercent?: number;
  showStyleButtons?: boolean;
  editable?: boolean;
}

export const AsupInternalEditor = ({
  id,
  value,
  setValue,
  style,
  styleMap,
  textAlignment,
  showStyleButtons,
  editable,
  decimalAlignPercent,
}: AsupInternalEditorProps) => {
  /** Active **/
  const [infocus, setInfocus] = useState<boolean>(false);
  /** Current editor state */
  // const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [editorV2Text, setEditorV2Text] = useState('');
  useEffect(() => setEditorV2Text(value), [value]);
  /** Current button state */
  const [buttonState, setButtonState] = useState('hidden');

  // Add default style map
  // const currentStyleMap = useRef<DraftStyleMap>(styleMapToDraft(styleMap));
  // const styleMapExclude = useRef<AieStyleExcludeMap>(styleMapToExclude(styleMap));

  // Show or hide style buttons
  const onFocus = useCallback(() => {
    setInfocus(true);
    // if (showStyleButtons) {
    //   setButtonState('');
    // }
  }, []);

  // Only send data base onBlur of editor
  const onBlur = useCallback(() => {
    setInfocus(true);
    setButtonState('hidden');
    if (typeof setValue === 'function') {
      // if (textAlignment !== 'decimal') {
      //   setValue(
      //     saveToHTML(convertToRaw(editorState.getCurrentContent()), currentStyleMap.current),
      //   );
      // } else {
      setValue(editorV2Text);
      // }
    }
  }, []);

  // Initial Text loading/update
  // useEffect(() => {
  //   // Update the content
  //   setEditorState(EditorState.createWithContent(loadFromHTML(value, editable)));
  // }, [editable, value]);

  /**
   * Apply style to current selection on button press
   * @param style Name of the style to apply
   */
  // const aieApplyStyle = (style: string) => {
  //   // Get current selection
  //   const selection = editorState.getSelection();
  //   // Get current content
  //   let nextContentState = editorState.getCurrentContent();
  //   const currentStyles = editorState.getCurrentInlineStyle();
  //   // Remove all excluded styles from selection
  //   for (const s of styleMapExclude.current[style]) {
  //     nextContentState = Modifier.removeInlineStyle(nextContentState, selection, s);
  //   }
  //   // Add or remove target style
  //   if (currentStyles.has(style)) {
  //     nextContentState = Modifier.removeInlineStyle(nextContentState, selection, style);
  //   } else {
  //     nextContentState = Modifier.applyInlineStyle(nextContentState, selection, style);
  //   }
  //   let nextEditorState = EditorState.createWithContent(nextContentState);
  //   // Put selection back
  //   nextEditorState = EditorState.acceptSelection(nextEditorState, selection);
  //   // Update editor
  //   setEditorState(nextEditorState);
  // };

  // Render the component
  return (
    <div
      className='aie-outer'
      style={{
        ...style,
      }}
    >
      <div
        id={`${id}-holder`}
        className='aie-holder'
        onBlur={onBlur}
        onFocus={onFocus}
      >
        {!infocus ? (
          <div
            onClick={onFocus}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: editorV2Text }}
          />
        ) : (
          <EditorV3
            id={`${id}-v3editor`}
            text={editorV2Text}
            setText={
              editable !== false || typeof setValue !== 'function' ? setEditorV2Text : undefined
            }
            customStyleMap={styleMap}
            textAlignment={textAlignment}
            decimalAlignPercent={decimalAlignPercent}
          />
        )}
      </div>

      {/* {textAlignment !== 'decimal' &&
        !(editable === false || typeof setValue !== 'function') &&
        buttonState !== 'hidden' && (
          <div
            className={`aie-button-position ${
              textAlignment !== undefined ? textAlignment : 'left'
            }`}
          >
            <div className='aie-button-holder'>
              <AieStyleButtonRow
                id={`${id}-stylebuttons`}
                styleList={Object.keys(currentStyleMap.current)}
                currentStyle={editorState.getCurrentInlineStyle()}
                applyStyleFunction={aieApplyStyle}
                disabled={editorState.getSelection().isCollapsed()}
              />
            </div>
          </div>
        )} */}
    </div>
  );
};
