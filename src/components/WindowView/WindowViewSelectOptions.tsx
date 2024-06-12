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

  // Holder for selected option
  const [currentSelectedOption, setCurrentSelectedOption] = useState<string>(
    options.selectedOption ?? "",
  );
  useEffect(() => {
    setCurrentSelectedOption(options.selectedOption ?? "");
  }, [options.selectedOption]);

  // Holder for available options
  const [input, setInput] = useState<IEditorV3>(
    joinV3intoBlock(
      (options.availableOptions ?? []).map((o) => ({
        lines: [{ textBlocks: [{ text: o.text, style: o.data?.style }] }],
      })),
    ),
  );
  useEffect(() => {
    setInput(
      joinV3intoBlock(
        (options.availableOptions ?? []).map((o) => ({
          lines: [{ textBlocks: [{ text: o.text, style: o.data?.style }] }],
        })),
      ),
    );
  }, [options.availableOptions]);

  // Validation text
  const [validationText1, setValidationText1] = useState<string>("");
  const [validationText2, setValidationText2] = useState<string>("");

  return (
    <div
      className={[styles.windowViewBlock, type !== "select" ? styles.noHeight : styles.height].join(
        " ",
      )}
    >
      <div className={baseStyles.holder}>
        <label
          id={`label-${selectOptionsId}`}
          className={baseStyles.label}
          htmlFor={selectOptionsId}
        >
          Selected option
        </label>
        <input
          aria-labelledby={`label-${selectOptionsId}`}
          style={{ width: "calc(100% - 32px)" }}
          id={selectOptionsId}
          className={baseStyles.baseInput}
          value={currentSelectedOption}
          onChange={(e) => {
            setValidationText1(e.currentTarget.value === "" ? "Required" : "");
            setCurrentSelectedOption(e.currentTarget.value);
          }}
          onBlur={() => setOptions({ ...options, selectedOption: currentSelectedOption })}
        />
        <div
          className={[
            styles.windowViewValidationText,
            validationText1 !== "" ? styles.height : styles.noHeight,
          ].join(" ")}
          style={{ maxHeight: "1.5em" }}
        >
          {validationText1}
        </div>
      </div>
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
            style={{ border: "none" }}
            input={input}
            debounceMilliseconds={500}
            setObject={(value) => {
              const chkBlocks = value.lines.some((l) => l.textBlocks.length > 1);
              const chkEmpty = value.lines.some(
                (l) => l.textBlocks.map((tb) => tb.text.trim()).join("") === "",
              );
              if (chkBlocks) {
                setValidationText2("Each line must have only one style");
              } else if (chkEmpty) {
                setValidationText2("Each line must have at least one character");
              } else {
                setValidationText2("");
                const newObject: EditorV3DropListItem<Record<string, string>>[] = splitV3intoLines(
                  value,
                ).map((l) => {
                  const ret: EditorV3DropListItem<Record<string, string>> = {
                    text: l.lines[0].textBlocks[0].text,
                    data: {
                      text: l.lines[0].textBlocks[0].text,
                    },
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
            validationText2 !== "" ? styles.height : styles.noHeight,
          ].join(" ")}
          style={{ maxHeight: "1.5em" }}
        >
          {validationText2}
        </div>
      </div>
    </div>
  );
};

WindowViewSelectOptions.displayName = "WindowViewBlockOptions";
