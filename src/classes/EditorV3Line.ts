import { cloneDeep, isEqual } from "lodash";
import { readV2DivElement } from "../functions/readV2DivElement";
import { readV3DivElement } from "../functions/readV3DivElement";
import { readV3MarkdownElement } from "../functions/readV3MarkdownElement";
import { defaultContentProps } from "./EditorV3Content";
import { EditorV3TextBlock } from "./EditorV3TextBlock";
import { drawHtmlDecimalAlign } from "./drawHtmlDecimalAlign";
import {
  EditorV3Align,
  EditorV3ContentProps,
  EditorV3ContentPropsInput,
  EditorV3Position,
} from "./interface";
import { IMarkdownSettings } from "./markdown/MarkdownSettings";

export class EditorV3Line {
  public textBlocks: EditorV3TextBlock[];
  private _defaultContentProps: EditorV3ContentProps = cloneDeep(defaultContentProps);
  public contentProps: EditorV3ContentProps;

  // Read only variables
  public toHtml(): HTMLDivElement {
    const h = document.createElement("div");
    h.className = `aiev3-line ${this.contentProps.textAlignment}`;
    if (this.contentProps.textAlignment === EditorV3Align.decimal) {
      const decimalPosition = this.lineText.match(/\./)?.index ?? Infinity;
      drawHtmlDecimalAlign(
        h,
        this.contentProps.decimalAlignPercent,
        this.upToPos(decimalPosition),
        this.fromPos(decimalPosition),
      );
    } else {
      this.textBlocks.forEach((tb) => h.append(tb.toHtml()));
    }
    return h;
  }

  get lineText(): string {
    return this.textBlocks.map((tb) => tb.text).join("");
  }

  get lineLength(): number {
    return this.textBlocks.map((tb) => tb.text.length).reduce((p, c) => p + c, 0);
  }

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

  get jsonString(): string {
    return JSON.stringify(this.data);
  }

  public toMarkdown(
    markdownSettings: IMarkdownSettings = this.contentProps.markdownSettings,
  ): string {
    return this.textBlocks.map((tb) => tb.toMarkdown(markdownSettings)).join("");
  }

