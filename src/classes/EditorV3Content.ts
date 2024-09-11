import { cloneDeep, isEqual } from "lodash";
import { getCaretPosition } from "../functions/getCaretPosition";
import { readV3Html } from "../functions/readV3Html";
import { setCaretPosition } from "../functions/setCaretPosition";
import { EditorV3Line } from "./EditorV3Line";
import { EditorV3PositionClass } from "./EditorV3Position";
import { defaultContentProps } from "./defaultContentProps";
import {
  EditorV3Align,
  EditorV3DropListItem,
  EditorV3BlockClass,
  EditorV3ContentProps,
  EditorV3ContentPropsInput,
  EditorV3Position,
  EditorV3PositionF,
  EditorV3RenderProps,
  EditorV3Styles,
  IEditorV3,
  IEditorV3Line,
} from "./interface";
import { IMarkdownSettings } from "./defaultMarkdownSettings";
import { textBlockFactory } from "./textBlockFactory";

/**
 * Represents the content of an EditorV3 instance.
 */
export class EditorV3Content implements IEditorV3 {
  private _defaultContentProps = cloneDeep(defaultContentProps);
  // Standard attributes
  private _textAlignment: EditorV3Align = this._defaultContentProps.textAlignment;
  /**
   * Current text alignment
   */
  get textAlignment() {
    return this._textAlignment;
  }
  /**
   * Set text alignment
   * Can be left, center, right, or justify
   */
  set textAlignment(newTa: EditorV3Align) {
    if (newTa !== this._textAlignment) {
      this.lines.forEach((l) => (l.contentProps.textAlignment = newTa));
      this._textAlignment = newTa;
    }
  }

  private _decimalAlignPercent = this._defaultContentProps.decimalAlignPercent;
  /**
   * Current decimal alignment percent
   */
  get decimalAlignPercent() {
    return this._decimalAlignPercent;
  }
  set decimalAlignPercent(newDap: number) {
    if (newDap !== this._decimalAlignPercent) {
      this.lines.forEach((l) => (l.contentProps.decimalAlignPercent = newDap));
      this._decimalAlignPercent = newDap;
    }
  }

  private _styles: EditorV3Styles | undefined = this._defaultContentProps.styles;
  /**
   * Current available styles in the editor
   */
  get styles() {
    return this._styles;
  }
  set styles(newStyles: EditorV3Styles | undefined) {
    this._styles = newStyles;
  }

  private _allowMarkdown = this._defaultContentProps.allowMarkdown;
  get allowMarkdown() {
    return this._allowMarkdown;
  }
  set allowMarkdown(newAllow: boolean) {
    this._allowMarkdown = newAllow;
  }
  private _markdownSettings = this._defaultContentProps.markdownSettings;
  get markdownSettings() {
    return this._markdownSettings;
  }
  set markdownSettings(newSettings: IMarkdownSettings) {
    this._markdownSettings = newSettings;
    this.lines.forEach((l) => (l.contentProps.markdownSettings = newSettings));
  }
  private _showMarkdown = this._defaultContentProps.showMarkdown;
  get showMarkdown() {
    return this._showMarkdown;
  }
  set showMarkdown(newShow: boolean) {
    this._showMarkdown = newShow;
  }
  private _allowWindowView = this._defaultContentProps.allowWindowView;
  get allowWindowView() {
    return this._allowWindowView;
  }
  set allowWindowView(newAllow: boolean) {
    this._allowWindowView = newAllow;
  }
  private _atListFunction:
    | ((typedString: string) => Promise<EditorV3DropListItem<Record<string, string>>[]>)
    | undefined;
  get atListFunction() {
    return this._atListFunction;
  }
  private _maxAtListLength = this._defaultContentProps.maxAtListLength;
  get maxAtListLength() {
    return this._maxAtListLength;
  }

