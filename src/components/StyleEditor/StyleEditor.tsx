import { useContext } from "react";
import { StyleItemInput } from "./StyleItemInput";
import { StylesContext } from "./StylesContext";

interface StyleEditorProps {
  dataPath: string;
}

export const StyleEditor = ({ dataPath }: StyleEditorProps) => {
  const styleContext = useContext(StylesContext);
  const availableStyleItems = styleContext.availableStyleItems;

  return (
    <>
      {availableStyleItems.map((item, ix) => (
        <StyleItemInput
          dataPoint={`${dataPath}.${item.name}`}
          key={ix}
        />
      ))}
    </>
  );
};

StyleEditor.displayName = "StyleEditor";