  // Constructor
  constructor(
    arg: string | HTMLDivElement | EditorV3TextBlock[],
    contentProps?: EditorV3ContentPropsInput,
  ) {
    // Set defaults
    this.textBlocks = [];
    this.contentProps = cloneDeep(this._defaultContentProps);

    // Text
    if (typeof arg === "string") {
      // Decimal html string
      if (arg.match(/^<div class="aiev3-line.*<\/div>$/)) {
        const h = document.createElement("template");
        h.innerHTML = arg;
        const d = h.content.children[0] as HTMLDivElement;
        const ret = readV3DivElement(d);
        this.textBlocks = ret.textBlocks;
        this.contentProps.textAlignment = ret.textAlignment;
        this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
      }
      // Markdown string
      else if (arg.match(/^<div class="aiev3-markdown-line.*<\/div>$/)) {
        const h = document.createElement("template");
        h.innerHTML = arg;
        const d = h.content.children[0] as HTMLDivElement;
        const ret = readV3MarkdownElement(d, this.contentProps);
        this.textBlocks = ret.textBlocks;
        this.contentProps.textAlignment = ret.textAlignment;
        this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
      }
      // V2 text
      else if (arg.match(/^<div classname="aie-text.*<\/div>$/)) {
        const h = document.createElement("template");
        h.innerHTML = arg;
        const d = h.content.children[0] as HTMLDivElement;
        const ret = readV2DivElement(d);
        this.textBlocks = ret.textBlocks;
        this.contentProps.textAlignment = ret.textAlignment;
        this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
      }
      // Standard or JSON text
      else {
        try {
          const jsonInput = JSON.parse(arg);
          if (jsonInput.textBlocks) {
            this.textBlocks = jsonInput.textBlocks.map(
              (tb: string | { text: string; style?: string }) => new EditorV3TextBlock(tb),
            );
          } else {
            throw "No blocks";
          }
          if (jsonInput.contentProps)
            this.contentProps = {
              ...this.contentProps,
              ...jsonInput.contentProps,
            };
        } catch {
          this.textBlocks = [new EditorV3TextBlock(arg)];
        }
      }
    } else if (Array.isArray(arg)) {
      this.textBlocks = arg;
    }
    // HTMLDivElement
    else {
      const ret = Array.from(arg.classList).includes("aiev3-line")
        ? readV3DivElement(arg)
        : readV3MarkdownElement(arg, this.contentProps);
      this.textBlocks = ret.textBlocks;
      this.contentProps.textAlignment = ret.textAlignment;
      this.contentProps.decimalAlignPercent = ret.decimalAlignPercent;
    }

    // Always take these if provided
    if (contentProps) this.contentProps = { ...this._defaultContentProps, ...contentProps };

    // Fix and problems
    this._mergeBlocks();
  }

  private getBlockAt(char: number): EditorV3TextBlock | undefined {
    let _counted = 0;
    for (let _i = 0; _i < this.textBlocks.length; _i++) {
      // Block containing startPos
      if (_counted <= char && _counted + this.textBlocks[_i].text.length >= char) {
        return this.textBlocks[_i];
      } else {
        _counted += this.textBlocks[_i].text.length;
      }
    }
    return undefined;
  }

  public getStyleAt(char: number): string | undefined {
    return this.getBlockAt(char)?.style;
  }

  public setActiveBlock(pos: EditorV3Position) {
    if (pos.isCollapsed) {
      this.getBlockAt(pos.startChar)?.setActive(true);
    }
  }

  public subBlocks(startPos: number, endPos?: number): EditorV3TextBlock[] {
    const ret: EditorV3TextBlock[] = [];
    // Return empty styled block for start/end same
    if (startPos >= (endPos ?? this.lineLength)) {
      ret.push(new EditorV3TextBlock("", this.getStyleAt(startPos)));
      return ret;
    }
    let _counted = 0;
    for (let _i = 0; _i < this.textBlocks.length; _i++) {
      // Block containing startPos
      if (
        _counted <= startPos &&
        _counted + this.textBlocks[_i].text.length >= startPos &&
        this.textBlocks[_i].text.slice(startPos - _counted, (endPos ?? Infinity) - _counted) !== ""
      ) {
        const slicedBlock = new EditorV3TextBlock(
          this.textBlocks[_i].text.slice(startPos - _counted, (endPos ?? Infinity) - _counted),
          this.textBlocks[_i].style,
        );
        if (this.textBlocks[_i].isActive) slicedBlock.setActive(true);
        ret.push(slicedBlock);
      }
      // Block after start containing end
      else if (
        _counted > startPos &&
        endPos &&
        _counted + this.textBlocks[_i].text.length >= endPos
      ) {
        const slicedBlock = new EditorV3TextBlock(
          this.textBlocks[_i].text.slice(0, endPos - _counted),
          this.textBlocks[_i].style,
        );
        if (this.textBlocks[_i].isActive) slicedBlock.setActive(true);
        ret.push(slicedBlock);
      }
      // Block after start and before end
      else if (
        _counted > startPos &&
        _counted + this.textBlocks[_i].text.length < (endPos ?? Infinity)
      ) {
        ret.push(this.textBlocks[_i]);
      }
      _counted += this.textBlocks[_i].text.length;
      // Stop if the end is reached
      if (_counted >= (endPos ?? Infinity)) break;
    }
    return ret;
  }

  public upToPos(pos: number): EditorV3TextBlock[] {
    return this.subBlocks(0, pos);
  }

  public fromPos(pos: number): EditorV3TextBlock[] {
    return this.subBlocks(pos);
  }

  public splitLine(pos: number): EditorV3Line {
    if (pos >= this.lineLength) {
      return new EditorV3Line("", this.contentProps);
    } else {
      const preSplit = this.upToPos(pos);
      const postSplit = this.fromPos(pos);
      this.textBlocks = preSplit;
      return new EditorV3Line(postSplit, this.contentProps);
    }
  }

  public insertBlocks(newTextBlocks: EditorV3TextBlock[], pos: number) {
    const pre = this.upToPos(pos);
    const post = this.fromPos(pos);
    this.textBlocks = [...pre, ...newTextBlocks, ...post];
    this._mergeBlocks();
  }

  public removeSection(startPos: number, endPos: number): EditorV3TextBlock[] {
    let ret: EditorV3TextBlock[] = [];
    if (startPos < endPos && startPos < this.lineLength) {
      const pre = this.upToPos(startPos);
      ret = this.subBlocks(startPos, endPos);
      const post = this.fromPos(endPos);
      this.textBlocks = [...pre, ...post];
      this._mergeBlocks();
    }
    return ret;
  }

  public deleteCharacter(pos: number) {
    this.removeSection(pos, pos + 1);
    return this;
  }

  public applyStyle(styleName: string, startPos: number, endPos: number) {
    if (startPos < endPos) {
      this.textBlocks = [
        ...this.upToPos(startPos),
        new EditorV3TextBlock(this.lineText.substring(startPos, endPos), styleName),
        ...this.fromPos(endPos),
      ];
      this._mergeBlocks();
    }
    return this;
  }

  public removeStyle(startPos: number, endPos: number) {
    if (startPos < endPos) {
      this.textBlocks = [
        ...this.upToPos(startPos),
        new EditorV3TextBlock(this.lineText.substring(startPos, endPos)),
        ...this.fromPos(endPos),
      ];
      this._mergeBlocks();
    }
    return this;
  }

  private _mergeBlocks() {
    if (new Set(this.textBlocks.map((tb) => tb.typeStyle)).size < this.textBlocks.length) {
      const mergedBlocks: EditorV3TextBlock[] = [];
      let lastTypeStyle: string | null = null;
      for (let _i = 0; _i < this.textBlocks.length; _i++) {
        if (this.textBlocks[_i].typeStyle === lastTypeStyle && mergedBlocks.length > 0) {
          mergedBlocks[mergedBlocks.length - 1] = new EditorV3TextBlock(
            mergedBlocks[mergedBlocks.length - 1].text + this.textBlocks[_i].text,
            lastTypeStyle.split(":")[1],
          );
        } else {
          mergedBlocks.push(this.textBlocks[_i]);
          lastTypeStyle = this.textBlocks[_i].typeStyle;
        }
      }
      if (mergedBlocks.filter((tb) => tb.text !== "").length === 0) {
        this.textBlocks = [mergedBlocks[0]];
      } else if (mergedBlocks.filter((tb) => tb.text !== "").length < this.textBlocks.length) {
        this.textBlocks = mergedBlocks.filter((tb) => tb.text !== "");
      }
    }
  }
}
