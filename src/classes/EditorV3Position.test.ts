import { isEqual } from "lodash";
import { EditorV3Position, IEditorV3Position } from "./EditorV3Position";

describe("EditorV3Position tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, locked: false },
    { line: 0, startChar: 5, endChar: 10, locked: true },
    { line: 1, startChar: 0, endChar: 3, locked: true },
    { line: 1, startChar: 3, endChar: 11, locked: false },
    { line: 2, startChar: 0, endChar: 6, locked: false },
    { line: 2, startChar: 7, endChar: 9, locked: true },
    { line: 2, startChar: 9, endChar: 12, locked: true },
  ];

  test("Check initial setup", () => {
    const position1 = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    expect(position1.isCollapsed).toBe(true);
    expect(position1.startLine).toBe(0);
    expect(position1.startChar).toBe(0);
    expect(position1.endLine).toBe(0);
    expect(position1.endChar).toBe(0);
    expect(position1.data).toEqual({
      startLine: 0,
      startChar: 0,
      endLine: 0,
      endChar: 0,
      isCollapsed: true,
      initialLine: 0,
      initialChar: 0,
      focusLine: 0,
      focusChar: 0,
      focusAt: "start",
    });
    const position2 = new EditorV3Position(2, 5, 0, 3, lineLengths, words);
    expect(position2.isCollapsed).toBe(false);
    expect(position2.startLine).toBe(0);
    expect(position2.startChar).toBe(3);
    expect(position2.endLine).toBe(2);
    expect(position2.endChar).toBe(5);
    expect(position2.data).toEqual({
      startLine: 0,
      startChar: 3,
      endLine: 2,
      endChar: 5,
      isCollapsed: false,
      initialLine: 2,
      initialChar: 5,
      focusLine: 0,
      focusChar: 3,
      focusAt: "start",
    });
    const position3 = new EditorV3Position(0, 5, 2, 3, lineLengths, words);
    expect(position3.isCollapsed).toBe(false);
    expect(position3.startLine).toBe(0);
    expect(position3.startChar).toBe(5);
    expect(position3.endLine).toBe(2);
    expect(position3.endChar).toBe(3);
    expect(position3.data).toEqual({
      startLine: 0,
      startChar: 5,
      endLine: 2,
      endChar: 3,
      isCollapsed: false,
      initialLine: 0,
      initialChar: 5,
      focusLine: 2,
      focusChar: 3,
      focusAt: "end",
    });
  });
});

describe("EditorV3Position moveLeft tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, locked: false },
    { line: 0, startChar: 5, endChar: 10, locked: true },
    { line: 1, startChar: 0, endChar: 3, locked: true },
    { line: 1, startChar: 3, endChar: 11, locked: false },
    { line: 2, startChar: 0, endChar: 6, locked: false },
    { line: 2, startChar: 7, endChar: 9, locked: true },
    { line: 2, startChar: 9, endChar: 12, locked: true },
  ];

  test("moveLeft should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveLeft(false, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 12,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 7,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 6,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 5,
        endLine: 2,
        endChar: 5,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 4,
        endLine: 2,
        endChar: 4,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 3,
        endLine: 2,
        endChar: 3,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 2,
        endLine: 2,
        endChar: 2,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 1,
        endLine: 2,
        endChar: 1,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 12,
        endLine: 1,
        endChar: 12,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 1,
        endChar: 11,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 10,
        endLine: 1,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 8,
        endLine: 1,
        endChar: 8,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 7,
        endLine: 1,
        endChar: 7,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 6,
        endLine: 1,
        endChar: 6,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 5,
        endLine: 1,
        endChar: 5,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 4,
        endLine: 1,
        endChar: 4,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 1,
        endChar: 3,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 5,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 4,
        endLine: 0,
        endChar: 4,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 3,
        endLine: 0,
        endChar: 3,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 2,
        endLine: 0,
        endChar: 2,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 1,
        endLine: 0,
        endChar: 1,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
  });

  test("moveLeft with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveLeft(true, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 4,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 2,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 1,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 12,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 8,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 7,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 6,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 4,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 4,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 2,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 1,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });

  test("moveLeft with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveLeft(false, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 7,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
  });

  test("moveLeft with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveLeft(true, position.focusChar !== 0);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });
});

