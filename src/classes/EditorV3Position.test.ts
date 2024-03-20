import { isEqual } from "lodash";
import { EditorV3PositionClass } from "./EditorV3Position";
import { EditorV3Position } from "./interface";

describe("EditorV3Position tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, isLocked: false },
    { line: 0, startChar: 5, endChar: 10, isLocked: true },
    { line: 1, startChar: 0, endChar: 3, isLocked: true },
    { line: 1, startChar: 3, endChar: 11, isLocked: false },
    { line: 2, startChar: 0, endChar: 6, isLocked: false },
    { line: 2, startChar: 7, endChar: 9, isLocked: true },
    { line: 2, startChar: 9, endChar: 12, isLocked: true },
  ];

  test("Check initial setup", () => {
    const position1 = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
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
      focusAt: "end",
    });
    const position2 = new EditorV3PositionClass(2, 5, 0, 3, lineLengths, words);
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
    const position3 = new EditorV3PositionClass(0, 5, 2, 3, lineLengths, words);
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
    { line: 0, startChar: 0, endChar: 5, isLocked: false },
    { line: 0, startChar: 5, endChar: 10, isLocked: true },
    { line: 1, startChar: 0, endChar: 3, isLocked: true },
    { line: 1, startChar: 3, endChar: 11, isLocked: false },
    { line: 2, startChar: 0, endChar: 6, isLocked: false },
    { line: 2, startChar: 7, endChar: 9, isLocked: true },
    { line: 2, startChar: 9, endChar: 12, isLocked: true },
  ];

  test("moveLeft should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 12,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 7,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 6,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 5,
        endLine: 2,
        endChar: 5,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 4,
        endLine: 2,
        endChar: 4,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 3,
        endLine: 2,
        endChar: 3,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 2,
        endLine: 2,
        endChar: 2,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 1,
        endLine: 2,
        endChar: 1,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 12,
        endLine: 1,
        endChar: 12,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 1,
        endChar: 11,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 10,
        endLine: 1,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 8,
        endLine: 1,
        endChar: 8,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 7,
        endLine: 1,
        endChar: 7,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 6,
        endLine: 1,
        endChar: 6,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 5,
        endLine: 1,
        endChar: 5,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 4,
        endLine: 1,
        endChar: 4,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 1,
        endChar: 3,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 5,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 4,
        endLine: 0,
        endChar: 4,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 3,
        endLine: 0,
        endChar: 3,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 2,
        endLine: 0,
        endChar: 2,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 1,
        endLine: 0,
        endChar: 1,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveLeft with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 4,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 2,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 1,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 12,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 8,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 7,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 6,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 4,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 4,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 2,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 1,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
  });

  test("moveLeft with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 7,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveLeft with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
  });
});

describe("EditorV3Position moveRight tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, isLocked: false },
    { line: 0, startChar: 5, endChar: 10, isLocked: true },
    { line: 1, startChar: 0, endChar: 3, isLocked: true },
    { line: 1, startChar: 3, endChar: 11, isLocked: false },
    { line: 2, startChar: 0, endChar: 6, isLocked: false },
    { line: 2, startChar: 7, endChar: 9, isLocked: true },
    { line: 2, startChar: 9, endChar: 12, isLocked: true },
  ];

  test("moveRight should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 1,
        endLine: 0,
        endChar: 1,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 2,
        endLine: 0,
        endChar: 2,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 3,
        endLine: 0,
        endChar: 3,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 4,
        endLine: 0,
        endChar: 4,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 5,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 1,
        endChar: 3,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 4,
        endLine: 1,
        endChar: 4,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 5,
        endLine: 1,
        endChar: 5,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 6,
        endLine: 1,
        endChar: 6,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 7,
        endLine: 1,
        endChar: 7,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 8,
        endLine: 1,
        endChar: 8,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 10,
        endLine: 1,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 1,
        endChar: 11,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 12,
        endLine: 1,
        endChar: 12,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 1,
        endLine: 2,
        endChar: 1,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 2,
        endLine: 2,
        endChar: 2,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 3,
        endLine: 2,
        endChar: 3,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 4,
        endLine: 2,
        endChar: 4,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 5,
        endLine: 2,
        endChar: 5,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 6,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 7,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 7,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 12,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveRight with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 1,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 2,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 3,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 4,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 5,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 4,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 5,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 6,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 7,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 8,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 9,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 10,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 11,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 12,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 1,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 2,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 3,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 4,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 5,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 6,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 7,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
  });

  test("moveRight with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 5,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 3,
        endLine: 1,
        endChar: 3,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 11,
        endLine: 1,
        endChar: 11,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 6,
        endLine: 2,
        endChar: 6,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 12,
        endLine: 2,
        endChar: 12,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveRight with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 5,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 3,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 11,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
  });
});

