import { ContextMenuHandler, MenuItem } from "@asup/context-menu";
import { cloneDeep, isEqual } from "lodash";
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorV3Content, defaultContentProps } from "../classes/EditorV3Content";
import { EditorV3Line } from "../classes/EditorV3Line";
import { EditorV3TextBlock } from "../classes/EditorV3TextBlock";
import { EditorV3Align, EditorV3LineImport, EditorV3Styles } from "../classes/interface";
import { IMarkdownSettings } from "../classes/markdown/MarkdownSettings";
import { applyStylesToHTML } from "../functions/applyStylesToHTML";
import { useDebounceStack } from "../hooks/useDebounceStack";
import "./EditorV3.css";

interface EditorV3Props {
  id: string;
  input: string;
  editable?: boolean;
  setHtml?: (ret: string) => void;
  setText?: (ret: string) => void;
  setJson?: (ret: string) => void;
  customStyleMap?: EditorV3Styles;
  allowNewLine?: boolean;
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  style?: CSSProperties;
  resize?: boolean;
  spellCheck?: boolean;
  styleOnContextMenu?: boolean;
  allowMarkdown?: boolean;
  markdownSettings?: IMarkdownSettings;
}

export const EditorV3 = ({
  id,
  input,
  editable = true,
  setText,
  setHtml,
  setJson,
  style,
  allowMarkdown = cloneDeep(defaultContentProps.allowMarkdown),
  allowNewLine = cloneDeep(defaultContentProps.allowNewLine),
  decimalAlignPercent = cloneDeep(defaultContentProps.decimalAlignPercent),
  markdownSettings = cloneDeep(defaultContentProps.markdownSettings),
  customStyleMap,
  textAlignment = cloneDeep(defaultContentProps.textAlignment),
  resize = false,
  spellCheck = false,
  styleOnContextMenu = true,
  ...rest
}: EditorV3Props): JSX.Element => {
  // Set up reference to inner div
  const divRef = useRef<HTMLDivElement | null>(null);
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
  const [inputDecode, setInputDecode] = useState<EditorV3Content>(
    new EditorV3Content(input, {
      textAlignment,
      decimalAlignPercent,
      styles: customStyleMap,
      showMarkdown: false,
      markdownSettings,
      allowMarkdown,
      allowNewLine,
    }),
  );

  const contentProps = useMemo(() => {
    return {
      allowMarkdown,
      allowNewLine,
      decimalAlignPercent,
      styles: customStyleMap,
      markdownSettings,
      showMarkdown,
      textAlignment,
    };
  }, [
    allowMarkdown,
    allowNewLine,
    customStyleMap,
    decimalAlignPercent,
    markdownSettings,
    showMarkdown,
    textAlignment,
  ]);

  // General return function
  const returnData = useCallback(
    (ret: EditorV3Content) => {
      // Redraw dummay for information
      const dummyNode = document.createElement("div");
      ret.redraw(dummyNode);
      const html = dummyNode.innerHTML ?? "";
      const text = ret.text;
      const json = ret.jsonString;
      if (text !== input && html !== input && json !== input) {
        setText && setText(text);
        setHtml && setHtml(html);
        setJson && setJson(json);
      }
      dummyNode.remove();
    },
    [input, setHtml, setJson, setText],
  );

  // Redraw element, used in debounced stack as onChange callback
  const redrawElement = useCallback((ret: EditorV3Content) => {
    divRef.current && ret.redraw(divRef.current);
  }, []);
  // Create debounce stack
  const {
    currentValue: content,
    setCurrentValue: setContent,
    undo,
    redo,
    forceUpdate: forceReturn,
  } = useDebounceStack<EditorV3Content>(
    inputDecode,
    setInputDecode,
    null,
    redrawElement,
    returnData,
  );

  // Update any content properry from parent
  useEffect(() => {
    if (divRef.current && content && !isEqual(content.contentProps, contentProps)) {
      const newContent = new EditorV3Content(divRef.current, contentProps);
      setContent(newContent);
    }
  });

  // Update input from parent, need to track the last string input separately from the debounce stack
  const [lastInput, setLastInput] = useState<string>(input);
  useEffect(() => {
    if (content && input !== lastInput) {
      const newContent = new EditorV3Content(input, contentProps);
      setContent(newContent);
      setLastInput(input);
    }
  }, [content, contentProps, input, lastInput, redrawElement, setContent]);

  // Set up menu items
  const menuItems = useMemo((): MenuItem[] => {
    if (content) {
      const styleMenuItem: MenuItem = {
        label: "Style",
        disabled: content.showMarkdown,
        group: [
          ...(content.styles && Object.keys(content.styles).length > 0
            ? Object.keys(content.styles ?? {}).map((s) => {
                return {
                  label: s,
                  disabled: content.showMarkdown,
                  action: () => {
                    if (divRef.current) {
                      const newContent = new EditorV3Content(divRef.current, contentProps);
                      newContent.applyStyle(s);
                      setContent(newContent);
                    }
                  },
                };
              })
            : [{ label: "No styles defined", disabled: true }]),
          {
            label: "Remove style",
            disabled: content.showMarkdown,
            action: () => {
              if (divRef.current) {
                const newContent = new EditorV3Content(divRef.current, contentProps);
                newContent.removeStyle();
                setContent(newContent);
              }
            },
          },
        ],
      };
      const showMarkdownMenu = !allowMarkdown
        ? []
        : [
            {
              label: `${content.showMarkdown ? "Hide" : "Show"} markdown`,
              action: () => {
                setShowMarkdown(!content.showMarkdown);
              },
            },
          ];
      return [styleMenuItem, ...showMarkdownMenu];
    }
    return [];
  }, [allowMarkdown, content, contentProps, setContent]);

  // Work out backgroup colour and border
  const [inFocus, setInFocus] = useState<boolean>(false);
  const handleFocus = useCallback(() => {
    if (divRef.current && content) {
      setInFocus(true);
    }
  }, [content]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (divRef.current && content && !content.showMarkdown) {
        // Handle undo/redo
        if (e.ctrlKey && e.code === "KeyZ") {
          e.stopPropagation();
          e.preventDefault();
          undo();
        } else if (e.ctrlKey && e.code === "KeyY") {
          e.stopPropagation();
          e.preventDefault();
          redo();
        } else {
          // Get current information and update content buffer
          const newContent = new EditorV3Content(divRef.current, contentProps);
          newContent.handleKeydown(e);
          setContent(newContent);
        }
      }
    },
    [content, contentProps, redo, setContent, undo],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Markdown editing should not be handled
      if (content && !content.showMarkdown) {
        // Stop handled keys
        if (
          [
            "Enter",
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
          ].includes(e.code) ||
          (["KeyA", "KeyY", "KeyZ"].includes(e.code) && e.ctrlKey)
        ) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        // Always set new content value
        else if (divRef.current) {
          e.preventDefault();
          e.stopPropagation();
          const newContent = new EditorV3Content(divRef.current, contentProps);
          setContent(newContent);
        }
      }
    },
    [content, contentProps, setContent],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (divRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const newContent = new EditorV3Content(divRef.current, contentProps);
        setContent(newContent);
      }
    },
    [contentProps, setContent],
  );

  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (content && !content.showMarkdown && divRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const newContent = new EditorV3Content(divRef.current, contentProps);
        if (newContent.caretPosition) {
          const toClipboard = newContent.subLines(newContent.caretPosition);
          e.clipboardData.setData("text/plain", toClipboard.map((l) => l.lineText).join("\n"));
          e.clipboardData.setData(
            "text/html",
            toClipboard
              .map((l) => applyStylesToHTML(l.toHtml(), content.styles).outerHTML)
              .join(""),
          );
          e.clipboardData.setData("data/aiev3", JSON.stringify(toClipboard.map((l) => l.data)));
          if (e.type === "cut") {
            newContent.splice(newContent.caretPosition);
            setContent(newContent);
          }
        }
      }
    },
    [content, contentProps, setContent],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (divRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const newContent = new EditorV3Content(divRef.current, contentProps);
        if (newContent.caretPosition) {
          const lines: EditorV3Line[] = [];
          const linesImport = (
            e.clipboardData.getData("data/aiev3") !== ""
              ? JSON.parse(e.clipboardData.getData("data/aiev3"))
              : e.clipboardData
                  .getData("text/plain")
                  .split("\n")
                  .map((t) => ({
                    textBlocks: [{ text: t }],
                  }))
          ) as EditorV3LineImport[];
          // Just text blocks if only one line is allowed
          if (linesImport.length > 1 && !allowNewLine) {
            const textBlocks: EditorV3TextBlock[] = linesImport
              .flatMap((l) => l.textBlocks)
              .map((tb) => new EditorV3TextBlock(tb));
            lines.push(new EditorV3Line(textBlocks, contentProps));
          } else {
            lines.push(
              ...linesImport.map((l) => new EditorV3Line(JSON.stringify(l), contentProps)),
            );
          }
          // Splice in new data and set new content
          newContent.splice(newContent.caretPosition, lines);
          setContent(newContent);
        }
      }
    },
    [allowNewLine, contentProps, setContent],
  );

  const handleBlur = useCallback(() => {
    setInFocus(false);
    forceReturn();
  }, [forceReturn]);

  const styleRecalc = useMemo(() => {
    const s = { ...style };
    // Remove padding/border width
    if (s.width) {
      s.width = `calc(${s.width} - 10px)`;
    }
    if (resize) {
      s.resize = "both";
      s.overflow = "auto";
    }
    return s;
  }, [resize, style]);

  return (
    <div
      {...rest}
      className={`aiev3${inFocus ? " editing" : ""}`}
      id={id}
      onFocusCapture={handleFocus}
      onBlur={handleBlur}
    >
      <ContextMenuHandler
        menuItems={menuItems}
        style={{ width: "100%", height: "100%" }}
        showLowMenu={spellCheck || !styleOnContextMenu}
      >
        <div
          className="aiev3-resize"
          style={styleRecalc}
        >
          <div
            id={`${id}-editable`}
            className={`aiev3-editing ${allowNewLine ? "multiline" : "singleline"}`}
            contentEditable={
              editable &&
              (typeof setHtml === "function" ||
                typeof setJson === "function" ||
                typeof setText === "function")
            }
            suppressContentEditableWarning
            role={
              editable &&
              (typeof setHtml === "function" ||
                typeof setJson === "function" ||
                typeof setText === "function")
                ? "textbox"
                : undefined
            }
            spellCheck={spellCheck}
            ref={divRef}
            onBlurCapture={handleBlur}
            onCopyCapture={handleCopy}
            onCutCapture={handleCopy}
            onFocusCapture={handleFocus}
            onKeyDownCapture={handleKeyDown}
            onKeyUpCapture={handleKeyUp}
            onMouseUpCapture={handleMouseUp}
            onPasteCapture={handlePaste}
          />
        </div>
      </ContextMenuHandler>
    </div>
  );
};

EditorV3.displayName = "AsupEditorV3";
