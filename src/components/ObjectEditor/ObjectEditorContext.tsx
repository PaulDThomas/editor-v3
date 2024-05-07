import { createContext } from "react";

export interface ObjectEditorItemOptions {
  name: string;
  type: "select" | "string" | "boolean" | "number" | "array";
  options?: { label: string; value: string | number | boolean | undefined }[];
  dataPath?: string;
  customRenderer?: (
    value: string | string[] | number | number[] | boolean | undefined | null,
  ) => JSX.Element;
}

interface ObjectEditorContextProps<T extends Record<string, unknown>> {
  object: T;
  setObject: React.Dispatch<React.SetStateAction<T>>;
  objectTemplate: ObjectEditorItemOptions[];
}

export const ObjectEditorContext = createContext<ObjectEditorContextProps<
  Record<string, unknown>
> | null>(null);

interface ObjectEditorContextProviderProps<T extends Record<string, unknown>>
  extends ObjectEditorContextProps<T> {
  children: React.ReactNode;
}

export const ObjectEditorContextProvider = <T extends Record<string, unknown>>({
  object,
  setObject,
  objectTemplate,
  children,
}: ObjectEditorContextProviderProps<T>) => {
  return (
    <ObjectEditorContext.Provider
      value={{
        object,
        setObject: setObject as React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
        objectTemplate,
      }}
    >
      {children}
    </ObjectEditorContext.Provider>
  );
};

ObjectEditorContextProvider.displayName = "ObjectEditorContextProvider";
