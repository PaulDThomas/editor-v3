import { cloneDeep, get, set } from "lodash";
import { useContext } from "react";
import { BaseCheckbox } from "./BaseCheckbox";
import { BaseInput } from "./BaseInput";
import { BaseSelect } from "./BaseSelect";
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
  const thisOptionLabel =
    objectEditorContext?.objectTemplate.find((item) => item.name === thisOption)?.label ??
    thisOption;
  const thisValueRaw = get(objectEditorContext?.object, dataPoint) as
    | string
    | number
    | boolean
    | undefined;

  const handleChange = (ret: string | number | boolean | undefined) => {
    if (objectEditorContext) {
      const newObject = cloneDeep(objectEditorContext.object);
      if (get(newObject, dataPoint) !== ret) {
        set(newObject, dataPoint, ret);
        objectEditorContext.setObject(newObject);
      }
    }
  };

  return !objectEditorContext ? (
    <></>
  ) : (
    <>
      {thisOptionType === "boolean" ? (
        <BaseCheckbox
          id={`id-${dataPoint}`}
          checked={(thisValueRaw ?? false) as boolean}
          change={handleChange}
          label={thisOptionLabel}
          {...rest}
        />
      ) : thisOptionType === "select" && thisOptionValues ? (
        <BaseSelect
          id={`id-${dataPoint}`}
          value={thisValueRaw}
          availableOptions={thisOptionValues}
          change={handleChange}
          label={thisOptionLabel}
          {...rest}
        />
      ) : (
        <BaseInput
          id={`id-${dataPoint}`}
          value={thisValueRaw}
          change={handleChange}
          label={thisOptionLabel}
          {...rest}
        />
      )}
    </>
  );
};

ItemInput.displayName = "ItemInput";
