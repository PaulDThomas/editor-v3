import { EditorV3AtBlock, EditorV3Content } from "../../classes";
import { EditorV3Line } from "../../classes/EditorV3Line";
import { EditorV3SelectBlock, IEditorV3SelectBlock } from "../../classes/EditorV3SelectBlock";
import { EditorV3TextBlock } from "../../classes/EditorV3TextBlock";
import { IEditorV3Line } from "../../classes/interface";
import {
  ADD_BLOCK,
  ADD_LINE,
  REMOVE_BLOCK,
  REMOVE_LINE,
  UPDATE_BLOCK,
  UPDATE_BLOCK_LABEL,
  UPDATE_BLOCK_OPTIONS,
  UPDATE_BLOCK_STYLE,
  UPDATE_BLOCK_TEXT,
  UPDATE_BLOCK_TYPE,
  UPDATE_LINE,
  WindowViewAction,
  windowViewReducer,
} from "./windowViewReducer";

describe("windowViewReducer basics", () => {
  let initialState: IEditorV3Line[];

  beforeEach(() => {
    initialState = [
      { textBlocks: [new EditorV3TextBlock("line 1 block 1").data] },
      {
        textBlocks: [
          new EditorV3TextBlock("line 2 block 1,").data,
          new EditorV3TextBlock(" line 2 block 2").data,
        ],
      },
    ];
  });

  test("ADD_LINE not missing", () => {
    const action: WindowViewAction = {
      operation: ADD_LINE,
      lineIndex: 2,
      line: new EditorV3Line("new line"),
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState.length).toBe(3);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1\nline 2 block 1, line 2 block 2\nnew line");
  });

  test("ADD_LINE but missing", () => {
    const action: WindowViewAction = { operation: ADD_LINE, lineIndex: 0 };
    const newState = windowViewReducer(initialState, action);
    expect(newState.length).toBe(3);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("\nline 1 block 1\nline 2 block 1, line 2 block 2");
  });

  test("REMOVE_LINE", () => {
    const action: WindowViewAction = { operation: REMOVE_LINE, lineIndex: 1 };
    const newState = windowViewReducer(initialState, action);
    expect(newState.length).toBe(1);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1");
  });

  test("UPDATE_LINE", () => {
    const updatedLine = new EditorV3Line("updated line");
    const action: WindowViewAction = { operation: UPDATE_LINE, lineIndex: 0, line: updatedLine };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0]).toEqual(updatedLine);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("updated line\nline 2 block 1, line 2 block 2");
  });

  test("ADD_BLOCK not missing", () => {
    const newBlock = new EditorV3TextBlock("wut?");
    const action: WindowViewAction = {
      operation: ADD_BLOCK,
      lineIndex: 0,
      blockIndex: 0,
      block: newBlock,
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks.length).toBe(2);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("wut?line 1 block 1\nline 2 block 1, line 2 block 2");
  });

  test("ADD_BLOCK but missing", () => {
    const action: WindowViewAction = { operation: ADD_BLOCK, lineIndex: 1, blockIndex: 2 };
    const newState = windowViewReducer(initialState, action);
    expect(newState[1].textBlocks.length).toBe(3);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1\nline 2 block 1, line 2 block 2");
  });

  test("REMOVE_BLOCK", () => {
    const action: WindowViewAction = { operation: REMOVE_BLOCK, lineIndex: 0, blockIndex: 0 };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks.length).toBe(0);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("\nline 2 block 1, line 2 block 2");
  });

  test("UPDATE_BLOCK", () => {
    const updatedBlock = new EditorV3TextBlock("Slartibartfast").data;
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK,
      lineIndex: 1,
      blockIndex: 1,
      block: updatedBlock,
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[1].textBlocks[1]).toEqual(updatedBlock);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1\nline 2 block 1,Slartibartfast");
  });
});