  /**
   * Current lines in the editor
   */
  public lines: EditorV3Line[] = [];
  private _allowNewLine = this._defaultContentProps.allowNewLine;
  get allowNewLine() {
    return this._allowNewLine;
  }
  set allowNewLine(newAllow: boolean) {
    this._allowNewLine = newAllow;
  }
  get lineLengths() {
    return this.lines.map((l) => l.lineLength);
  }
  get wordPositions() {
    return this.lines.flatMap((l, ix) => l.wordPositions.map((w) => ({ ...w, line: ix })));
  }

  /**
   * Current caret position and lock status
   */
  private _caretPosition: EditorV3PositionClass | null = null;
  get caretPosition(): EditorV3Position | null {
    return this._caretPosition?.pos ?? null;
  }
  set caretPosition(posInput: EditorV3Position | null) {
    if (posInput === null) {
      this._caretPosition = null;
    } else if (this._caretPosition) {
      this._caretPosition.setCaret(posInput);
    } else {
      this._caretPosition = new EditorV3PositionClass(
        posInput.startLine,
        posInput.startChar,
        posInput.endLine,
        posInput.endChar,
        this.lineLengths,
        this.wordPositions,
      );
    }
  }
  get caretPositionF(): EditorV3PositionF | null {
    return this._caretPosition?.posF ?? null;
  }
  set caretPositionF(posInput: EditorV3PositionF | null) {
    if (posInput === null) {
      this._caretPosition = null;
    } else {
      this._caretPosition = new EditorV3PositionClass(
        posInput.initialLine,
        posInput.initialChar,
        posInput.focusLine,
        posInput.focusChar,
        this.lineLengths,
        this.wordPositions,
      );
    }
  }
  /**
   * Indicates if the current content can be updated with this selection
   * @param pos
   * @returns boolean
   */
  public isCaretLocked(pos = this._caretPosition): boolean {
    if (!pos || pos.isCollapsed) return false;
    const selectedBlocks = this.subLines(pos).flatMap((l) => l.textBlocks);
    return selectedBlocks.length > 1 && selectedBlocks.some((b) => b.isLocked);
  }
  private get _isLockable() {
    return this.lines.some((l) => l.textBlocks.some((tb) => tb.type === "at" && !tb.isLocked));
  }

  /**
   * Text from the element
   */
  get text(): string {
    return this.lines.map((l) => l.textBlocks.map((b) => b.text).join("")).join("\n");
  }

  /**
   * Current content properties
   */
  get contentProps(): EditorV3ContentProps {
    return {
      textAlignment: this._textAlignment,
      decimalAlignPercent: this._decimalAlignPercent,
      styles: this._styles,
      allowNewLine: this._allowNewLine,
      allowWindowView: this._allowWindowView,
      showMarkdown: this._showMarkdown,
      markdownSettings: this._markdownSettings,
      allowMarkdown: this._allowMarkdown,
      atListFunction: this.atListFunction,
      maxAtListLength: this._maxAtListLength,
    };
  }

  /**
   * Data representation of content
   */
  get data(): IEditorV3 {
    const contentProps = cloneDeep(this.contentProps);
    Object.keys(defaultContentProps).forEach((k) => {
      const key = k as keyof typeof defaultContentProps;
      if (typeof this[key] === "function") {
        delete contentProps[key];
      }
      if (isEqual(this[key], this._defaultContentProps[key])) {
        delete contentProps[key];
      }
    });
    const lines = this.lines.map((l) => ({
      textBlocks: l.textBlocks.map((tb) => tb.data),
    }));
    return Object.keys(contentProps).length === 0 ? { lines } : { contentProps, lines };
  }

  /**
   * Create a new EditorV3Content instance for this object
   * @returns HTMLDivElement with content properties
   */
  private _contentPropsNode(): HTMLDivElement {
    const cpn = document.createElement("div");
    cpn.className = "aiev3-contents-info";
    Object.keys(this.data.contentProps ?? {})
      .sort((a, b) => a.localeCompare(b))
      .forEach((k) => {
        const key = k as keyof typeof defaultContentProps;
        cpn.dataset[key] = JSON.stringify(this[key]);
      });
    return cpn;
  }

