import { EditorV3Styles } from "../../classes";
import { InternalObjectEditor } from "./InternalObjectEditor";
import { ObjectEditorContextProvider, ObjectEditorItemOptions } from "./ObjectEditorContext";

interface ObjectEditorProps {
  object: EditorV3Styles;
  setObject: (styles: EditorV3Styles) => void;
  objectTemplate: ObjectEditorItemOptions[];
}

export const ObjectEditor = ({ object, setObject, objectTemplate }: ObjectEditorProps) => {
  return (
    <ObjectEditorContextProvider
      editorV3Styles={object}
      setEditorV3Styles={setObject}
      availableStyleItems={objectTemplate}
    >
      {Object.keys(object).map((property, ix) => (
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
