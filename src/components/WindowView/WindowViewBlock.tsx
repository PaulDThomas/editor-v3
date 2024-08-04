import { IEditorV3AtBlock } from "../../classes/EditorV3AtBlock";
import { IEditorV3SelectBlock } from "../../classes/EditorV3SelectBlock";
import { IEditorV3TextBlock } from "../../classes/EditorV3TextBlock";
import { EditorV3ContentPropsInput } from "../../classes/interface";
import styles from "./WindowView.module.css";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";
import { WindowViewBlockText } from "./WindowViewBlockText";
import { WindowViewBlockType } from "./WindowViewBlockType";
import { WindowViewSelectOptions } from "./WindowViewSelectOptions";

interface WindowViewBlockProps {
  contentProps: EditorV3ContentPropsInput;
  textBlock: IEditorV3AtBlock | IEditorV3TextBlock | IEditorV3SelectBlock;
  setTextBlock: (textBlock: IEditorV3AtBlock | IEditorV3TextBlock | IEditorV3SelectBlock) => void;
}

export const WindowViewBlock = ({
  contentProps,
  textBlock,
  setTextBlock,
}: WindowViewBlockProps) => {
  return (
    <>
      <div className={styles.windowViewBlock}>
        <WindowViewBlockType
          includeAt={contentProps.atListFunction !== undefined}
          type={textBlock.type ?? "text"}
          setType={(type) => setTextBlock({ ...textBlock, type })}
        />
        {contentProps?.styles && Object.keys(contentProps.styles).length > 0 && (
          <WindowViewBlockStyle
            styles={contentProps.styles}
            styleName={textBlock.style}
            setStyleName={(style) =>
              setTextBlock({ ...textBlock, style: style === "" ? undefined : style })
            }
          />
        )}
        <WindowViewBlockText
          label="Label"
          disabled={false}
          style={{ width: "200px" }}
          shrink
          text={textBlock.label}
          setText={(text) => setTextBlock({ ...textBlock, label: text === "" ? undefined : text })}
        />
        <WindowViewBlockText
          label="Text"
          style={{ width: "100%", maxWidth: "100%" }}
          grow
          disabled={
            textBlock.type === "at" ||
            (contentProps?.styles?.[textBlock.style ?? ""]?.isLocked ?? false)
          }
          text={textBlock.text}
          setText={(text) => {
            setTextBlock({ ...textBlock, text });
          }}
        />
      </div>

      <WindowViewSelectOptions
        type={textBlock.type ?? "text"}
        customSytleMap={contentProps.styles}
        options={{
          availableOptions: (textBlock as IEditorV3SelectBlock).availableOptions ?? [],
        }}
        setOptions={(options) =>
          setTextBlock({
            ...textBlock,
            availableOptions: options.availableOptions,
          })
        }
      />
    </>
  );
};

WindowViewBlock.displayName = "WindowViewBlock";