describe("EditorV3Position moveRight tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, locked: false },
    { line: 0, startChar: 5, endChar: 10, locked: true },
    { line: 1, startChar: 0, endChar: 3, locked: true },
    { line: 1, startChar: 3, endChar: 11, locked: false },
    { line: 2, startChar: 0, endChar: 6, locked: false },
    { line: 2, startChar: 7, endChar: 9, locked: true },
    { line: 2, startChar: 9, endChar: 12, locked: true },
  ];

  test("moveRight should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveRight(false, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 1,
        endLine: 0,
        endChar: 1,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 2,
        endLine: 0,
        endChar: 2,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 3,
        endLine: 0,
        endChar: 3,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 4,
        endLine: 0,
        endChar: 4,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 5,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 1,
        endChar: 3,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 4,
        endLine: 1,
        endChar: 4,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 5,
        endLine: 1,
        endChar: 5,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 6,
        endLine: 1,
        endChar: 6,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 7,
        endLine: 1,
        endChar: 7,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 8,
        endLine: 1,
        endChar: 8,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 10,
        endLine: 1,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 1,
        endChar: 11,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 12,
        endLine: 1,
        endChar: 12,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 1,
        endLine: 2,
        endChar: 1,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 2,
        endLine: 2,
        endChar: 2,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 3,
        endLine: 2,
        endChar: 3,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 4,
        endLine: 2,
        endChar: 4,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 5,
        endLine: 2,
        endChar: 5,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 6,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 7,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 12,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
  });

  test("moveRight with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveRight(true, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 1,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 2,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 3,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 4,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 5,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 4,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 5,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 6,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 7,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 8,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 11,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 12,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 1,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 2,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 3,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 4,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 5,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 6,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 7,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });

  test("moveRight with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveRight(false, position.focusChar !== lineLengths[position.startLine]);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 5,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 1,
        endChar: 3,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 1,
        endChar: 11,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 6,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 12,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
  });

  test("moveRight with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveRight(true, position.focusChar !== lineLengths[position.startLine]);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 5,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 11,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });
});

describe("EditorV3Position moveUp tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, locked: false },
    { line: 0, startChar: 5, endChar: 10, locked: true },
    { line: 1, startChar: 0, endChar: 3, locked: true },
    { line: 1, startChar: 3, endChar: 11, locked: false },
    { line: 2, startChar: 0, endChar: 6, locked: false },
    { line: 2, startChar: 7, endChar: 9, locked: true },
    { line: 2, startChar: 9, endChar: 12, locked: true },
  ];

  test("moveUp should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveUp(false, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
    const position2 = new EditorV3Position(2, 9, 2, 9, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveUp(false, false);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
  });

  test("moveUp with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveUp(true, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
    const position2 = new EditorV3Position(2, 9, 2, 9, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveUp(true, false);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
    ]);
  });

  test("moveUp with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveUp(false, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
    const position2 = new EditorV3Position(2, 9, 2, 9, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveUp(false, position2.focusChar !== 0);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
  });

  test("moveUp with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveUp(true, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
    const position2 = new EditorV3Position(2, 9, 2, 9, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveUp(true, position2.focusChar !== 0);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
    ]);
  });
});

describe("EditorV3Position moveDown tests", () => {
  const lineLengths = [10, 9, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, locked: false },
    { line: 0, startChar: 5, endChar: 10, locked: true },
    { line: 1, startChar: 0, endChar: 3, locked: true },
    { line: 1, startChar: 3, endChar: 9, locked: false },
    { line: 2, startChar: 0, endChar: 6, locked: false },
    { line: 2, startChar: 7, endChar: 9, locked: true },
    { line: 2, startChar: 9, endChar: 12, locked: true },
  ];

  test("moveDown should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveDown(false, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
    const position2 = new EditorV3Position(0, 10, 0, 10, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveDown(false, false);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
  });

  test("moveDown with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveDown(true, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
    const position2 = new EditorV3Position(0, 10, 0, 10, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveDown(true, false);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 1,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });

  test("moveDown with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveDown(false, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
    const position2 = new EditorV3Position(0, 10, 0, 10, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveDown(false, true);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
  });

  test("moveDown with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveDown(true, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
    const position2 = new EditorV3Position(0, 10, 0, 10, lineLengths, words);
    const focusChars2: IEditorV3Position[] = [];
    let lastPos2: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveDown(true, true);
    }
    console.log(focusChars2);
    expect(focusChars2).toEqual([
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });
});

describe("EditorV3Position moveHome tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, locked: false },
    { line: 0, startChar: 5, endChar: 10, locked: true },
    { line: 1, startChar: 0, endChar: 3, locked: true },
    { line: 1, startChar: 3, endChar: 11, locked: false },
    { line: 2, startChar: 0, endChar: 6, locked: false },
    { line: 2, startChar: 7, endChar: 9, locked: true },
    { line: 2, startChar: 9, endChar: 12, locked: true },
  ];

  test("moveHome should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveHome(false, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
  });

  test("moveHome with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveHome(true, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });

  test("moveHome with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveHome(false, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
    ]);
  });

  test("moveHome with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(2, 13, 2, 13, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveHome(true, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });
});

describe("EditorV3Position moveEnd tests", () => {
  const lineLengths = [10, 9, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, locked: false },
    { line: 0, startChar: 5, endChar: 10, locked: true },
    { line: 1, startChar: 0, endChar: 3, locked: true },
    { line: 1, startChar: 3, endChar: 8, locked: false },
    { line: 2, startChar: 0, endChar: 6, locked: false },
    { line: 2, startChar: 7, endChar: 9, locked: true },
    { line: 2, startChar: 9, endChar: 12, locked: true },
  ];

  test("moveEnd should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveEnd(false, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
  });

  test("moveEnd with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveEnd(true, false);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });

  test("moveEnd with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveEnd(false, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
      },
    ]);
  });

  test("moveEnd with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3Position(0, 0, 0, 0, lineLengths, words);
    const focusChars: IEditorV3Position[] = [];
    let lastPos: IEditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position.pos, lastPos); _ix++) {
      lastPos = { ...position.pos };
      focusChars.push(position.pos);
      position.moveEnd(true, true);
    }
    expect(focusChars).toEqual([
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
      },
    ]);
  });
});
