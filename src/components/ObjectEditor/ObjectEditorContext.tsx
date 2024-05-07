import { createContext } from "react";
import { EditorV3Styles } from "../../classes/interface";

export interface ObjectEditorItemOptions {
  name: string;
  type: "select" | "string" | "boolean" | "number";
  options?: { label: string; value: string | number | boolean | undefined }[];
}

interface ObjectEditorContextProps {
  editorV3Styles: EditorV3Styles;
  setEditorV3Styles: (styles: EditorV3Styles) => void;
  availableStyleItems: ObjectEditorItemOptions[];
}

export const ObjectEditorContext = createContext<ObjectEditorContextProps>({
  editorV3Styles: {},
  setEditorV3Styles: () => {},
  availableStyleItems: [],
});

interface ObjectEditorContextProviderProps extends ObjectEditorContextProps {
  children: React.ReactNode;
}

export const ObjectEditorContextProvider = ({
  editorV3Styles,
  setEditorV3Styles,
  availableStyleItems,
  children,
}: ObjectEditorContextProviderProps) => {
  return (
    <ObjectEditorContext.Provider
      value={{ editorV3Styles, setEditorV3Styles, availableStyleItems }}
    >
      {children}
    </ObjectEditorContext.Provider>
  );
};

ObjectEditorContextProvider.displayName = "ObjectEditorContextProvider";
