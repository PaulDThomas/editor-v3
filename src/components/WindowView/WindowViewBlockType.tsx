import { useId } from "react";
import { EditorV3TextBlockType } from "../../classes/EditorV3TextBlock";
import baseStyles from "../BaseInputs.module.css";

interface WindowViewBlockTypeProps extends React.ComponentProps<"select"> {
  includeAt: boolean;
  type: EditorV3TextBlockType;
  disabled: boolean;
  setType: (type: EditorV3TextBlockType) => void;
}

export const WindowViewBlockType = ({
  type,
  setType,
  includeAt,
  ...rest
}: WindowViewBlockTypeProps) => {
  const selectTypeId = useId();

  return (
    <div
      className={baseStyles.holder}
      style={{ flexShrink: 1, width: "auto" }}
    >
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
          setType(e.currentTarget.value as EditorV3TextBlockType);
        }}
      >
        <option value="text">Text</option>
        <option value="select">Select</option>
        {includeAt && (
          <option
            value="at"
            disabled
          >
            At
          </option>
        )}
      </select>
    </div>
  );
};

WindowViewBlockType.displayName = "WindowViewBlockType";