  /**
   * Element to render
   */
  public toHtml(renderProps: EditorV3RenderProps): DocumentFragment {
    const ret = new DocumentFragment();
    // Add each line to the element
    this.lines.forEach((l) => ret.append(l.toHtml(renderProps)));
    // Add content properties node
    ret.append(this._contentPropsNode());
    if (renderProps.editableEl) renderProps.editableEl.append(ret);
    return ret;
  }

  /**
   * Render Markdown in an Fragment
   * @param markdownSettings Markdown settings, current settings by default
   * @returns Documentfragment with rendered markdown
   */
  public toMarkdownHtml(renderProps: EditorV3RenderProps): DocumentFragment {
    const ret = new DocumentFragment();
    // Add content to the element
    this.lines.forEach((l) => ret.append(l.toMarkdown(renderProps)));
    ret.append(this._contentPropsNode());
    if (renderProps.editableEl) renderProps.editableEl.append(ret);
    return ret;
  }

  /**
   * Create a new EditorV3Content instance
   * @param arg Stringified JSON or HTML/text
   * @param props Optional properties
   * @returns Instance of the object
   */
  constructor(arg?: string | HTMLDivElement | IEditorV3, props?: EditorV3ContentPropsInput) {
    // Process incoming data
    try {
      if (arg instanceof HTMLDivElement) {
        // Remove skip-read elements
        const skipRead = arg.querySelectorAll(".skip-read");
        skipRead.forEach((el) => el.remove());
        // Read in HTML
        const r = readV3Html(arg.innerHTML, props);
        this._copyImport(r);
        this.caretPositionF = getCaretPosition(arg);
      } else if (typeof arg === "string") {
        // Check for stringified class input
        const jsonInput: IEditorV3 = JSON.parse(arg);
        if (!Array.isArray(jsonInput.lines)) throw "No lines";
        this._copyImport(jsonInput, props);
      }
      // Interface input
      else if (arg !== undefined) {
        this._copyImport(arg, props);
      } else {
        this.lines = [new EditorV3Line()];
      }
    } catch (e) {
      // Establish input as string
      const inputString = (arg instanceof HTMLDivElement ? arg.outerHTML : arg) as string;
      // Read in v3 HTML/text
      const r = readV3Html(inputString, props);
      this._copyImport(r, props);
    }

    // Forced parameters
    if (props) {
      this._updateProps(props);
      this.lines.map((l) => (l.contentProps = this.contentProps));
    }
    if (this.lines.length === 0) {
      this.lines = [new EditorV3Line()];
    }
  }

  private _updateProps(props: EditorV3ContentPropsInput) {
    if (props.allowMarkdown !== undefined) this._allowMarkdown = props.allowMarkdown;
    if (props.allowNewLine !== undefined) this._allowNewLine = props.allowNewLine;
    if (props.allowWindowView !== undefined) this._allowWindowView = props.allowWindowView;
    if (props.decimalAlignPercent !== undefined)
      this._decimalAlignPercent = props.decimalAlignPercent;
    if (props.markdownSettings !== undefined) this._markdownSettings = props.markdownSettings;
    if (props.showMarkdown !== undefined) this._showMarkdown = props.showMarkdown;
    if (props.styles !== undefined) this._styles = props.styles;
    if (props.textAlignment !== undefined) this._textAlignment = props.textAlignment;
    if (props.atListFunction !== undefined) this._atListFunction = props.atListFunction;
    if (props.maxAtListLength !== undefined) this._maxAtListLength = props.maxAtListLength;
  }

  /* c8 ignore start */
  private _debugText(from: string): void {
    console.debug(
      from + "\n",
      this.lines.map((l) => l.textBlocks.map((tb) => tb.text).join("|")).join("\n"),
    );
  }
  /* c8 ignore end */

