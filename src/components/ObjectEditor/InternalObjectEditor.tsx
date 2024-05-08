import { cloneDeep } from "lodash";
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import baseStyles from "../BaseInputs.module.css";
import { ItemInput } from "./ItemInput";
import { ObjectEditorContext } from "./ObjectEditorContext";

interface InternalObjectEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  dataPath: string;
}

export const InternalObjectEditor = ({ dataPath, ...rest }: InternalObjectEditorProps) => {
  const objectEditorContext = useContext(ObjectEditorContext);
  // const parent = dataPath.split(".").slice(0, -1).join(".");
  const parentObject: Record<string, unknown> = useMemo(
    () =>
      // parent !== ""
      //   ? (get(objectEditorContext?.object, parent, {}) as Record<string, unknown>)
      //   :
      objectEditorContext?.object ?? {},
    [objectEditorContext?.object],
  );
  const thisName = dataPath.split(".").pop() as keyof typeof parentObject;
  const thisObject = useMemo(
    () => parentObject[thisName] as Record<string, unknown> | undefined,
    [parentObject, thisName],
  );
  const availableItems = objectEditorContext?.objectTemplate ?? [];
  // .filter(
  //   (item) => item.dataPath === undefined || item.dataPath === dataPath,
  // );
  const ix = thisObject ? Object.keys(parentObject).indexOf(thisName) : -1;

  const [currentName, setCurrentName] = useState<string>(dataPath.split(".").pop() || "");

  const handleBlur = useCallback(() => {
    if (objectEditorContext && parentObject) {
      // Get full original object
      // const originalObject = objectEditorContext.object;
      // Create new parent object as an array of key-value pairs
      const newParentObject = Object.entries(cloneDeep(parentObject));
      newParentObject[ix][0] = currentName;
      // Set the parent object
      // if (parent !== "") {
      //   set(originalObject, parent, Object.fromEntries(newParentObject));
      //   objectEditorContext.setObject(originalObject);
      // } else {
      objectEditorContext.setObject(Object.fromEntries(newParentObject));
      // }
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
    <div
      {...rest}
      className={baseStyles.expander}
      onClick={(e) => {
        if (
          e.target instanceof HTMLDivElement &&
          e.target.parentElement?.classList.contains(baseStyles.expander) &&
          e.target.classList.contains(baseStyles.holder)
        ) {
          e.preventDefault();
          e.stopPropagation();
          const thisDiv = e.currentTarget as HTMLDivElement;
          thisDiv.classList.toggle(baseStyles.expanded);
        }
      }}
    >
      <div className={baseStyles.holder}>
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
        {/* <span
          style={{
            ...object[styleName],
            marginLeft: "2rem",
          }}
        >
          Sample of {dataPath.split(".").pop()}
        </span> */}
      </div>
      <div className={baseStyles.expanderContent}>
        {availableItems.map((item, ix) => (
          <Fragment key={ix}>
            {/* {item.type === "object" ? (
              <ObjectEditor object={thisObject} />
            ) : ( */}
            <ItemInput dataPoint={`${dataPath}.${item.name}`} />
            {/* )} */}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

InternalObjectEditor.displayName = "InternalObjectEditor";
