import { InternalObjectEditor } from "./InternalObjectEditor";
import { ObjectEditorContextProvider, ObjectEditorItemOptions } from "./ObjectEditorContext";

interface ObjectEditorProps<T extends Record<string, unknown>> {
  object: T;
  setObject: React.Dispatch<React.SetStateAction<T>>;
  objectTemplate: ObjectEditorItemOptions[];
}

export const ObjectEditor = <T extends Record<string, unknown>>({
  object,
  setObject,
  objectTemplate,
}: ObjectEditorProps<T>) => {
  return (
    <ObjectEditorContextProvider
      object={object}
      setObject={setObject}
      objectTemplate={objectTemplate}
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
