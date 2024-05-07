import { useId } from "react";
import { EditorV3TextBlockType } from "../../classes/EditorV3TextBlock";
import baseStyles from "../BaseInputs.module.css";

interface WindowViewBlockTypeProps extends React.ComponentProps<"select"> {
  type: EditorV3TextBlockType;
  setType: (type: EditorV3TextBlockType) => void;
}

export const WindowViewBlockType = ({ type, setType, ...rest }: WindowViewBlockTypeProps) => {
  const selectTypeId = useId();

  return (
    <div className={baseStyles.holder}>
      <label
        id={`label-${selectTypeId}`}
        className={baseStyles.label}
        htmlFor={selectTypeId}
      >
        Type
      </label>
      <select
        {...rest}
        aria-labelledby={`label-${selectTypeId}`}
        id={selectTypeId}
        className={baseStyles.baseSelect}
        value={type}
        onChange={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setType(e.currentTarget.value as "text" | "at");
        }}
      >
        <option value="text">Text</option>
        <option
          value="at"
          disabled
        >
          At
        </option>
      </select>
    </div>
  );
};