  private _copyImport(read: IEditorV3, props?: EditorV3ContentPropsInput): void {
    const consolidatedProps = { ...read.contentProps, ...props };
    this._updateProps(consolidatedProps);
    this.lines = read.lines.map((l) =>
      l instanceof EditorV3Line ? l : new EditorV3Line(l, consolidatedProps),
    );
  }

  /**
   * Loads a string into the content.  Will attempt to parse as JSON, then as HTML/text
   * @param arg string input
   */
  public loadString(arg: string) {
    try {
      // Check for stringified class input
      const jsonInput: IEditorV3 = JSON.parse(arg);
      if (!Array.isArray(jsonInput.lines)) throw "No lines";
      this._copyImport(jsonInput);
    } catch {
      // Read in v3 HTML/text
      const r = readV3Html(arg);
      this._copyImport(r);
    }
  }

  /**
   * Returns the content specified by a position
   * @param pos Position of the content to return
   * @returns Lines specified by the position
   */
  public subLines(pos: EditorV3Position): EditorV3Line[] {
    const ret: EditorV3Line[] = [];
    if (
      pos.startLine === pos.endLine &&
      pos.startChar === pos.endChar &&
      pos.startLine < this.lines.length
    ) {
      const style = this.lines[pos.startLine].getStyleAt(pos.startChar);
      ret.push(new EditorV3Line([textBlockFactory({ text: "", style })], this.contentProps));
    }
    // Check selection contains something
    if (
      pos.startLine < this.lines.length &&
      ((pos.startLine === pos.endLine && pos.startChar < pos.endChar) ||
        pos.startLine < pos.endLine)
    ) {
      // First line
      if (pos.startLine <= pos.endLine) {
        ret.push(
          new EditorV3Line(
            this.lines[pos.startLine].subBlocks(
              pos.startChar,
              pos.startLine === pos.endLine ? pos.endChar : undefined,
            ),
            this.contentProps,
          ),
        );
      }
      // At least one line between
      if (pos.startLine + 1 < pos.endLine) {
        ret.push(...this.lines.slice(pos.startLine + 1, pos.endLine));
      }
      // End line to end character
      if (pos.startLine < pos.endLine && pos.endLine < this.lines.length) {
        ret.push(new EditorV3Line(this.lines[pos.endLine].upToPos(pos.endChar), this.contentProps));
      }
    }
    return ret;
  }

  /**
   * Returns the content from the start to a position
   * @param endLine
   * @param endChar
   * @returns Lines up to the end position
   */
  public upToPos(endLine: number, endChar: number): EditorV3Line[] {
    return this.subLines({ startLine: 0, startChar: 0, endLine, endChar });
  }

  /**
   * Returns the content from a position to the end
   * @param startLine
   * @param startChar
   * @returns Lines from the start position to the end
   */
  public fromPos(startLine: number, startChar: number): EditorV3Line[] {
    return this.subLines({
      startLine,
      startChar,
      endLine: this.lines.length - 1,
      endChar: this.lines[this.lines.length - 1].lineLength,
    });
  }

  /**
   * Returns the current style at a position
   * @param line Line to check
   * @param character character number to check
   * @returns string Style name or undefined
   */
  public getStyleAt(line: number, character: number): string | undefined {
    return line < this.lines.length ? this.lines[line].getStyleAt(character) : undefined;
  }

  /**
   * Add a line break at the caret position, removes selection
   * @param pos Portion of content to replace with a new line
   * @returns Position at the start of the new line
   */
  public splitLine(pos: EditorV3Position): EditorV3Position {
    const u = this.upToPos(pos.startLine, pos.startChar);
    const f = this.fromPos(pos.endLine, pos.endChar);
    const newLines = [...u, ...f];
    this.lines = newLines;
    return {
      isCollapsed: true,
      startLine: pos.startLine + 1,
      startChar: 0,
      endLine: pos.startLine + 1,
      endChar: 0,
    };
  }

