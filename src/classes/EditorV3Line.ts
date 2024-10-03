import { cloneDeep, isEqual } from "lodash";
import { readV3DivElement } from "../functions/readV3DivElement";
import { EditorV3AtBlock } from "./EditorV3AtBlock";
import { EditorV3PositionClass } from "./EditorV3Position";
import { EditorV3SelectBlock } from "./EditorV3SelectBlock";
import { EditorV3TextBlock } from "./EditorV3TextBlock";
import { defaultContentProps } from "./defaultContentProps";
import { drawHtmlDecimalAlign } from "./drawHtmlDecimalAlign";
import {
  EditorV3Align,
  EditorV3BlockClass,
  EditorV3ContentProps,
  EditorV3ContentPropsInput,
  EditorV3Position,
  EditorV3RenderProps,
  EditorV3Styles,
  EditorV3WordPosition,
  IEditorV3Line,
} from "./interface";
import { textBlockFactory } from "./textBlockFactory";

export class EditorV3Line implements IEditorV3Line {
  public textBlocks: EditorV3BlockClass[];
  private _defaultContentProps: EditorV3ContentProps = cloneDeep(defaultContentProps);
  public contentProps: EditorV3ContentProps;

  // #region Renderers
  /**
   * Render current line as HTML
   * @param renderProps Current render properties
   * @returns
   */
  public toHtml(renderProps: EditorV3RenderProps): HTMLDivElement {
    const h = document.createElement("div");
    this._setBlockStartPositions();
    renderProps.currentEl = h;
    h.className = `aiev3-line ${this.contentProps.textAlignment}`;
    if (this.contentProps.textAlignment === EditorV3Align.decimal) {
      const decimalPosition = this.lineText.match(/\./)?.index ?? Infinity;
      const upTo = this.upToPos(decimalPosition, true);
      const from = this.fromPos(decimalPosition, true);
      drawHtmlDecimalAlign(renderProps, this.contentProps, upTo, from);
    } else {
      this.textBlocks.forEach((tb) =>
        h.append(
          tb.toHtml(renderProps, tb.style ? this.contentProps.styles?.[tb.style] : undefined),
        ),
      );
    }
    // Need to add a space to the end of the line to allow for the cursor to be placed at the end
    if (
      this.textBlocks.length > 0 &&
      this.textBlocks[this.textBlocks.length - 1].isLocked &&
      this.contentProps.textAlignment !== EditorV3Align.decimal
    ) {
      const endLineEl = document.createElement("span");
      endLineEl.textContent = "\u200b";
      h.append(endLineEl);
    }
    if (renderProps.editableEl) renderProps.editableEl.append(h);
    return h;
  }

  /**
   * Get a markdown DocumentFragment for the line
   * @param markdownSettings Settings for the markdown string
   * @returns The markdown for the line
   */
  public toMarkdown(renderProps: EditorV3RenderProps): HTMLDivElement {
    const h = document.createElement("div");
    renderProps.currentEl = h;
    h.className = "aiev3-markdown-line";
    h.textContent = this.textBlocks
      .map((tb) =>
        tb.toMarkdown(renderProps.markdownSettings ?? this.contentProps.markdownSettings),
      )
      .join("");
    if (h.textContent === "") h.textContent = "\u2009";

    if (renderProps.editableEl) renderProps.editableEl.append(h);
    return h;
  }
  // #endregion Renderers

  // #region Getters
  /**
   * Get the line as a text string
   */
  get lineText(): string {
    return this.textBlocks.map((tb) => tb.text).join("");
  }

  /**
   * Get the markdown for the line
   */
  get lineMarkdown(): string {
    return this.textBlocks.map((tb) => tb.toMarkdown()).join("");
  }

  /**
   * Return position of each word in the lineText
   * @param checkText Text to check, if not provided uses this.lineText
   * @returns Array of word positions
   */
  get wordPositions(): EditorV3WordPosition[] {
    return this.textBlocks.flatMap((tb) => tb.wordPositions);
  }

  /**
   * Get the length of the line
   */
  get lineLength(): number {
    return this.lineText.length;
  }

