import { cloneDeep, isEqual } from "lodash";
import { readV3DivElement } from "../functions/readV3DivElement";
import { readV3MarkdownElement } from "../functions/readV3MarkdownElement";
import { EditorV3PositionClass } from "./EditorV3Position";
import { EditorV3TextBlock, EditorV3TextBlockType } from "./EditorV3TextBlock";
import { defaultContentProps } from "./defaultContentProps";
import { drawHtmlDecimalAlign } from "./drawHtmlDecimalAlign";
import {
  EditorV3Align,
  EditorV3BlockClass,
  EditorV3ContentProps,
  EditorV3ContentPropsInput,
  EditorV3Position,
  EditorV3RenderProps,
  EditorV3WordPosition,
  IEditorV3Line,
} from "./interface";
import { IMarkdownSettings } from "./markdown/MarkdownSettings";
import { textBlockFactory } from "./textBlockFactory";

export class EditorV3Line implements IEditorV3Line {
  public textBlocks: EditorV3BlockClass[];
  private _defaultContentProps: EditorV3ContentProps = cloneDeep(defaultContentProps);
  public contentProps: EditorV3ContentProps;

  /**
   * Render current line as HTML
   * @param renderProps Current render properties
   * @returns
   */
  public toHtml(renderProps: EditorV3RenderProps): HTMLDivElement {
    const h = document.createElement("div");
    renderProps.currentEl = h;
    h.className = `aiev3-line ${this.contentProps.textAlignment}`;
    if (this.contentProps.textAlignment === EditorV3Align.decimal) {
      const decimalPosition = this.lineText.match(/\./)?.index ?? Infinity;
      drawHtmlDecimalAlign(
        renderProps,
        this.contentProps.decimalAlignPercent,
        this.upToPos(decimalPosition),
        this.fromPos(decimalPosition),
      );
    } else {
      this.textBlocks.forEach((tb) => h.append(tb.toHtml(renderProps)));
    }
    // Need to add a space to the end of the line to allow for the cursor to be placed at the end
    if (this.textBlocks.length > 0 && this.textBlocks[this.textBlocks.length - 1].isLocked) {
      const endBlockEl = textBlockFactory({ text: "" }).toHtml(renderProps);
      // endBlockEl.children[0].classList.add("");
      h.append(endBlockEl);
    }
    if (renderProps.editableEl) renderProps.editableEl.append(h);
    return h;
  }

