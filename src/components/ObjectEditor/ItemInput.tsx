import { cloneDeep, get, set } from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import baseStyles from "../BaseInputs.module.css";
import { ObjectEditorContext } from "./ObjectEditorContext";

interface ItemInputProps extends React.HTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  dataPoint: string;
}

export const ItemInput = ({ dataPoint, ...rest }: ItemInputProps) => {
  const objectEditorContext = useContext(ObjectEditorContext);
  const thisOption = dataPoint.split(".").pop();
  const thisOptionType = objectEditorContext?.objectTemplate.find(
    (item) => item.name === thisOption,
  )?.type;
  const thisOptionValues = objectEditorContext?.objectTemplate.find(
    (item) => item.name === thisOption,
  )?.options;
  const thisValueRaw = get(objectEditorContext?.object, dataPoint) as
    | string
    | number
    | boolean
    | undefined;
  const thisValueString = thisValueRaw?.toString() ?? "None";

  const handleCheckChange = (e: React.MouseEvent<HTMLElement>) => {
    if (objectEditorContext) {
      e.preventDefault();
      e.stopPropagation();
      const newObject = cloneDeep(objectEditorContext.object);
      const newValue = !thisValueRaw;
      set(newObject, dataPoint, newValue);
      objectEditorContext.setObject(newObject);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (objectEditorContext) {
      const newObject = cloneDeep(objectEditorContext.object);
      const newValue = e.target.value;
      if (get(newObject, dataPoint) !== newValue) {
        set(newObject, dataPoint, e.target.value === "UNDEFINED" ? undefined : newValue);
        objectEditorContext.setObject(newObject);
      }
    }
  };

  const [inputValue, setInputValue] = useState<string>(thisValueString);
  useEffect(() => {
    setInputValue(thisValueString);
  }, [thisValueString]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleInputBlur = useCallback(() => {
    if (objectEditorContext) {
      const newObject = cloneDeep(objectEditorContext.object);
      const newValue = thisOptionType === "number" ? parseFloat(inputValue) : inputValue;
      if (get(newObject, dataPoint) !== newValue) {
        set(newObject, dataPoint, newValue);
        objectEditorContext.setObject(newObject);
      }
    }
  }, [dataPoint, inputValue, objectEditorContext, thisOptionType]);

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
              checked={(thisValueRaw ?? false) as boolean}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={handleCheckChange}
              {...rest}
            />
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
            {...rest}
            id={`id-${dataPoint}`}
            className={baseStyles.baseSelect}
            value={thisValueString}
            onChange={handleSelectChange}
          >
            {thisOptionValues.findIndex((option) => option.value === thisValueString) === -1 && (
              <option
                value={thisValueString}
                disabled
              >
                {thisValueString}
              </option>
            )}
            {thisOptionValues.map((item, ix) => (
              <option
                key={`${ix}-${item.value}`}
                value={item.value?.toString() ?? "UNDEFINED"}
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
            {...rest}
            type={thisOptionType === "number" ? "number" : "text"}
            id={`id-${dataPoint}`}
            className={baseStyles.baseInput}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
        </>
      )}
    </div>
  );
};

ItemInput.displayName = "ItemInput";