  /**
   * Merge line and the following line
   * @param line First line that will be merged
   */
  public mergeLines(line: number) {
    if (this.lines.length > line + 1) {
      this.lines[line].insertBlocks(this.lines[line + 1].textBlocks, this.lines[line].lineLength);
      this.lines.splice(line + 1, 1);
    }
  }

  /**
   * Delete a character or selection
   * @param backwards Delete direction
   * @param pos Optional caret position
   */
  public deleteCharacter(backwards: boolean, pos?: EditorV3Position) {
    // Update caret position
    if (pos) {
      this.caretPosition = pos;
    }
    // Check caret position exists
    if (this._caretPosition && this._caretPosition.isCollapsed) {
      // Extend selection one place backwards
      if (backwards) this._caretPosition?.moveLeft(true, false);
      // Extend selection one place forwards
      else this._caretPosition?.moveRight(true, false);
    }
    if (this._caretPosition) {
      this.splice(this._caretPosition.pos);
    }
  }

  /**
   * Find text within the content
   * @param text String to search for
   * @returns Array of positions or null if not found
   */
  public getTextPosition(text: string): EditorV3Position[] | null {
    const ret: EditorV3Position[] = [];
    this.lines.forEach((l, ix) => {
      l.textBlocks.forEach((tb) => {
        let pos = 0;
        while (tb.text.indexOf(text, pos) >= 0) {
          const found = tb.text.indexOf(text, pos);
          if (found >= 0) {
            ret.push({
              isCollapsed: false,
              startLine: ix,
              startChar: tb.lineStartPosition + found,
              endLine: ix,
              endChar: tb.lineStartPosition + found + text.length,
            });
            pos = found + text.length;
          }
        }
      });
    });
    return ret.length > 0 ? ret : null;
  }

  /**
   * Remove a selection and optionally insert new lines
   * @param pos Position of section to remove
   * @param newLines Line content to insert
   * @returns
   */
  public splice(pos: EditorV3Position, newLines?: EditorV3Line[]): EditorV3Line[] {
    // if (this._showMarkdown) {
    //   return this.spliceMarkdown(pos, newLines);
    // } else
    if (
      pos.startLine < this.lines.length &&
      pos.startLine <= pos.endLine &&
      !(pos.startLine === pos.endLine && pos.endChar < pos.startChar)
    ) {
      const ret: EditorV3Line[] = this.subLines(pos);
      const u = this.upToPos(pos.startLine, pos.startChar);
      const f = this.fromPos(pos.endLine, pos.endChar);
      this.lines = [
        ...u,
        ...(newLines ? newLines.map((l) => new EditorV3Line(l, this.contentProps)) : []),
        ...f,
      ];
      // Merge line after U
      this.mergeLines(pos.startLine);
      // Merge line after newLines if it exists and there is something after it
      newLines?.length && this.mergeLines(pos.startLine + newLines.length - 1);
      // Check all lines have at least 1 text block
      this.lines.forEach((l) => {
        if (l.textBlocks.length === 0) {
          l.textBlocks.push(textBlockFactory({ text: "", style: l.getStyleAt(0) }));
        }
      });
      // Calculate end character position
      const endChar =
        !newLines || newLines.length === 0
          ? pos.startChar
          : newLines?.length === 1
            ? pos.startChar + newLines[0].lineLength
            : newLines[newLines.length - 1].lineLength;
      // Update caret position if it is set
      if (this._caretPosition) {
        this._caretPosition = new EditorV3PositionClass(
          pos.startLine + (newLines ? newLines.length - 1 : 0),
          endChar,
          pos.startLine + (newLines ? newLines?.length - 1 : 0),
          endChar,
          this.lineLengths,
          this.wordPositions,
        );
      }
      return ret;
    }
    return [];
  }

