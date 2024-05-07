import { EditorV3Styles } from "../../classes";
import baseStyles from "../BaseInputs.module.css";
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
        <div
          className={baseStyles.expander}
          key={`${ix}-${property}`}
          onClick={(e) => {
            if (
              e.target instanceof HTMLDivElement &&
              e.target.parentElement?.classList.contains(baseStyles.expander) &&
              e.target.classList.contains(baseStyles.holder)
            ) {
              e.preventDefault();
              e.stopPropagation();
              const thisDiv = e.currentTarget as HTMLDivElement;
              thisDiv.classList.toggle(baseStyles.expanded);
            }
          }}
        >
          <div className={baseStyles.holder}>
            <label className={baseStyles.label}>Name</label>
            <input
              className={baseStyles.baseInput}
              value={property}
              disabled
            />
            <span
              style={{
                ...styles[property],
                marginLeft: "2rem",
              }}
            >
              Sample of {property}
            </span>
          </div>
          <div className={baseStyles.expanderContent}>
            <StyleEditor dataPath={property} />
          </div>
        </div>
      ))}
    </StylesContextProvider>
  );
};

StylesEditor.displayName = "StyleEditor";
export default StylesEditor;
