import { isEqual } from "lodash";
import { EditorV3Position, EditorV3PositionF, EditorV3WordPosition } from "./interface";

export class EditorV3PositionClass implements EditorV3Position {
  public initialLine: number;
  public initialChar: number;
  public focusLine: number;
  public focusChar: number;

  get isCollapsed(): boolean {
    return this.initialLine === this.focusLine && this.initialChar === this.focusChar;
  }
  get startLine(): number {
    return Math.min(this.initialLine, this.focusLine);
  }
  get endLine(): number {
    return Math.max(this.initialLine, this.focusLine);
  }
  get startChar(): number {
    return this.initialLine < this.focusLine
      ? this.initialChar
      : this.initialLine > this.focusLine
        ? this.focusChar
        : Math.min(this.initialChar, this.focusChar);
  }
  get endChar(): number {
    return this.initialLine < this.focusLine
      ? this.focusChar
      : this.initialLine > this.focusLine
        ? this.initialChar
        : Math.max(this.initialChar, this.focusChar);
  }
  private lineLengths: number[];
  private words: EditorV3WordPosition[];
  public lastAction: "keydown" | "move" | "select" = "move";
  public lastKey?: string = undefined;

  get pos(): EditorV3Position {
    return {
      startLine: this.startLine,
      startChar: this.startChar,
      endLine: this.endLine,
      endChar: this.endChar,
      isCollapsed: this.isCollapsed,
      focusAt: this.endLine === this.focusLine && this.endChar === this.focusChar ? "end" : "start",
    };
  }

  get posF(): EditorV3PositionF {
    return {
      initialLine: this.initialLine,
      initialChar: this.initialChar,
      focusLine: this.focusLine,
      focusChar: this.focusChar,
    };
  }

  get data() {
    return {
      ...this.pos,
      initialLine: this.initialLine,
      initialChar: this.initialChar,
      focusLine: this.focusLine,
      focusChar: this.focusChar,
    };
  }

  constructor(
    initialLine: number,
    initialChar: number,
    focusLine: number,
    focusChar: number,
    lineLengths: number[],
    words: EditorV3WordPosition[],
  ) {
    this.initialLine = initialLine;
    this.initialChar = initialChar;
    this.focusLine = focusLine;
    this.focusChar = focusChar;
    this.lineLengths = lineLengths;
    this.words = words;
  }

  private _checkCollapse(shiftKey: boolean) {
    if (this.lastAction === "move" && !shiftKey) {
      this.initialLine = this.focusLine;
      this.initialChar = this.focusChar;
    } else if (this.lastAction !== "select" && shiftKey) {
      this.lastAction = "select";
    }
  }

  /**
   * Set caret from position
   * @param pos New position
   */
  public setCaret(posInput: EditorV3Position) {
    const pos = posInput;
    if (pos && !pos.focusAt) pos.focusAt = "end";
    if (pos && !isEqual(pos, this.pos)) {
      if (pos.focusAt === "end") {
        this.initialLine = pos.startLine;
        this.initialChar = pos.startChar;
        this.focusLine = pos.endLine;
        this.focusChar = pos.endChar;
      } else {
        this.initialLine = pos.endLine;
        this.initialChar = pos.endChar;
        this.focusLine = pos.startLine;
        this.focusChar = pos.startChar;
      }
    }
  }

  /**
   * Move caret left
   * @param shiftKey Shift key pressed
   * @param ctrlKey Control key pressed
   */
  public moveLeft(shiftKey: boolean, ctrlKey: boolean) {
    // CTRL at the start of a line to beginning of item
    if (ctrlKey && this.focusChar === 0 && this.focusLine > 0) {
      this.focusLine = 0;
      this.focusChar = 0;
    }
    // CTRL to word boundary or beginning of line
    else if (ctrlKey) {
      const nextWordBoundary = this.words
        .filter((w) => w.line === this.focusLine && w.startChar < this.focusChar)
        .reduce((acc, cur) => (cur.startChar > acc ? cur.startChar : acc), 0);
      this.focusChar = nextWordBoundary;
    }
    // Move to the start of selection if no shift
    else if (!this.isCollapsed && !shiftKey) {
      this.focusChar = this.startChar;
      this.lastAction = "move";
    }
    // Up a line
    else if (this.focusChar === 0) {
      if (this.focusLine > 0) {
        this.focusLine -= 1;
        this.focusChar = this.lineLengths[this.focusLine];
      }
    }
    // Move left 1 character
    else {
      this.focusChar -= 1;
      // Check if we are inside a locked block and expand
      const insideLocked = this.words.find(
        (w) =>
          w.isLocked &&
          w.line === this.focusLine &&
          w.startChar < this.focusChar &&
          w.endChar > this.focusChar,
      );
      if (insideLocked) {
        this.lastAction = "select";
        this.focusChar = insideLocked.startChar;
        if (!shiftKey) {
          this.initialLine = insideLocked.line;
          this.initialChar = insideLocked.endChar;
        }
      }
    }
    // Collapse if required
    this._checkCollapse(shiftKey);
  }