  /**
   * Apply style to selection
   * @param styleName Style to apply
   * @param applyPos Position to apply style to, is missing caret position will be used
   * @returns self
   */
  public applyStyle(styleName: string, applyPos?: EditorV3Position) {
    if (applyPos || (this._caretPosition && !this._caretPosition.isCollapsed)) {
      const pos = applyPos ?? (this._caretPosition?.pos as EditorV3Position);
      if (pos.startLine < this.lines.length && pos.startLine <= pos.endLine) {
        for (let _i = pos.startLine; _i <= pos.endLine && _i < this.lines.length; _i++) {
          this.lines[_i].applyStyle(
            styleName,
            _i === pos.startLine ? pos.startChar : 0,
            _i === pos.endLine ? pos.endChar : Infinity,
          );
        }
        this.caretPosition = {
          startLine: pos.endLine,
          startChar: pos.endChar,
          endLine: pos.endLine,
          endChar: pos.endChar,
        };
      }
    }
    return this;
  }

  /**
   * Remove style from selection
   * @returns self
   */
  public removeStyle(removePos?: EditorV3Position) {
    if (removePos || (this._caretPosition && !this._caretPosition.isCollapsed)) {
      const pos = removePos ?? (this._caretPosition?.pos as EditorV3Position);
      if (pos.startLine < this.lines.length && pos.startLine <= pos.endLine) {
        for (let _i = pos.startLine; _i <= pos.endLine && _i < this.lines.length; _i++) {
          this.lines[_i].removeStyle(
            _i === pos.startLine ? pos.startChar : 0,
            _i === pos.endLine ? pos.endChar : Infinity,
          );
        }
        this.caretPosition = {
          startLine: pos.endLine,
          startChar: pos.endChar,
          endLine: pos.endLine,
          endChar: pos.endChar,
        };
      }
    }
    return this;
  }

  /**
   * Update target element with conntent and set caret position
   * @param editableEl DOM element to render inside
   */
  public redraw(editableEl: HTMLDivElement, focus: boolean) {
    // Set active block
    this._caretPosition &&
      this.lines[this._caretPosition.startLine].setActiveBlock(this._caretPosition);
    // Draw HTML
    editableEl.innerHTML = "";
    if (this._showMarkdown) {
      this.toMarkdownHtml({ editableEl, markdownSettings: this._markdownSettings });
    } else {
      this.toHtml({
        editableEl,
        atListFunction: this._atListFunction,
        maxAtListLength: this._maxAtListLength,
        caretPosition: this._caretPosition,
        styles: this._styles,
      });
    }
    // Set caret position
    if (focus && this._caretPosition) {
      setCaretPosition(editableEl, this._caretPosition);
    }
    // Remove window selection if not focused, but the current window selection is inside the editableEl's parent
    if (
      !focus &&
      window.getSelection()?.anchorNode instanceof HTMLElement &&
      (window.getSelection()?.anchorNode as HTMLElement).closest(".aiev3")?.contains(editableEl)
    ) {
      window.getSelection()?.removeAllRanges();
    }
  }

  /**
   * Check status of content, e.g. after a mouseUp event
   */
  public checkStatus() {
    // Set active block
    const activeBlock =
      this._caretPosition &&
      this._caretPosition.endChar < this.lines[this._caretPosition.endLine].lineLength &&
      this.lines[this._caretPosition.focusLine].setActiveBlock(this._caretPosition);
    // If active block is locked select all
    if (activeBlock && activeBlock.isLocked && this._caretPosition) {
      this.caretPosition = {
        startLine: this._caretPosition.focusLine,
        startChar: activeBlock.lineStartPosition,
        endLine: this._caretPosition.focusLine,
        endChar: activeBlock.lineEndPosition,
      };
    }
  }

