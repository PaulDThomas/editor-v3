import { cloneDeep, get, set } from "lodash";
import { useContext } from "react";
import baseStyles from "../BaseInputs.module.css";
import { ObjectEditorContext } from "./ObjectEditorContext";

interface ItemInputProps {
  dataPoint: string;
}

export const ItemInput = ({ dataPoint }: ItemInputProps) => {
  const objectEditorContext = useContext(ObjectEditorContext);
  const thisOption = dataPoint.split(".").pop();
  const thisOptionType = objectEditorContext?.objectTemplate.find(
    (item) => item.name === thisOption,
  )?.type;
  const thisOptionValues = objectEditorContext?.objectTemplate.find(
    (item) => item.name === thisOption,
  )?.options;
  const thisValueRaw = get(objectEditorContext?.object, dataPoint) as string | boolean;
  const thisValueString =
    thisValueRaw === true ? "true" : thisValueRaw === false ? "false" : thisValueRaw;

  const handleCheckChange = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (objectEditorContext) {
      e.preventDefault();
      e.stopPropagation();
      const styles = cloneDeep(objectEditorContext.object);
      const newValue = !thisValueRaw;
      set(styles, dataPoint, newValue);
      objectEditorContext.setObject(styles);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (objectEditorContext) {
      const styles = cloneDeep(objectEditorContext.object);
      const newValue =
        typeof get(styles, dataPoint) === "boolean"
          ? e.target.value === JSON.parse(e.target.value)
          : e.target.value;
      if (get(styles, dataPoint) !== newValue) {
        set(styles, dataPoint, e.target.value);
        objectEditorContext.setObject(styles);
      }
    }
  };

  return !objectEditorContext ? (
    <></>
  ) : (
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
              onClick={handleCheckChange}
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
            onChange={handleSelectChange}
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

ItemInput.displayName = "ItemInput";