  /**
   * Move caret Right
   * @param shiftKey Shift key pressed
   * @param ctrlKey Control key pressed
   */
  public moveRight(shiftKey: boolean, ctrlKey: boolean) {
    // CTRL at the end of a line to end of item
    if (
      ctrlKey &&
      this.focusChar === this.lineLengths[this.focusLine] &&
      this.focusLine < this.lineLengths.length - 1
    ) {
      this.focusLine = this.lineLengths.length - 1;
      this.focusChar = this.lineLengths[this.focusLine];
    }
    // CTRL to word boundary or end of line
    else if (ctrlKey) {
      const nextWordBoundary = this.words
        .filter((w) => w.line === this.focusLine && w.endChar > this.focusChar)
        .reduce(
          (acc, cur) => (cur.endChar < acc ? cur.endChar : acc),
          this.lineLengths[this.focusLine],
        );
      this.focusChar = nextWordBoundary;
    }
    // Move to the end of selection if no shift
    else if (!this.isCollapsed && !shiftKey) {
      this.focusChar = this.endChar;
      this.lastAction = "move";
    }
    // Down a line
    else if (this.focusChar === this.lineLengths[this.focusLine]) {
      if (this.focusLine < this.lineLengths.length - 1) {
        this.focusLine += 1;
        this.focusChar = 0;
      }
    }
    // Move right 1 character
    else {
      this.focusChar += 1;
      // Check if we are inside a locked block and expand
      const insideLocked = this.words.find(
        (w) =>
          w.isLocked &&
          w.line === this.focusLine &&
          w.startChar < this.focusChar &&
          w.endChar > this.focusChar,
      );
      if (insideLocked) {
        this.lastAction = "select";
        this.focusChar = insideLocked.endChar;
        if (!shiftKey) {
          this.initialLine = insideLocked.line;
          this.initialChar = insideLocked.startChar;
        }
      }
    }
    // Collapse if required
    this._checkCollapse(shiftKey);
  }

  /**
   * Move caret up
   * @param shiftKey Shift key pressed
   * @param ctrlKey Control key pressed
   */
  public moveUp(shiftKey: boolean, ctrlKey: boolean) {
    // Already at the top
    if (this.focusLine === 0) {
      this.focusChar = 0;
      this.lastAction = "move";
    }
    // Up a line
    else if (this.focusLine > 0) {
      if (ctrlKey) this.focusLine = 0;
      else this.focusLine -= 1;
      // Check line length
      if (this.focusChar > this.lineLengths[this.focusLine]) {
        this.focusChar = this.lineLengths[this.focusLine];
      }
      // Check if we are inside a locked block and expand
      const insideLocked = this.words.find(
        (w) =>
          w.isLocked &&
          w.line === this.focusLine &&
          w.startChar < this.focusChar &&
          w.endChar > this.focusChar,
      );
      if (insideLocked) {
        this.lastAction = "select";
        this.focusChar = insideLocked.startChar;
        if (!shiftKey) {
          this.initialLine = insideLocked.line;
          this.initialChar = insideLocked.endChar;
        }
      }
    }
    // Collapse if required
    this._checkCollapse(shiftKey);
  }

  /**
   * Move caret down
   * @param shiftKey Shift key pressed
   * @param ctrlKey Control key pressed
   */
  public moveDown(shiftKey: boolean, ctrlKey: boolean) {
    // Already at the bottom
    if (this.focusLine === this.lineLengths.length - 1) {
      this.focusChar = this.lineLengths[this.focusLine];
      this.lastAction = "move";
    }
    // Down a line
    else if (this.focusLine < this.lineLengths.length - 1) {
      if (ctrlKey) this.focusLine = this.lineLengths.length - 1;
      else this.focusLine += 1;
      // Check line length
      if (this.focusChar > this.lineLengths[this.focusLine]) {
        this.focusChar = this.lineLengths[this.focusLine];
      }
      // Check if we are inside a locked block and expand
      const insideLocked = this.words.find(
        (w) =>
          w.isLocked &&
          w.line === this.focusLine &&
          w.startChar < this.focusChar &&
          w.endChar > this.focusChar,
      );
      if (insideLocked) {
        this.lastAction = "select";
        this.focusChar = insideLocked.endChar;
        if (!shiftKey) {
          this.initialLine = insideLocked.line;
          this.initialChar = insideLocked.startChar;
        }
      }
    }
    // Collapse if required
    this._checkCollapse(shiftKey);
  }

  /**
   * Move caret home
   * @param shiftKey Shift key pressed
   * @param ctrlKey Control key pressed
   */
  public moveHome(shiftKey: boolean, ctrlKey: boolean) {
    // Move to the top line on CTRL to already at the start
    if (ctrlKey || this.startChar === 0) {
      this.focusLine = 0;
    }
    this.focusChar = 0;
    // Collapse if required
    this._checkCollapse(shiftKey);
  }

  /**
   * Move caret end
   * @param shiftKey Shift key pressed
   * @param ctrlKey Control key pressed
   */
  public moveEnd(shiftKey: boolean, ctrlKey: boolean) {
    if (ctrlKey || this.endChar === this.lineLengths[this.endLine]) {
      this.focusLine = this.lineLengths.length - 1;
    }
    this.focusChar = this.lineLengths[this.focusLine];
    // Collapse if required
    this._checkCollapse(shiftKey);
  }
}