  /**
   * Get the line as a JSON object
   */
  get data(): IEditorV3Line {
    const contentProps = cloneDeep(this.contentProps);
    Object.keys(defaultContentProps).forEach((k) => {
      const key = k as keyof typeof defaultContentProps;
      if (isEqual(this.contentProps[key], this._defaultContentProps[key])) {
        delete contentProps[key];
      }
    });
    const textBlocks = this.textBlocks.map((tb) => tb.data);
    return Object.keys(contentProps).length === 0 ? { textBlocks } : { contentProps, textBlocks };
  }
  // #endregion Getters

  // #region Constructors
  // Constructor
  constructor(
    arg?: IEditorV3Line | HTMLDivElement | EditorV3BlockClass[] | string,
    contentProps?: EditorV3ContentPropsInput,
  ) {
    // Set defaults
    this.textBlocks = [];
    this.contentProps = cloneDeep(this._defaultContentProps);

    // Markdown HTMLDivElement
    if (arg instanceof HTMLDivElement && arg.classList.contains("aiev3-markdown-line")) {
      this.contentProps = {
        ...contentProps,
        ...this._defaultContentProps,
      };
      this.fromMarkdown(arg.textContent ?? "");
    }
    // Standard HTMLDivElement
    else if (arg instanceof HTMLDivElement) {
      const ret = readV3DivElement(arg);
      this.textBlocks = ret.textBlocks;
      this.contentProps.textAlignment = ret.textAlignment;
      this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
      // Only need to merge after HMTL read?
      this._mergeBlocks();
    }
    // Markdown text
    else if (typeof arg === "string") {
      this.contentProps = {
        ...contentProps,
        ...this._defaultContentProps,
      };
      this.fromMarkdown(arg);
    }
    // Block array
    else if (Array.isArray(arg)) {
      this.textBlocks = arg;
    }
    // JSON object/undefined
    else {
      this.textBlocks = arg?.textBlocks.map((tb) => textBlockFactory(tb)) ?? [
        new EditorV3TextBlock(),
      ];
      this.contentProps = { ...this.contentProps, ...arg?.contentProps };
    }

    // Always take these if provided
    if (contentProps) this.contentProps = { ...this._defaultContentProps, ...contentProps };

    // Fix any problems
    this._lockTextBlocksByStyle();
    this._setBlockStartPositions();
  }