describe("windowViewReducer block updates", () => {
  let initialState: IEditorV3Line[];

  beforeEach(() => {
    initialState = [
      {
        textBlocks: [
          new EditorV3TextBlock("line 1 block 1, ").data,
          new EditorV3SelectBlock({
            type: "select",
            text: "line 1 block 2, ",
            isLocked: true,
            availableOptions: [{ text: "Yes" }, { text: "No" }, { text: "Maybe" }],
          }).data,
          new EditorV3AtBlock({
            text: "Slartibartfast",
            isLocked: true,
            atData: { id: "1234", name: "Slartibartfast" },
          }).data,
        ],
      },
    ];
  });

  test("UPDATE_BLOCK_TYPE text to select", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_TYPE,
      lineIndex: 0,
      blockIndex: 0,
      blockType: "select",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[0].type).toBe("select");
    expect(newState[0].textBlocks[0]).toEqual({
      type: "select",
      text: "line 1 block 1, ",
      isLocked: true,
      availableOptions: [],
    });

    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      '(¬(line 1 block 1, **)¬)(¬(line 1 block 2, **Yes||No||Maybe)¬)@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });

  test("UPDATE_BLOCK_TYPE select to text", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_TYPE,
      lineIndex: 0,
      blockIndex: 1,
      blockType: "text",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[1].type).toBe("text");
    expect(newState[0].textBlocks[1]).toEqual({
      type: "text",
      text: "line 1 block 2, ",
    });
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      'line 1 block 1, line 1 block 2, @[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });

  test("UPDATE_BLOCK_TYPE text to at", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_TYPE,
      lineIndex: 0,
      blockIndex: 0,
      blockType: "at",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[0].type).toBe("at");
    expect(newState[0].textBlocks[0]).toEqual({
      type: "at",
      text: "line 1 block 1, ",
      isLocked: true,
      atData: undefined,
    });
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      '@[line 1 block 1, **{}@](¬(line 1 block 2, **Yes||No||Maybe)¬)@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });

  test("UPDATE_BLOCK_TYPE at to text", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_TYPE,
      lineIndex: 0,
      blockIndex: 2,
      blockType: "text",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[2].type).toBe("text");
    expect(newState[0].textBlocks[2]).toEqual({
      type: "text",
      text: "Slartibartfast",
    });
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      "line 1 block 1, (¬(line 1 block 2, **Yes||No||Maybe)¬)Slartibartfast",
    );
  });

  test("UPDATE_BLOCK_TYPE select to at", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_TYPE,
      lineIndex: 0,
      blockIndex: 1,
      blockType: "at",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[1].type).toBe("at");
    expect(newState[0].textBlocks[1]).toEqual({
      type: "at",
      text: "line 1 block 2, ",
      isLocked: true,
      atData: undefined,
    });
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      'line 1 block 1, @[line 1 block 2, **{}@]@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });

  test("UPDATE_BLOCK_TYPE at to select", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_TYPE,
      lineIndex: 0,
      blockIndex: 2,
      blockType: "select",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[2].type).toBe("select");
    expect(newState[0].textBlocks[2]).toEqual({
      type: "select",
      text: "Slartibartfast",
      isLocked: true,
      availableOptions: [],
    });

    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      "line 1 block 1, (¬(line 1 block 2, **Yes||No||Maybe)¬)(¬(Slartibartfast**)¬)",
    );
  });

  test("UPDATE_BLOCK_STYLE to value and back", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_STYLE,
      lineIndex: 0,
      blockIndex: 0,
      blockStyle: "Green",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[0].style).toBe("Green");
    expect(newState[0].textBlocks[0]).toEqual({
      type: "text",
      text: "line 1 block 1, ",
      style: "Green",
    });
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      '(~(Green::line 1 block 1, )~)(¬(line 1 block 2, **Yes||No||Maybe)¬)@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
    const newState2 = windowViewReducer(newState, {
      operation: UPDATE_BLOCK_STYLE,
      lineIndex: 0,
      blockIndex: 0,
      blockStyle: "",
    });
    expect(newState2[0].textBlocks[0].style).toBe(undefined);
    expect(newState2[0].textBlocks[0]).toEqual({
      type: "text",
      text: "line 1 block 1, ",
    });
    const newContent2 = new EditorV3Content({ lines: newState2 });
    expect(newContent2.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent2.markdownText).toBe(
      // eslint-disable-next-line quotes
      'line 1 block 1, (¬(line 1 block 2, **Yes||No||Maybe)¬)@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });

  test("UPDATE_BLOCK_LABEL to value and back", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_LABEL,
      lineIndex: 0,
      blockIndex: 1,
      blockLabel: "[[Selector]]!",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[1].label).toBe("[[Selector]]!");
    expect(newState[0].textBlocks[1]).toEqual({
      type: "select",
      text: "line 1 block 2, ",
      label: "[[Selector]]!",
      isLocked: true,
      availableOptions: [
        { text: "Yes", data: { noStyle: "true" } },
        { text: "No", data: { noStyle: "true" } },
        { text: "Maybe", data: { noStyle: "true" } },
      ],
    });
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      'line 1 block 1, (¬(::[[Selector]]!::line 1 block 2, **Yes||No||Maybe)¬)@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );

    const newState2 = windowViewReducer(newState, {
      operation: UPDATE_BLOCK_LABEL,
      lineIndex: 0,
      blockIndex: 1,
      blockLabel: "",
    });
    expect(newState2[0].textBlocks[1].label).toBe(undefined);
    expect(newState2[0].textBlocks[1]).toEqual({
      type: "select",
      text: "line 1 block 2, ",
      isLocked: true,
      availableOptions: [
        { text: "Yes", data: { noStyle: "true" } },
        { text: "No", data: { noStyle: "true" } },
        { text: "Maybe", data: { noStyle: "true" } },
      ],
    });
    const newContent2 = new EditorV3Content({ lines: newState2 });
    expect(newContent2.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent2.markdownText).toBe(
      // eslint-disable-next-line quotes
      'line 1 block 1, (¬(line 1 block 2, **Yes||No||Maybe)¬)@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });

  test("UPDATE_BLOCK_TEXT", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_TEXT,
      lineIndex: 0,
      blockIndex: 2,
      blockText: "Slartibartfast, the Magrathean",
    };
    const newState = windowViewReducer(initialState, action);
    expect(newState[0].textBlocks[2].text).toBe("Slartibartfast, the Magrathean");
    expect(newState[0].textBlocks[2]).toEqual({
      type: "at",
      text: "Slartibartfast, the Magrathean",
      isLocked: true,
      atData: { id: "1234", name: "Slartibartfast" },
    });
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast, the Magrathean");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      'line 1 block 1, (¬(line 1 block 2, **Yes||No||Maybe)¬)@[Slartibartfast, the Magrathean**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });

  test("UPDATE_BLOCK_OPTIONS", () => {
    const action: WindowViewAction = {
      operation: UPDATE_BLOCK_OPTIONS,
      lineIndex: 0,
      blockIndex: 1,
      blockOptions: new EditorV3Content({
        lines: [
          {
            textBlocks: [new EditorV3TextBlock("Yes").data],
          },
          { textBlocks: [new EditorV3TextBlock("No").data] },
          { textBlocks: [new EditorV3TextBlock({ text: "Definitely", style: "Green" }).data] },
          { textBlocks: [new EditorV3TextBlock("Maybe").data] },
        ],
      }),
    };
    const newState = windowViewReducer(initialState, action);
    const updateBlock = newState[0].textBlocks[1] as IEditorV3SelectBlock;
    expect(updateBlock.availableOptions?.length).toBe(4);
    expect(updateBlock.availableOptions).toEqual([
      { text: "Yes", data: {} },
      { text: "No", data: {} },
      { text: "Definitely", data: { style: "Green" } },
      { text: "Maybe", data: {} },
    ]);
    const newContent = new EditorV3Content({ lines: newState });
    expect(newContent.text).toBe("line 1 block 1, line 1 block 2, Slartibartfast");
    expect(newContent.markdownText).toBe(
      // eslint-disable-next-line quotes
      'line 1 block 1, (¬(line 1 block 2, **Yes||No||Green::Definitely||Maybe)¬)@[Slartibartfast**{"id":"1234","name":"Slartibartfast"}@]',
    );
  });
});