  /**
   * Handle keydown event in the holding div
   * @param e Handle keydown event
   */
  public handleKeydown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Select all
    if (e.ctrlKey && e.code === "KeyA" && this.text !== "") {
      e.stopPropagation();
      e.preventDefault();
      this.caretPosition = {
        startLine: 0,
        startChar: 0,
        endLine: this.lines.length - 1,
        endChar: this.lines[this.lines.length - 1].lineLength,
      };
    }
    // Cursor movement
    else if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Backspace",
        "Delete",
        "Escape",
      ].includes(e.key) &&
      this._caretPosition
    ) {
      e.stopPropagation();
      e.preventDefault();
      switch (e.key) {
        case "ArrowLeft":
          this._caretPosition.moveLeft(e.shiftKey, e.ctrlKey);
          break;
        case "ArrowRight":
          this._caretPosition.moveRight(e.shiftKey, e.ctrlKey);
          break;
        case "ArrowUp":
          this._caretPosition.moveUp(e.shiftKey, e.ctrlKey);
          break;
        case "ArrowDown":
          this._caretPosition.moveDown(e.shiftKey, e.ctrlKey);
          break;
        case "Home":
          this._caretPosition.moveHome(e.shiftKey, e.ctrlKey);
          break;
        case "End":
          this._caretPosition.moveEnd(e.shiftKey, e.ctrlKey);
          break;
        case "Backspace":
          this.deleteCharacter(true);
          break;
        case "Delete":
          this.deleteCharacter(false);
          break;
        case "Escape":
          if (this._caretPosition && this._isLockable) {
            const lockBlock = this.lines[this._caretPosition.startLine].setActiveBlock(
              this._caretPosition,
            );
            if (lockBlock && lockBlock.type === "at") {
              lockBlock.setActive(false);
              lockBlock.isLocked = true;
            }
          }
      }
    }
    // Enter key cannot be used here
    else if (this._caretPosition && this.allowNewLine && e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
      this.caretPosition = this.splitLine(this._caretPosition);
    } else if (this._caretPosition) {
      this._caretPosition.lastAction = "keydown";
    }
  }

  /**
   * Handle keyup event in the holding div
   * @param e Handle keyup event
   */
  public handleKeyup(e: React.KeyboardEvent<HTMLDivElement>) {
    // Update caret position
    if (this._caretPosition) {
      this.caretPositionF = getCaretPosition(e.currentTarget);
    }
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
        "Escape",
      ].includes(e.code) ||
      (e.ctrlKey && e.code === "KeyA")
    ) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  /**
   * Handle copy and cut inside the holding div
   * @param e Copy or cut event
   */
  public handleCopy = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (this._caretPosition) {
      const toClipboard = this.subLines(this._caretPosition);
      e.clipboardData.setData("text/plain", toClipboard.map((l) => l.lineText).join("\n"));
      e.clipboardData.setData("text/html", toClipboard.map((l) => l.toHtml({}).outerHTML).join(""));
      e.clipboardData.setData("data/aiev3", JSON.stringify(toClipboard.map((l) => l.data)));
      if (e.type === "cut" && !this.isCaretLocked()) {
        this.splice(this._caretPosition);
      }
    }
  };

  /**
   * Handle paste inside the holding div
   * @param e Paste event
   */
  public handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    // Check cursor is present, and is does not contain a locked block
    if (this._caretPosition && !this.isCaretLocked()) {
      // Get clipboard data
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
      ) as IEditorV3Line[];
      // Just text blocks if only one line is allowed
      if (linesImport.length > 1 && !this.allowNewLine) {
        const textBlocks: EditorV3BlockClass[] = linesImport
          .flatMap((l) => l.textBlocks)
          .map((tb) => textBlockFactory(tb));
        lines.push(new EditorV3Line(textBlocks, this.contentProps));
      } else {
        lines.push(...linesImport.map((l) => new EditorV3Line(l, this.contentProps)));
      }
      // Splice in new data and set new content
      this.splice(this._caretPosition, lines);
    }
  }
}