describe("EditorV3Position moveUp tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, isLocked: false },
    { line: 0, startChar: 5, endChar: 10, isLocked: true },
    { line: 1, startChar: 0, endChar: 3, isLocked: true },
    { line: 1, startChar: 3, endChar: 11, isLocked: false },
    { line: 2, startChar: 0, endChar: 6, isLocked: false },
    { line: 2, startChar: 7, endChar: 9, isLocked: true },
    { line: 2, startChar: 9, endChar: 12, isLocked: true },
  ];

  test("moveUp should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 1,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
    const position2 = new EditorV3PositionClass(2, 9, 2, 9, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveUp with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
    const position2 = new EditorV3PositionClass(2, 9, 2, 9, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
  });

  test("moveUp with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
    const position2 = new EditorV3PositionClass(2, 9, 2, 9, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveUp with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
    const position2 = new EditorV3PositionClass(2, 9, 2, 9, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 5,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
  });
});

describe("EditorV3Position moveDown tests", () => {
  const lineLengths = [10, 9, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, isLocked: false },
    { line: 0, startChar: 5, endChar: 10, isLocked: true },
    { line: 1, startChar: 0, endChar: 3, isLocked: true },
    { line: 1, startChar: 3, endChar: 9, isLocked: false },
    { line: 2, startChar: 0, endChar: 6, isLocked: false },
    { line: 2, startChar: 7, endChar: 9, isLocked: true },
    { line: 2, startChar: 9, endChar: 12, isLocked: true },
  ];

  test("moveDown should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
    const position2 = new EditorV3PositionClass(0, 10, 0, 10, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 1,
        startChar: 9,
        endLine: 1,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 9,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveDown with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 1,
        endChar: 0,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
    const position2 = new EditorV3PositionClass(0, 10, 0, 10, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 1,
        endChar: 9,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 9,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
  });

  test("moveDown with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
    const position2 = new EditorV3PositionClass(0, 10, 0, 10, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 9,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveDown with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
    const position2 = new EditorV3PositionClass(0, 10, 0, 10, lineLengths, words);
    const focusChars2: EditorV3Position[] = [];
    let lastPos2: EditorV3Position | undefined = undefined;
    for (let _ix = 0; _ix < 40 && !isEqual(position2.pos, lastPos2); _ix++) {
      lastPos2 = { ...position2.pos };
      focusChars2.push(position2.pos);
      position2.moveDown(true, true);
    }
    expect(focusChars2).toEqual([
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 12,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
  });
});

describe("EditorV3Position moveHome tests", () => {
  const lineLengths = [10, 13, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, isLocked: false },
    { line: 0, startChar: 5, endChar: 10, isLocked: true },
    { line: 1, startChar: 0, endChar: 3, isLocked: true },
    { line: 1, startChar: 3, endChar: 11, isLocked: false },
    { line: 2, startChar: 0, endChar: 6, isLocked: false },
    { line: 2, startChar: 7, endChar: 9, isLocked: true },
    { line: 2, startChar: 9, endChar: 12, isLocked: true },
  ];

  test("moveHome should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveHome with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
  });

  test("moveHome with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 0,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveHome with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(2, 13, 2, 13, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "start",
      },
    ]);
  });
});

describe("EditorV3Position moveEnd tests", () => {
  const lineLengths = [10, 9, 13];
  const words = [
    { line: 0, startChar: 0, endChar: 5, isLocked: false },
    { line: 0, startChar: 5, endChar: 10, isLocked: true },
    { line: 1, startChar: 0, endChar: 3, isLocked: true },
    { line: 1, startChar: 3, endChar: 8, isLocked: false },
    { line: 2, startChar: 0, endChar: 6, isLocked: false },
    { line: 2, startChar: 7, endChar: 9, isLocked: true },
    { line: 2, startChar: 9, endChar: 12, isLocked: true },
  ];

  test("moveEnd should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 10,
        endLine: 0,
        endChar: 10,
        isCollapsed: true,
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveEnd with shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 0,
        endChar: 10,
        isCollapsed: false,
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
  });

  test("moveEnd with ctrlKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 2,
        startChar: 13,
        endLine: 2,
        endChar: 13,
        isCollapsed: true,
        focusAt: "end",
      },
    ]);
  });

  test("moveEnd with ctrlKey and shiftKey should update focusChar correctly", () => {
    const position = new EditorV3PositionClass(0, 0, 0, 0, lineLengths, words);
    const focusChars: EditorV3Position[] = [];
    let lastPos: EditorV3Position | undefined = undefined;
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
        focusAt: "end",
      },
      {
        startLine: 0,
        startChar: 0,
        endLine: 2,
        endChar: 13,
        isCollapsed: false,
        focusAt: "end",
      },
    ]);
  });
});
