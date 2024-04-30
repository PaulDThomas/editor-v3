import { useId } from "react";
import { EditorV3TextBlockType } from "../classes/EditorV3TextBlock";
import selectStyles from "./Select.module.css";

interface WindowViewBlockTypeProps extends React.ComponentProps<"select"> {
  type: EditorV3TextBlockType;
  setType: (type: EditorV3TextBlockType) => void;
}

export const WindowViewBlockType = ({ type, setType, ...rest }: WindowViewBlockTypeProps) => {
  const selectTypeId = useId();

  return (
    <div className={selectStyles.holder}>
      <label
        id={`label-${selectTypeId}`}
        className={selectStyles.label}
        htmlFor={selectTypeId}
      >
        Type
      </label>
      <select
        {...rest}
        aria-labelledby={`label-${selectTypeId}`}
        id={selectTypeId}
        className={selectStyles.baseSelect}
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
