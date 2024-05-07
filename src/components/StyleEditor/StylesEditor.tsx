import { EditorV3Styles } from "../../classes";
import { StyleEditor } from "./StyleEditor";
import { StylesContextProvider, defaultStyleItems } from "./StylesContext";

interface StylesEditorProps {
  styles: EditorV3Styles;
  setStyles: (styles: EditorV3Styles) => void;
}

export const StylesEditor = ({ styles, setStyles }: StylesEditorProps) => {
  return (
    <StylesContextProvider
      editorV3Styles={styles}
      setEditorV3Styles={setStyles}
      availableStyleItems={defaultStyleItems}
    >
      {Object.keys(styles).map((property, ix) => (
        <StyleEditor
          dataPath={property}
          key={`${ix}-${property}`}
        />
      ))}
    </StylesContextProvider>
  );
};

StylesEditor.displayName = "StyleEditor";
export default StylesEditor;
