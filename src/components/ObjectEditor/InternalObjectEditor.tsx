import { useCallback, useContext, useState } from "react";
import baseStyles from "../BaseInputs.module.css";
import { ItemInput } from "./ItemInput";
import { ObjectEditorContext } from "./ObjectEditorContext";
import { EditorV3Styles } from "../../classes/interface";

interface InternalObjectEditorProps {
  dataPath: string;
}

export const InternalObjectEditor = ({ dataPath }: InternalObjectEditorProps) => {
  const styleContext = useContext(ObjectEditorContext);
  const styles: EditorV3Styles = styleContext.editorV3Styles;
  const availableStyleItems = styleContext.availableStyleItems;
  const styleName = dataPath.split(".").pop() as keyof typeof styles as string;
  const ix = Object.keys(styles).indexOf(styleName);
  const [currentStyleName, setCurrentStyleName] = useState<string>(dataPath.split(".").pop() || "");

  const handleBlur = useCallback(() => {
    const newStyles = Object.entries(styles);
    newStyles[ix][0] = currentStyleName;
    styleContext.setEditorV3Styles(Object.fromEntries(newStyles));
  }, [currentStyleName, ix, styleContext, styles]);

  return ix === -1 ? (
    <></>
  ) : (
    <div
      className={baseStyles.expander}
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
          value={currentStyleName}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentStyleName(e.currentTarget.value);
          }}
          onBlur={handleBlur}
        />
        <span
          style={{
            ...styles[styleName],
            marginLeft: "2rem",
          }}
        >
          Sample of {dataPath.split(".").pop()}
        </span>
      </div>
      <div className={baseStyles.expanderContent}>
        {availableStyleItems.map((item, ix) => (
          <ItemInput
            dataPoint={`${dataPath}.${item.name}`}
            key={ix}
          />
        ))}
      </div>
    </div>
  );
};

InternalObjectEditor.displayName = "StyleEditor";
