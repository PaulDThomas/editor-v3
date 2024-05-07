import { createContext } from "react";
import { EditorV3Styles } from "../../classes/interface";

interface StyleOptions {
  name: string;
  type: "select" | "string" | "boolean" | "number";
  options?: { label: string; value: string | number | boolean | undefined }[];
}

export const defaultStyleItems: StyleOptions[] = [
  {
    name: "fontFamily",
    type: "select",
    options: [
      {
        value:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', sans-serif",
        label: "Sans Serif",
      },
      { value: "'Courier New', monospace", label: "Monospace" },
    ],
  },
  {
    name: "fontSize",
    type: "select",
    options: [
      { value: undefined, label: "None" },
      { value: "8pt", label: "8pt" },
      { value: "9pt", label: "9pt" },
      { value: "10pt", label: "10pt" },
      { value: "11pt", label: "11pt" },
      { value: "12pt", label: "12pt" },
      { value: "14pt", label: "14pt" },
      { value: "16pt", label: "16pt" },
      { value: "18pt", label: "18pt" },
    ],
  },
  {
    name: "font-style",
    type: "select",
    options: [
      { value: undefined, label: "None" },
      { value: "bold", label: "Bold" },
      { value: "italic", label: "Italic" },
    ],
  },
  {
    name: "fontWeight",
    type: "select",
    options: [
      { value: undefined, label: "None" },
      { value: 300, label: "Thin" },
      { value: 600, label: "Normal" },
      { value: 700, label: "Heavy" },
      { value: 1000, label: "Very heavy" },
    ],
  },
  {
    name: "color",
    type: "select",
    options: [
      { value: undefined, label: "None" },
      { value: "red", label: "Red" },
      { value: "green", label: "Green" },
      { value: "blue", label: "Blue" },
      { value: "black", label: "Black" },
    ],
  },
  {
    name: "textDecoration",
    type: "select",
    options: [
      { value: undefined, label: "None" },
      { value: "underline", label: "Underline" },
      { value: "line-through", label: "Line Through" },
    ],
  },

  {
    name: "isLocked",
    type: "boolean",
  },
  {
    name: "isNotAvailabe",
    type: "boolean",
  },
];

interface ObjectEditorContextProps {
  editorV3Styles: EditorV3Styles;
  setEditorV3Styles: (styles: EditorV3Styles) => void;
  availableStyleItems: StyleOptions[];
}

export const ObjectEditorContext = createContext<ObjectEditorContextProps>({
  editorV3Styles: {},
  setEditorV3Styles: () => {},
  availableStyleItems: defaultStyleItems,
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
