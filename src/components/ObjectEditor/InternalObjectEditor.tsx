import { cloneDeep } from "lodash";
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import baseStyles from "../BaseInputs.module.css";
import { Expander } from "./Expander";
import { ItemInput } from "./ItemInput";
import { ObjectEditorContext } from "./ObjectEditorContext";

interface InternalObjectEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  dataPath: string;
}

export const InternalObjectEditor = ({ dataPath, ...rest }: InternalObjectEditorProps) => {
  const objectEditorContext = useContext(ObjectEditorContext);
  const parentObject: Record<string, unknown> = useMemo(
    () => objectEditorContext?.object ?? {},
    [objectEditorContext?.object],
  );
  const thisName = dataPath.split(".").pop() as keyof typeof parentObject;
  const thisObject = useMemo(
    () => parentObject[thisName] as Record<string, unknown> | undefined,
    [parentObject, thisName],
  );
  const availableItems = objectEditorContext?.objectTemplate ?? [];
  const ix = thisObject ? Object.keys(parentObject).indexOf(thisName) : -1;

  const [currentName, setCurrentName] = useState<string>(dataPath.split(".").pop() || "");

  const handleBlur = useCallback(() => {
    if (objectEditorContext && parentObject) {
      // Get full original object
      const newParentObject = Object.entries(cloneDeep(parentObject));
      newParentObject[ix][0] = currentName;
      objectEditorContext.setObject(Object.fromEntries(newParentObject));
    }
  }, [currentName, ix, objectEditorContext, parentObject]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentName(e.currentTarget.value.replace(/[^a-zA-Z0-9_]/g, ""));
  }, []);

  return ix === -1 ? (
    <div>{dataPath} not found</div>
  ) : (
    <Expander
      {...rest}
      lineChild={
        <>
          <label
            className={baseStyles.label}
            id={`label-${dataPath}`}
            htmlFor={`name-${dataPath}`}
          >
            Name
          </label>
          <input
            id={`name-${dataPath}`}
            className={baseStyles.baseInput}
            value={currentName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </>
      }
    >
      {availableItems.map((item, ix) => (
        <Fragment key={ix}>
          <ItemInput dataPoint={`${dataPath}.${item.name}`} />
        </Fragment>
      ))}
    </Expander>
  );
};

InternalObjectEditor.displayName = "InternalObjectEditor";
