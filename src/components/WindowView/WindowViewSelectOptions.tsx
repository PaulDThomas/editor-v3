import { useEffect, useId, useState } from "react";
import { IEditorV3SelectBlockOptionalParams } from "../../classes/EditorV3SelectBlock";
import { EditorV3TextBlockType } from "../../classes/EditorV3TextBlock";
import { EditorV3DropListItem, EditorV3Styles, IEditorV3 } from "../../classes/interface";
import { joinV3intoBlock } from "../../functions/joinV3intoBlock";
import { splitV3intoLines } from "../../functions/splitV3intoLines";
import baseStyles from "../BaseInputs.module.css";
import { EditorV3 } from "../EditorV3";
import styles from "./WindowView.module.css";

export interface WindowViewSelectOptionsProps extends React.ComponentProps<"div"> {
  type?: EditorV3TextBlockType;
  options: IEditorV3SelectBlockOptionalParams;
  setOptions: (options: IEditorV3SelectBlockOptionalParams) => void;
  customSytleMap?: EditorV3Styles;
}

export const WindowViewSelectOptions = ({
  type,
  options,
  setOptions,
  customSytleMap,
}: WindowViewSelectOptionsProps): JSX.Element => {
  const selectOptionsId = useId();

  // Holder for available options
  const [input, setInput] = useState<IEditorV3>({ lines: [{ textBlocks: [{ text: "" }] }] });
  useEffect(() => {
    const translate: IEditorV3 = joinV3intoBlock(
      options.availableOptions && options.availableOptions.length > 0
        ? options.availableOptions.map((o) => ({
            lines: [{ textBlocks: [{ text: o.text, style: o.data?.style }] }],
          }))
        : [{ lines: [{ textBlocks: [{ text: "" }] }] }],
    );
    setInput(translate);
  }, [options.availableOptions]);

  // Validation text
  const [validationText, setValidationText] = useState<string>("");

  return (
    <div
      className={[styles.windowViewBlock, type !== "select" ? styles.noHeight : styles.height].join(
        " ",
      )}
    >
      {type !== "select" ? null : (
        <>
          <div
            className={baseStyles.holder}
            style={{ flexGrow: 1 }}
          >
            <label
              id={`label-available-${selectOptionsId}`}
              className={baseStyles.label}
              htmlFor={`available-${selectOptionsId}`}
            >
              Available options
            </label>
            <div className={baseStyles.editorHolder}>
              <EditorV3
                id={`available-${selectOptionsId}`}
                className={baseStyles.baseEditorV3}
                allowNewLine
                customStyleMap={customSytleMap}
                style={{ border: "none", height: "100%" }}
                input={input}
                setObject={(value) => {
                  const chkBlocks = value.lines.some((l) => l.textBlocks.length > 1);
                  const chkEmpty = value.lines.some(
                    (l) => l.textBlocks.map((tb) => tb.text.trim()).join("") === "",
                  );
                  if (chkBlocks) {
                    setValidationText("Each line must have only one style");
                  } else if (chkEmpty) {
                    setValidationText("Each line must have at least one character");
                  } else {
                    setValidationText("");
                    const newObject: EditorV3DropListItem<Record<string, string>>[] =
                      splitV3intoLines(value).map((l) => {
                        const ret: EditorV3DropListItem<Record<string, string>> = {
                          text: l.lines[0].textBlocks[0].text,
                          data: {},
                        };
                        if (l.lines[0].textBlocks[0].style) {
                          ret.data!.style = l.lines[0].textBlocks[0].style;
                        } else {
                          ret.data!.noStyle = "true";
                        }
                        return ret;
                      });
                    setOptions({ ...options, availableOptions: newObject });
                  }
                }}
              />
            </div>
            <div
              className={[
                styles.windowViewValidationText,
                validationText !== "" ? styles.height : styles.noHeight,
              ].join(" ")}
              style={{ maxHeight: "1.5em" }}
            >
              {validationText}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

WindowViewSelectOptions.displayName = "WindowViewBlockOptions";