  /**
   * Read markdown string
   * @param markdown Markdown string to read
   * @param markdownSettings Settings for the markdown string
   */
  private fromMarkdown(markdown: string) {
    if (this.contentProps.markdownSettings) {
      let remainingMarkdown = markdown.replace(/\u2009/g, "");
      let safety = 0;
      while (remainingMarkdown.length > 0 && safety < 100) {
        safety++;
        // Start of complete select block
        if (
          remainingMarkdown.startsWith(this.contentProps.markdownSettings.dropDownStartTag) &&
          remainingMarkdown.indexOf(this.contentProps.markdownSettings.dropDownSelectedValueTag) >
            -1 &&
          remainingMarkdown.indexOf(this.contentProps.markdownSettings.dropDownEndTag) > -1
        ) {
          const blockEnd = remainingMarkdown.indexOf(
            this.contentProps.markdownSettings.dropDownEndTag,
          );
          this.textBlocks.push(
            new EditorV3SelectBlock(
              remainingMarkdown.slice(
                0,
                blockEnd + this.contentProps.markdownSettings.dropDownEndTag.length,
              ),
              { markdownSettings: this.contentProps.markdownSettings },
            ),
          );
          remainingMarkdown = remainingMarkdown.slice(
            blockEnd + this.contentProps.markdownSettings.dropDownEndTag.length,
          );
        }
        // Start of complete at block
        else if (
          remainingMarkdown.startsWith(this.contentProps.markdownSettings.atStartTag) &&
          remainingMarkdown.indexOf(this.contentProps.markdownSettings.atEndTag) > -1
        ) {
          const blockEnd = remainingMarkdown.indexOf(this.contentProps.markdownSettings.atEndTag);
          this.textBlocks.push(
            new EditorV3AtBlock(
              remainingMarkdown.slice(
                0,
                blockEnd + this.contentProps.markdownSettings.atEndTag.length,
              ),
              { markdownSettings: this.contentProps.markdownSettings },
            ),
          );
          remainingMarkdown = remainingMarkdown.slice(
            blockEnd + this.contentProps.markdownSettings.atEndTag.length,
          );
        }
        // Start of complete style block
        else if (
          remainingMarkdown.startsWith(this.contentProps.markdownSettings.styleStartTag) &&
          remainingMarkdown.indexOf(this.contentProps.markdownSettings.styleEndTag) > -1
        ) {
          const blockEnd = remainingMarkdown.indexOf(
            this.contentProps.markdownSettings.styleEndTag,
          );
          this.textBlocks.push(
            new EditorV3TextBlock(
              remainingMarkdown.slice(
                0,
                blockEnd + this.contentProps.markdownSettings.styleEndTag.length,
              ),
              { markdownSettings: this.contentProps.markdownSettings },
            ),
          );
          remainingMarkdown = remainingMarkdown.slice(
            blockEnd + this.contentProps.markdownSettings.styleEndTag.length,
          );
        }
        // Text block until next tag
        else {
          const nextDropTag = remainingMarkdown
            .slice(1)
            .indexOf(this.contentProps.markdownSettings.dropDownStartTag);
          const nextAtTag = remainingMarkdown
            .slice(1)
            .indexOf(this.contentProps.markdownSettings.atStartTag);
          const nextStyleTag = remainingMarkdown
            .slice(1)
            .indexOf(this.contentProps.markdownSettings.styleStartTag);
          const blockEnd = Math.min(
            nextDropTag > -1 ? nextDropTag + 1 : Infinity,
            nextAtTag > -1 ? nextAtTag + 1 : Infinity,
            nextStyleTag > -1 ? nextStyleTag + 1 : Infinity,
            remainingMarkdown.length,
          );
          this.textBlocks.push(
            new EditorV3TextBlock(remainingMarkdown.slice(0, blockEnd), {
              markdownSettings: this.contentProps.markdownSettings,
            }),
          );
          remainingMarkdown = remainingMarkdown.slice(blockEnd);
        }
      }
    }
  }
  // #endregion Constructors

  // #region Get/Set block methods
  /**
   * Gets the block at a position
   * @param pos The position to get the block at
   * @returns The block at the position
   */
  public getBlockAt(pos: number): EditorV3BlockClass | undefined {
    return this.textBlocks.find((tb) => tb.lineStartPosition <= pos && tb.lineEndPosition > pos);
  }

  /**
   * Gets style at a line position
   * @param pos The position to get the style at
   * @returns The style at the position
   */
  public getStyleAt(pos: number): string | undefined {
    return this.getBlockAt(pos)?.style;
  }

  /**
   * Set one of the lines blocks to be active
   * @param pos Sets the active block at the position
   * @returns The active block
   */
  public setActiveBlock(
    pos: EditorV3Position | EditorV3PositionClass,
  ): EditorV3BlockClass | undefined {
    this.textBlocks.forEach((tb) => tb.setActive(false));
    const nextBlock = this.getBlockAt(pos.startChar);
    const lastBlock = this.getBlockAt(Math.max(0, pos.startChar - 1));
    if (lastBlock && lastBlock instanceof EditorV3AtBlock && pos.isCollapsed) {
      lastBlock.setActive(true);
      return lastBlock;
    } else if (nextBlock && nextBlock instanceof EditorV3SelectBlock) {
      nextBlock.showDropdown();
      return nextBlock;
    } else {
      nextBlock?.setActive(true);
      return nextBlock;
    }
  }
  // #endregion Get/Set block methods

