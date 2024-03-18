import { ContextMenuHandler, MenuItem } from "@asup/context-menu";
import { cloneDeep, isEqual } from "lodash";
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorV3Content } from "../classes/EditorV3Content";
import { defaultContentProps } from "../classes/defaultContentProps";
import { EditorV3Align, EditorV3Position, EditorV3Styles } from "../classes/interface";
import { IMarkdownSettings } from "../classes/markdown/MarkdownSettings";
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
  debounceMilliseconds?: number | null;
  atListFunction?: (at: string) => Promise<string[]>;
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
  debounceMilliseconds = null,
  atListFunction,
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
      atListFunction,
    };
  }, [
    allowMarkdown,
    allowNewLine,
    customStyleMap,
    decimalAlignPercent,
    markdownSettings,
    showMarkdown,
    textAlignment,
    atListFunction,
  ]);

  // General return function
  const [lastInput, setLastInput] = useState<string>(input);
  const [lastCaretPosition, setLastCaretPosition] = useState<EditorV3Position | null>(null);
  const [lastTextSent, setLastTextSent] = useState<string>(input);
  const [lastHtmlSent, setLastHtmlSent] = useState<string>(input);
  const [lastJsonSent, setLastJsonSent] = useState<string>(input);
  const returnData = useCallback(
    (ret: EditorV3Content) => {
      // Save caret position
      setLastCaretPosition(ret.caretPosition);
      // Redraw dummy for information
      const dummyNode = document.createElement("div");
      ret.redraw(dummyNode);
      const text = ret.text;
      if (setText && text !== lastTextSent) {
        setText(text);
        setLastTextSent(text);
      }
      const html = dummyNode.innerHTML ?? "";
      if (setHtml && html !== lastHtmlSent) {
        setHtml(html);
        setLastHtmlSent(html);
      }
      const json = ret.jsonString;
      if (setJson && json !== lastJsonSent) {
        setJson(json);
        setLastJsonSent(json);
      }
      dummyNode.remove();
    },
    [lastHtmlSent, lastJsonSent, lastTextSent, setHtml, setJson, setText],
  );

  // Redraw element, used in debounced stack as onChange callback
  const redrawElement = useCallback((ret: EditorV3Content) => {
    divRef.current && ret.redraw(divRef.current);
  }, []);
  // Create debounce stack
  const {
    currentValue: content,
    setCurrentValue,
    undo,
    redo,
    forceUpdate: forceReturn,
  } = useDebounceStack<EditorV3Content>(
    inputDecode,
    setInputDecode,
    debounceMilliseconds,
    redrawElement,
    returnData,
    (oldValue, newValue) => isEqual(oldValue?.data ?? {}, newValue?.data ?? {}),
  );
  // Utility callback for debugging
  const setContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (newContent: EditorV3Content, calledFrom: string) => {
      setCurrentValue(newContent);
    },
    [setCurrentValue],
  );

  // Update any content properry from parent
  useEffect(() => {
    if (divRef.current && content && !isEqual(content.contentProps, contentProps)) {
      const newContent = new EditorV3Content(divRef.current, contentProps);
      setContent(newContent, "Update content props from parent");
    }
  });

  // Update input from parent, need to track the last string input separately from the debounce stack
  useEffect(() => {
    if (content && input !== lastInput) {
      const newContent = new EditorV3Content(input, contentProps);
      // Lock any at-blocks here, focus must have been lost
      newContent.lines.forEach((l) => {
        l.textBlocks.forEach((tb) => {
          if (tb.type === "at") {
            tb.isLocked = true;
          }
        });
      });
      setContent(newContent, "Update input from parent");
      newContent.caretPosition = lastCaretPosition;
      setLastInput(input);
    }
  }, [content, contentProps, input, lastCaretPosition, lastInput, redrawElement, setContent]);

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
                      setContent(newContent, "Apply style from menu");
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
                setContent(newContent, "Remove style from menu");
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
  // Focus and blur events are container not contenteditable level events!
  const [inFocus, setInFocus] = useState<boolean>(false);
  const handleFocus = useCallback(() => {
    if (divRef.current && content) {
      setInFocus(true);
      // Get current content
      const newContent = new EditorV3Content(divRef.current, contentProps);
      // Select everything
      newContent.caretPosition = {
        startLine: 0,
        startChar: 0,
        endLine: newContent.lines.length - 1,
        endChar: newContent.lines[newContent.lines.length - 1].lineLength,
        isCollapsed: false,
      };
      setContent(newContent, "Select all on focus");
    }
  }, [content, contentProps, setContent]);
  const handleBlur = useCallback(() => {
    setInFocus(false);
    forceReturn();
  }, [forceReturn]);

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
        } else if (
          !(
            // Ignore key down on metakeys
            ["Control", "Shift", "Alt"].includes(e.key)
          )
        ) {
          // Get current information and update content buffer
          const newContent = new EditorV3Content(divRef.current, contentProps);
          newContent.handleKeydown(e);
          setContent(newContent, `Handle key down: ${e.key}`);
        }
      }
    },
    [content, contentProps, redo, setContent, undo],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Markdown editing should not be handled
      if (divRef.current && content && !content.showMarkdown) {
        // Stop handled keys
        if (["KeyY", "KeyZ"].includes(e.code) && e.ctrlKey) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        // Always set new content value
        else if (
          !(
            // Ignore key up on metakeys
            ["Control", "Shift", "Alt"].includes(e.key)
          )
        ) {
          e.preventDefault();
          e.stopPropagation();
          const newContent = new EditorV3Content(divRef.current, contentProps);
          newContent.handleKeyup(e);
          setContent(newContent, `Handle key up: ${e.key}`);
        }
      }
    },
    [content, contentProps, setContent],
  );

  const handleMouseUp = useCallback(() => {
    // Ensure mouse up event stack is empty before resolving this event
    setTimeout(() => {
      if (divRef.current && inFocus) {
        const newContent = new EditorV3Content(divRef.current, contentProps);
        newContent.checkStatus();
        setContent(newContent, "Handle mouse up on timeout");
      }
    }, 0);
  }, [contentProps, inFocus, setContent]);

  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (divRef.current) {
        const newContent = new EditorV3Content(divRef.current, contentProps);
        newContent.handleCopy(e);
        setContent(newContent, "Handle copy");
      }
    },
    [contentProps, setContent],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (divRef.current) {
        const newContent = new EditorV3Content(divRef.current, contentProps);
        newContent.handlePaste(e);
        setContent(newContent, "Handle paste");
      }
    },
    [contentProps, setContent],
  );

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
      onMouseUp={handleMouseUp}
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
            onCopyCapture={handleCopy}
            onCutCapture={handleCopy}
            onKeyDownCapture={handleKeyDown}
            onKeyUpCapture={handleKeyUp}
            onPasteCapture={handlePaste}
          />
        </div>
      </ContextMenuHandler>
    </div>
  );
};

EditorV3.displayName = "AsupEditorV3";
