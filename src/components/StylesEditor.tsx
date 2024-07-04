import { EditorV3Styles } from "../classes/interface";
import ObjectEditor from "./ObjectEditor/ObjectEditor";
import { ObjectEditorItemOptions } from "./ObjectEditor/ObjectEditorContext";

export const defaultStyleItems: ObjectEditorItemOptions[] = [
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
    type: "string",
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

interface StylesEditorProps {
  styles: EditorV3Styles;
  setStyles: React.Dispatch<React.SetStateAction<EditorV3Styles>>;
  styleItems?: ObjectEditorItemOptions[];
}

export const StylesEditor = ({
  styles,
  setStyles,
  styleItems = defaultStyleItems,
}: StylesEditorProps) => (
  <ObjectEditor
    object={styles}
    setObject={setStyles}
    objectTemplate={styleItems}
  />
);