  // #region Subset methods
  /**
   * Get the text blocks from a position to another
   * @param startPos Start position
   * @param endPosOpt End position, if not provided uses the end of the line
   * @param splitLocked Split locked blocks
   * @returns Text blocks from startPos to endPos
   */
  public subBlocks(
    startPos: number,
    endPosOpt?: number,
    splitLocked = false,
  ): EditorV3BlockClass[] {
    const ret: EditorV3BlockClass[] = [];
    const endPos = endPosOpt ?? this.lineLength + 1;
    // Return empty styled block for start/end same
    if (startPos >= endPos || endPos <= 0) {
      return ret;
    }
    for (let _i = 0; _i < this.textBlocks.length; _i++) {
      const block: EditorV3BlockClass = this.textBlocks[_i];
      // Block after start and before end
      if (startPos <= block.lineStartPosition && block.lineEndPosition < endPos) {
        ret.push(cloneDeep(block));
      }
      // Block containing startPos and is not locked/being split
      else if (
        block.lineStartPosition < startPos &&
        block.lineEndPosition > startPos &&
        (!block.isLocked || splitLocked)
      ) {
        const slicedBlock = textBlockFactory({
          ...block.data,
          // Split locked occurs on decimals, so lineStartPosition is needed
          lineStartPosition: splitLocked ? block.lineStartPosition : undefined,
          text: block.text.slice(
            startPos - block.lineStartPosition,
            endPos - block.lineStartPosition,
          ),
        });
        ret.push(slicedBlock);
      }
      // Block after start containing end
      else if (
        block.lineStartPosition >= startPos &&
        block.lineStartPosition < endPos &&
        block.lineEndPosition >= endPos
      ) {
        if (block.isLocked && !splitLocked) {
          ret.push(cloneDeep(block));
        } else {
          const slicedBlock = textBlockFactory({
            ...block,
            text: block.text.slice(0, endPos - block.lineStartPosition),
          });
          ret.push(slicedBlock);
        }
      }
      // Stop if the end is reached
      if (block.lineStartPosition >= endPos) break;
    }
    !splitLocked && this._setBlockStartPositions(ret, startPos);
    return ret;
  }

  /**
   * Get the text blocks from the start of the line to a position
   * @param pos Position to get blocks to
   * @param splitLocked Split locked blocks
   * @returns Blocks from start to pos
   */
  public upToPos(pos: number, splitLocked = false): EditorV3BlockClass[] {
    return this.subBlocks(0, pos, splitLocked);
  }

  /**
   * Get the text blocks from a position to the end of the line
   * @param pos Position to get blocks from
   * @param splitLocked Split locked blocks
   * @returns Blocks from pos to end
   */
  public fromPos(pos: number, splitLocked = false): EditorV3BlockClass[] {
    return this.subBlocks(pos, undefined, splitLocked);
  }
  // #endregion Subset methods

  // #region Insert and remove methods
  /**
   * Split the line into two
   * @param pos Position to split at
   * @returns The remainer of the line after the split
   */
  public splitLine(pos: number): EditorV3Line {
    if (pos >= this.lineLength) {
      return new EditorV3Line(undefined, this.contentProps);
    } else {
      const preSplit = this.upToPos(pos);
      const postSplit = this.fromPos(pos);
      this.textBlocks = preSplit.length > 0 ? preSplit : [new EditorV3TextBlock()];
      this._setBlockStartPositions();
      return new EditorV3Line(postSplit, this.contentProps);
    }
  }

  /**
   * Insert text blocks into the line
   * @param newTextBlocks Array of text blocks to insert
   * @param pos Position to insert at
   */
  public insertBlocks(newTextBlocks: EditorV3BlockClass[], pos: number) {
    const pre = this.upToPos(pos);
    const post = this.fromPos(pos);
    this.textBlocks = [...pre, ...newTextBlocks, ...post];
    this._mergeBlocks();
    this._setBlockStartPositions();
  }

  /**
   * Remove part of the line
   * @param startPos Start position to remove
   * @param endPos End position to remove (exclusive)
   * @returns self
   */
  public removeSection(startPos: number, endPos: number): EditorV3BlockClass[] {
    let ret: EditorV3BlockClass[] = [];
    if (startPos < endPos && startPos < this.lineLength) {
      const pre = this.upToPos(startPos);
      ret = this.subBlocks(startPos, endPos);
      const post = this.fromPos(endPos);
      this.textBlocks = [...pre, ...post];
      this._mergeBlocks();
      this._setBlockStartPositions();
    }
    return ret;
  }

