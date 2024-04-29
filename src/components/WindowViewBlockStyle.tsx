import { useId } from "react";
import { EditorV3State } from "./EditorV3";
import selectStyles from "./Select.module.css";
import { EditorV3Styles } from "../classes";

interface WindowViewBlockStyleProps extends React.ComponentProps<"select"> {
  state: EditorV3State;
  styleName?: string;
  setStyleName: (style: string) => void;
}

export const WindowViewBlockStyle = ({
  state,
  styleName,
  setStyleName,
  ...rest
}: WindowViewBlockStyleProps) => {
  const selectStyleId = useId();
  return !state.content.contentProps.styles ||
    Object.keys(state.content.contentProps.styles).length === 0 ? (
    <></>
  ) : (
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
        {Object.keys(state.content.contentProps.styles).map((sn, ix) => (
          <option
            key={ix}
            value={sn}
            disabled={(state.content.contentProps.styles as EditorV3Styles)[sn].isNotAvailabe}
          >
            {sn}
          </option>
        ))}
      </select>
    </div>
  );
};
