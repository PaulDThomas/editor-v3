import { useId } from "react";
import { EditorV3Styles } from "../../classes";
import selectStyles from "./Select.module.css";

interface WindowViewBlockStyleProps extends React.ComponentProps<"select"> {
  styles: EditorV3Styles;
  styleName?: string;
  setStyleName: (style: string) => void;
}

export const WindowViewBlockStyle = ({
  styles,
  styleName,
  setStyleName,
  ...rest
}: WindowViewBlockStyleProps) => {
  const selectStyleId = useId();
  return (
    <div className={selectStyles.holder}>
      <label
        id={`label-${selectStyleId}`}
        className={selectStyles.label}
        htmlFor={selectStyleId}
      >
        Style
      </label>
      <select
        {...rest}
        aria-labelledby=""
        id={selectStyleId}
        className={selectStyles.baseSelect}
        value={styleName}
        onChange={(e) => setStyleName(e.currentTarget.value)}
      >
        <option value="">None</option>
        {Object.keys(styles).map((sn, ix) => (
          <option
            key={ix}
            value={sn}
            disabled={(styles as EditorV3Styles)[sn].isNotAvailabe}
          >
            {sn}
          </option>
        ))}
      </select>
    </div>
  );
};
