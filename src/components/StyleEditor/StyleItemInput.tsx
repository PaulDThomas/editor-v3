import _, { cloneDeep } from "lodash";
import { useContext } from "react";
import baseStyles from "../BaseInputs.module.css";
import { StylesContext } from "./StylesContext";

interface StyleItemInputProps {
  dataPoint: string;
}

export const StyleItemInput = ({ dataPoint }: StyleItemInputProps) => {
  const styleContext = useContext(StylesContext);
  const thisOption = dataPoint.split(".").pop();
  const thisOptionType = styleContext.availableStyleItems.find(
    (item) => item.name === thisOption,
  )?.type;
  const thisOptionValues = styleContext.availableStyleItems.find(
    (item) => item.name === thisOption,
  )?.options;
  const thisValueRaw = _.get(styleContext.editorV3Styles, dataPoint) as string | boolean;
  const thisValueString =
    thisValueRaw === true ? "true" : thisValueRaw === false ? "false" : thisValueRaw;

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const styles = cloneDeep(styleContext.editorV3Styles);
    const newValue =
      typeof _.get(styles, dataPoint) === "boolean"
        ? e.target.value === JSON.parse(e.target.value)
        : e.target.value;
    if (_.get(styles, dataPoint) !== newValue) {
      _.set(styles, dataPoint, e.target.value);
      styleContext.setEditorV3Styles(styles);
    }
  };

  return (
    <div className={baseStyles.holder}>
      {thisOptionType === "boolean" ? (
        <>
          <div>
            <input
              type="checkbox"
              id={`id-${dataPoint}`}
              className={baseStyles.baseCheckbox}
              checked={thisValueRaw as boolean}
            />{" "}
            <label
              id={`label-${dataPoint}`}
              htmlFor={`id-${dataPoint}`}
              className={baseStyles.baseCheckboxLabel}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const styles = cloneDeep(styleContext.editorV3Styles);
                const newValue = !thisValueRaw;
                _.set(styles, dataPoint, newValue);
                styleContext.setEditorV3Styles(styles);
              }}
            >
              {thisOption}
            </label>
          </div>
        </>
      ) : thisOptionType === "select" && thisOptionValues ? (
        <>
          <label
            className={baseStyles.label}
            id={`label-${dataPoint}`}
            htmlFor={`id-${dataPoint}`}
          >
            {thisOption}
          </label>
          <select
            id={`id-${dataPoint}`}
            className={baseStyles.baseSelect}
            value={thisValueString}
            onChange={handleOnChange}
          >
            {thisOptionValues.map((item, ix) => (
              <option
                key={`${ix}-${item.value}`}
                value={typeof item.value === "boolean" ? item.value.toString() : item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <label
            className={baseStyles.label}
            id={`label-${dataPoint}`}
            htmlFor={`id-${dataPoint}`}
          >
            {thisOption}
          </label>
          <input
            id={`id-${dataPoint}`}
            className={baseStyles.baseInput}
            value={thisValueString}
            disabled
          />
        </>
      )}
    </div>
  );
};

StyleItemInput.displayName = "StyleItemInput";
