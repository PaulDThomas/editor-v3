import { EditorV3Styles } from "../../classes";
import { InternalObjectEditor } from "./InternalObjectEditor";
import { ObjectEditorContextProvider, defaultStyleItems } from "./ObjectEditorContext";

interface ObjectEditorProps {
  styles: EditorV3Styles;
  setStyles: (styles: EditorV3Styles) => void;
}

export const ObjectEditor = ({ styles, setStyles }: ObjectEditorProps) => {
  return (
    <ObjectEditorContextProvider
      editorV3Styles={styles}
      setEditorV3Styles={setStyles}
      availableStyleItems={defaultStyleItems}
    >
      {Object.keys(styles).map((property, ix) => (
        <InternalObjectEditor
          dataPath={property}
          key={`${ix}-${property}`}
        />
      ))}
    </ObjectEditorContextProvider>
  );
};

ObjectEditor.displayName = "ObjectEditor";
export default ObjectEditor;
