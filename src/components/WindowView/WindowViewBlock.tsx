import { EditorV3AtBlock } from "../../classes/EditorV3AtBlock";
import { EditorV3SelectBlock } from "../../classes/EditorV3SelectBlock";
import { EditorV3TextBlock } from "../../classes/EditorV3TextBlock";
import { EditorV3ContentPropsInput } from "../../classes/interface";
import { textBlockFactory } from "../../classes/textBlockFactory";
import styles from "./WindowView.module.css";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";
import { WindowViewBlockText } from "./WindowViewBlockText";
import { WindowViewBlockType } from "./WindowViewBlockType";
import { WindowViewSelectOptions } from "./WindowViewSelectOptions";

interface WindowViewBlockProps {
  contentProps: EditorV3ContentPropsInput;
  textBlock: EditorV3AtBlock | EditorV3TextBlock | EditorV3SelectBlock;
  editable: boolean;
  setTextBlock: (textBlock: EditorV3AtBlock | EditorV3TextBlock | EditorV3SelectBlock) => void;
}

export const WindowViewBlock = ({
  contentProps,
  textBlock,
  editable,
  setTextBlock,
}: WindowViewBlockProps) => {
  return (
    <>
      <div className={styles.windowViewBlock}>
        <WindowViewBlockType
          includeAt={contentProps.atListFunction !== undefined}
          disabled={!editable}
          type={textBlock.type ?? "text"}
          setType={(type) => setTextBlock(textBlockFactory({ ...textBlock, type }))}
        />
        {contentProps?.styles && Object.keys(contentProps.styles).length > 0 && (
          <WindowViewBlockStyle
            styles={contentProps.styles}
            disabled={!editable}
            styleName={textBlock.style}
            setStyleName={(style) =>
              setTextBlock(
                textBlockFactory({ ...textBlock, style: style === "" ? undefined : style }),
              )
            }
          />
        )}
        <WindowViewBlockText
          label="Label"
          disabled={!editable}
          style={{ width: "200px" }}
          shrink
          text={textBlock.label}
          setText={(text) =>
            setTextBlock(textBlockFactory({ ...textBlock, label: text === "" ? undefined : text }))
          }
        />
        <WindowViewBlockText
          label="Text"
          style={{ width: "100%", maxWidth: "100%" }}
          grow
          disabled={
            !editable ||
            textBlock.type === "at" ||
            (contentProps?.styles?.[textBlock.style ?? ""]?.isLocked ?? false)
          }
          text={textBlock.text}
          setText={(text) => {
            setTextBlock(textBlockFactory({ ...textBlock, text }));
          }}
        />
      </div>

      <WindowViewSelectOptions
        type={textBlock.type ?? "text"}
        customSytleMap={contentProps.styles}
        editable={editable}
        options={{
          availableOptions: (textBlock as EditorV3SelectBlock).availableOptions ?? [],
        }}
        setOptions={(options) =>
          setTextBlock(
            textBlockFactory({
              ...textBlock,
              availableOptions: options.availableOptions,
            }),
          )
        }
      />
    </>
  );
};

WindowViewBlock.displayName = "WindowViewBlock";