  /**
   * Get the line as a text string
   */
  get lineText(): string {
    return this.textBlocks.map((tb) => tb.text).join("");
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
  get data() {
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

  /**
   * Get a markdown string for the line
   * @param markdownSettings Settings for the markdown string
   * @returns The markdown for the line
   */
  public toMarkdown(
    markdownSettings: IMarkdownSettings = this.contentProps.markdownSettings,
  ): string {
    return this.textBlocks.map((tb) => tb.toMarkdown(markdownSettings)).join("");
  }

  // Constructor
  constructor(
    arg?: IEditorV3Line | HTMLDivElement | EditorV3BlockClass[],
    contentProps?: EditorV3ContentPropsInput,
  ) {
    // Set defaults
    this.textBlocks = [];
    this.contentProps = cloneDeep(this._defaultContentProps);

    // Text
    // if (typeof arg === "string") {
    //   // Decimal html string
    //   if (arg.match(/^<div class="aiev3-line.*<\/div>$/)) {
    //     const h = document.createElement("template");
    //     h.innerHTML = arg;
    //     const d = h.content.children[0] as HTMLDivElement;
    //     const ret = readV3DivElement(d);
    //     this.textBlocks = ret.textBlocks;
    //     this.contentProps.textAlignment = ret.textAlignment;
    //     this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
    //   }
    //   // Markdown string
    //   else if (arg.match(/^<div class="aiev3-markdown-line.*<\/div>$/)) {
    //     const h = document.createElement("template");
    //     h.innerHTML = arg;
    //     const d = h.content.children[0] as HTMLDivElement;
    //     const ret = readV3MarkdownElement(d, this.contentProps);
    //     this.textBlocks = ret.textBlocks;
    //     this.contentProps.textAlignment = ret.textAlignment;
    //     this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
    //   }
    //   // V2 text
    //   else if (arg.match(/^<div classname="aie-text.*<\/div>$/)) {
    //     const h = document.createElement("template");
    //     h.innerHTML = arg;
    //     const d = h.content.children[0] as HTMLDivElement;
    //     const ret = readV2DivElement(d);
    //     this.textBlocks = ret.textBlocks;
    //     this.contentProps.textAlignment = ret.textAlignment;
    //     this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
    //   }
    //   // Standard or JSON text
    //   else {
    //     try {
    //       const jsonInput = JSON.parse(arg);
    //       if (jsonInput.textBlocks) {
    //         this.textBlocks = jsonInput.textBlocks.map((tb: string | EditorV3BlockClass) =>
    //           textBlockFactory(typeof tb === "string" ? { text: tb } : tb),
    //         );
    //       } else {
    //         throw "No blocks";
    //       }
    //       if (jsonInput.contentProps)
    //         this.contentProps = {
    //           ...this.contentProps,
    //           ...jsonInput.contentProps,
    //         };
    //     } catch {
    //       this.textBlocks = [textBlockFactory({ text: arg })];
    //     }
    //   }
    // } else

    // HTMLDivElement
    if (arg instanceof HTMLDivElement) {
      const ret = Array.from(arg.classList).includes("aiev3-line")
        ? readV3DivElement(arg)
        : readV3MarkdownElement(arg, this.contentProps);
      this.textBlocks = ret.textBlocks;
      this.contentProps.textAlignment = ret.textAlignment;
      this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
    } else if (Array.isArray(arg)) {
      this.textBlocks = arg;
    } else {
      this.textBlocks = arg?.textBlocks.map((tb) => textBlockFactory(tb)) ?? [
        new EditorV3TextBlock(),
      ];
      this.contentProps = { ...this.contentProps, ...arg?.contentProps };
    }

    // Always take these if provided
    if (contentProps) this.contentProps = { ...this._defaultContentProps, ...contentProps };

    // Fix any problems
    this._mergeBlocks();
  }

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
    if (pos.isCollapsed) {
      const activeBlock = this.getBlockAt(Math.max(0, pos.startChar - 1));
      activeBlock?.setActive(true);
      return activeBlock;
    } else return undefined;
  }

  /**
   * Get the text blocks from a position to another
   * @param startPos Start position
   * @param endPosOpt End position, if not provided uses the end of the line
   * @returns Text blocks from startPos to endPos
   */
  public subBlocks(startPos: number, endPosOpt?: number): EditorV3BlockClass[] {
    const ret: EditorV3BlockClass[] = [];
    const endPos = endPosOpt ?? this.lineLength;
    // Return empty styled block for start/end same
    if (startPos >= endPos || endPos <= 0) {
      return ret;
    }
    let _counted = 0;
    for (let _i = 0; _i < this.textBlocks.length; _i++) {
      // Block containing startPos
      if (
        _counted <= startPos &&
        _counted + this.textBlocks[_i].text.length >= startPos &&
        this.textBlocks[_i].text.slice(startPos - _counted, endPos - _counted) !== ""
      ) {
        const slicedBlock = textBlockFactory({
          text: this.textBlocks[_i].text.slice(startPos - _counted, endPos - _counted),
          style: this.textBlocks[_i].style,
          type: this.textBlocks[_i].type,
          isLocked: this.textBlocks[_i].isLocked,
        });
        if (this.textBlocks[_i].isActive) slicedBlock.setActive(true);
        ret.push(slicedBlock);
      }
      // Block after start containing end
      else if (
        _counted > startPos &&
        endPos &&
        _counted + this.textBlocks[_i].text.length >= endPos
      ) {
        const slicedBlock = textBlockFactory({
          text: this.textBlocks[_i].text.slice(0, endPos - _counted),
          style: this.textBlocks[_i].style,
          type: this.textBlocks[_i].type,
          isLocked: this.textBlocks[_i].isLocked,
        });
        if (this.textBlocks[_i].isActive) slicedBlock.setActive(true);
        ret.push(slicedBlock);
      }
      // Block after start and before end
      else if (_counted > startPos && _counted + this.textBlocks[_i].text.length < endPos) {
        ret.push(this.textBlocks[_i]);
      }
      _counted += this.textBlocks[_i].text.length;
      // Stop if the end is reached
      if (_counted >= endPos) break;
    }
    this._setBlockStartPositions(ret, startPos);
    return ret;
  }

  /**
   * Get the text blocks from the start of the line to a position
   * @param pos Position to get blocks to
   * @returns Blocks from start to pos
   */
  public upToPos(pos: number): EditorV3BlockClass[] {
    return this.subBlocks(0, pos);
  }

  /**
   * Get the text blocks from a position to the end of the line
   * @param pos Position to get blocks from
   * @returns Blocks from pos to end
   */
  public fromPos(pos: number): EditorV3BlockClass[] {
    return this.subBlocks(pos);
  }

  /**
   * Split the line into two
   * @param pos Position to split at
   * @returns The remainer of the line after the split
   */
  public splitLine(pos: number): EditorV3Line {
    if (pos >= this.lineLength) {
      return new EditorV3Line([textBlockFactory({ text: "" })], this.contentProps);
    } else {
      const preSplit = this.upToPos(pos);
      const postSplit = this.fromPos(pos);
      this.textBlocks = preSplit.length > 0 ? preSplit : [textBlockFactory({ text: "" })];
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

  /**
   * Apply a style to a section of the line
   * @param styleName Style to apply
   * @param startPos Start position to apply style
   * @param endPos End position to apply style (exclusive)
   * @returns self
   */
  public applyStyle(styleName: string, startPos: number, endPos: number) {
    if (startPos < endPos) {
      this.textBlocks = [
        ...this.upToPos(startPos),
        ...this.subBlocks(startPos, endPos).map((tb) => {
          tb.style = styleName;
          return tb;
        }),
        ...this.fromPos(endPos),
      ];
      this._mergeBlocks();
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
    }
    return this;
  }

  /**
   * Merge blocks with the same style, that are not locked
   */
  private _mergeBlocks() {
    if (new Set(this.textBlocks.map((tb) => tb.typeStyle)).size < this.textBlocks.length) {
      const mergedBlocks: EditorV3BlockClass[] = [];
      let lastTypeStyle: string | null = null;
      for (let _i = 0; _i < this.textBlocks.length; _i++) {
        if (
          !this.textBlocks[_i].isLocked &&
          this.textBlocks[_i].typeStyle === lastTypeStyle &&
          mergedBlocks.length > 0
        ) {
          mergedBlocks[mergedBlocks.length - 1] = textBlockFactory({
            text: mergedBlocks[mergedBlocks.length - 1].text + this.textBlocks[_i].text,
            type: lastTypeStyle.split(":")[0] as EditorV3TextBlockType,
            style: lastTypeStyle.split(":")[1] !== "" ? lastTypeStyle.split(":")[1] : undefined,
          });
        } else {
          mergedBlocks.push(this.textBlocks[_i]);
          lastTypeStyle = this.textBlocks[_i].typeStyle;
        }
      }
      this.textBlocks = mergedBlocks.filter((tb) => tb.text !== "");
    }
    this._setBlockStartPositions();
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
}
