import baseStyles from "./BaseInputs.module.css";
import { EditorV3, EditorV3Props } from "./EditorV3";

interface BaseEdivotV3Props extends EditorV3Props {
  label?: string;
}

export const BaseEditorV3 = ({ label, ...rest }: BaseEdivotV3Props): JSX.Element => {
  return (
    <div className={baseStyles.holder}>
      {label !== undefined && (
        <label
          className={baseStyles.label}
          htmlFor={rest.id}
        >
          {label}
        </label>
      )}
      <div className={baseStyles.editorHolder}>
        <EditorV3
          {...rest}
          noBorder
        />
      </div>
    </div>
  );
};