  /**
   * Delete a character from the line
   * @param pos Character to remove
   * @returns self
   */
  public deleteCharacter(pos: number) {
    this.removeSection(pos, pos + 1);
    return this;
  }
  // #endregion Insert and remove methods

  // #region Update style methods
  /**
   * Apply a style to a section of the line
   * @param styleName Style to apply
   * @param startPos Start position to apply style
   * @param endPos End position to apply style (exclusive)
   * @returns self
   */
  public applyStyle(styleName: string, startPos: number, endPos: number) {
    if (startPos < endPos) {
      const upTo = this.upToPos(startPos);
      const mid = this.subBlocks(startPos, endPos).map((tb) => {
        tb.style = styleName;
        if (this.contentProps.styles?.[styleName]?.isLocked) tb.isLocked = true;
        return tb;
      });
      const from = this.fromPos(endPos);
      this.textBlocks = [...upTo, ...mid, ...from];
      this._mergeBlocks();
      this._setBlockStartPositions();
    }
    return this;
  }

  /**
   * Remove style from a section of the line
   * @param startPos Start position to remove style
   * @param endPos End position to remove style (exclusive)
   * @returns self
   */
  public removeStyle(startPos: number, endPos: number) {
    if (startPos < endPos) {
      this.textBlocks = [
        ...this.upToPos(startPos),
        ...this.subBlocks(startPos, endPos).map((tb) => {
          tb.style = undefined;
          return tb;
        }),
        ...this.fromPos(endPos),
      ];
      this._mergeBlocks();
      this._setBlockStartPositions();
    }
    return this;
  }
  // #endregion Update style methods

  // #region Private methods
  /**
   * Merge blocks with the same style, that are not locked
   */
  private _mergeBlocks() {
    if (new Set(this.textBlocks.map((tb) => tb.mergeKey)).size < this.textBlocks.length) {
      const mergedBlocks: EditorV3BlockClass[] = [];
      let lastTypeStyle: string | null = null;
      for (let _i = 0; _i < this.textBlocks.length; _i++) {
        if (this.textBlocks[_i].mergeKey === lastTypeStyle && mergedBlocks.length > 0) {
          mergedBlocks[mergedBlocks.length - 1] = textBlockFactory({
            ...mergedBlocks[mergedBlocks.length - 1].data,
            text: mergedBlocks[mergedBlocks.length - 1].text + this.textBlocks[_i].text,
          });
        } else {
          mergedBlocks.push(this.textBlocks[_i]);
          lastTypeStyle = this.textBlocks[_i].mergeKey;
        }
      }
      this.textBlocks = mergedBlocks.filter((tb) => tb.text !== "");
    }
  }

  /**
   * Lock textblocks where the style is locked
   */
  private _lockTextBlocksByStyle() {
    // Check for any locked styles
    const lockedStyles = Object.keys(this.contentProps.styles ?? []).filter(
      (k) => (this.contentProps.styles as EditorV3Styles)[k].isLocked,
    );
    lockedStyles.length > 0 &&
      this.textBlocks.forEach((tb) => {
        if (lockedStyles.includes(tb.style ?? "")) tb.isLocked = true;
      });
  }

  /**
   * Update blocks with their start position
   * @param blocks Blocks to check, if not provided uses this.textBlocks
   * @param initialPos Start position to use
   */
  private _setBlockStartPositions(blocks?: EditorV3BlockClass[], initialPos: number = 0) {
    let _linePos = initialPos;
    const tbs = blocks ?? this.textBlocks;
    tbs.forEach((tb) => {
      tb.lineStartPosition = _linePos;
      if (tb.lineEndPosition !== undefined) {
        _linePos = tb.lineEndPosition;
      }
    });
  }
  // #endregion Private methods
}
