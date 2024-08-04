import { act, fireEvent } from "@testing-library/react";
import { EditorV3DropListItem } from "./interface";
import { EditorV3SelectBlock } from "./EditorV3SelectBlock";

describe("EditorV3SelectBlock", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Define offsetParent for HTMLElement
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      get() {
        return this.parentNode;
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should return a DocumentFragment with the correct structure", () => {
    const text = "-- Select --";
    const style = "bold";
    const availableOptions: EditorV3DropListItem<Record<string, string>>[] = [
      {
        text: "Hello",
      },
      {
        text: "World",
        data: { style: "shiny" },
      },
    ];
    const block = new EditorV3SelectBlock({ text, style, availableOptions });
    expect(block.wordPositions).toEqual([
      {
        line: -1,
        startChar: 0,
        endChar: 12,
        isLocked: true,
      },
    ]);
    block.setActive(true);
    block.showDropdown();
    const result = block.toHtml({});

    // Check if the DocumentFragment contains a single span element
    expect(result.childNodes.length).toBe(1);
    expect(result.firstChild).toBeInstanceOf(HTMLSpanElement);

    const span = result.firstChild as HTMLSpanElement;

    // Check if the span element has the correct class names
    expect(span.classList.contains("aiev3-tb")).toBe(true);
    expect(span.classList.contains("select-block")).toBe(true);
    expect(span.classList.contains("is-active")).toBe(true);
    expect(span.classList.contains("is-locked")).toBe(true);
    expect(span.classList.contains(`editorv3style-${style}`)).toBe(true);

    // Check if the span element has the correct content and attributes
    expect(span.textContent).toBe(text);
    expect(span.dataset.isLocked).toBe("true");
    expect(span.dataset.styleName).toBe(style);
  });

  test("should correctly read a span element", async () => {
    const span = document.createElement("span");
    span.textContent = "-- Select --";
    span.classList.add("aiev3-tb", "select-block", "editorv3style-bold");
    span.dataset.styleName = "bold";
    span.dataset.isLocked = "true";
    span.dataset.availableOptions = JSON.stringify([
      {
        text: "Hello",
      },
      {
        text: "World",
        data: { style: "shiny" },
      },
    ]);

    const block = new EditorV3SelectBlock(span);
    expect(block.data).toEqual({
      text: "-- Select --",
      type: "select",
      style: "bold",
      availableOptions: [
        {
          text: "Hello",
          data: { noStyle: "true" },
        },
        {
          text: "World",
          data: { style: "shiny" },
        },
      ],
      isLocked: true,
    });
  });

  test("should correctly read a Document fragment", async () => {
    const frag = new DocumentFragment();
    const span = document.createElement("span");
    frag.appendChild(span);
    span.textContent = "-- Select --";
    span.classList.add("aiev3-tb", "select-block", "editorv3style-bold");
    span.title = "Select a number";
    span.dataset.styleName = "bold";
    span.dataset.isLocked = "true";
    span.dataset.availableOptions = JSON.stringify([
      {
        text: "one",
      },
      {
        text: "two",
        data: { style: "shiny" },
      },
      {
        text: "three",
        data: { style: "dull" },
      },
    ]);

    const block = new EditorV3SelectBlock(frag);
    expect(block.data).toEqual({
      text: "-- Select --",
      label: "Select a number",
      type: "select",
      style: "bold",
      availableOptions: [
        {
          text: "one",
          data: { noStyle: "true" },
        },
        {
          text: "two",
          data: { style: "shiny" },
        },
        { text: "three", data: { style: "dull" } },
      ],
      isLocked: true,
    });
  });

  test("should update forcedParams", async () => {
    const text = "-- Select --";
    const style = "bold";
    const availableOptions: EditorV3DropListItem<Record<string, string>>[] = [
      {
        text: "Hello",
      },
      {
        text: "World",
        data: { style: "shiny" },
      },
    ];
    const block = new EditorV3SelectBlock({ text, style, availableOptions });
    expect(block.data).toEqual({
      text,
      type: "select",
      isLocked: true,
      style,
      availableOptions: [
        {
          text: "Hello",
          data: { noStyle: "true" },
        },
        {
          text: "World",
          data: { style: "shiny" },
        },
      ],
    });
    const updatedBlock = new EditorV3SelectBlock(block.data, {
      style: "shiny",
      availableOptions: [
        {
          text: "Hello",
          data: { noStyle: "true" },
        },
        {
          text: "World",
          data: { style: "shiny" },
        },
        { text: "another" },
      ],
    });
    expect(updatedBlock.data).toEqual({
      text,
      type: "select",
      style: "shiny",
      isLocked: true,
      availableOptions: [
        {
          text: "Hello",
          data: { noStyle: "true" },
        },
        {
          text: "World",
          data: { style: "shiny" },
        },
        { text: "another", data: { noStyle: "true" } },
      ],
    });
  });

  test("should return a DocumentFragment when isSelected with the correct structure", () => {
    const text = "-- Select --";
    const label = "Select";
    const style = undefined;
    const availableOptions: EditorV3DropListItem<Record<string, string>>[] = [
      { text: "Hello" },
      {
        text: "World",
        data: { style: "shiny" },
      },
    ];
    const block = new EditorV3SelectBlock({ text, style, availableOptions, label });
    const result = block.toHtml({});

    // Check if the DocumentFragment contains a single span element
    expect(result.childNodes.length).toBe(1);
    expect(result.firstChild).toBeInstanceOf(HTMLSpanElement);

    const span = result.firstChild as HTMLSpanElement;

    // Check if the span element has the correct class names
    expect(span.classList.contains("aiev3-tb")).toBe(true);
    expect(span.classList.contains("select-block")).toBe(true);
    expect(span.classList.contains("is-active")).toBe(false);
    expect(span.classList.contains("show-dropdown")).toBe(false);
    expect(span.classList.contains("is-locked")).toBe(true);
    expect(span.classList.toString().includes("editorv3style")).toBe(false);

    // Check if the span element has the correct content and attributes
    expect(span.textContent).toBe(text);
    expect(span.title).toBe(label);
    expect(span.dataset.isLocked).toBe("true");
    expect(span.dataset.styleName).not.toBeDefined();
  });
});

describe("should return a DocumentFragment with a dropdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Define offsetParent for HTMLElement
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      get() {
        return this.parentNode;
      },
    });
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  test("Ensure previous dropdowns are removed", async () => {
    const text = "-- Select --";
    const style = "bold";
    const availableOptions: EditorV3DropListItem<Record<string, string>>[] = [
      {
        text: "Hello",
      },
      {
        text: "World",
        data: { style: "shiny" },
      },
    ];
    const block = new EditorV3SelectBlock({ text, style, availableOptions });
    block.showDropdown();
    const editor = document.createElement("div");
    editor.className = "aiev3";
    const editable = document.createElement("div");
    editable.className = "aiev3-editable";
    editable.contentEditable = "true";
    editor.appendChild(editable);
    const line = document.createElement("div");
    line.className = "aiev3-line";
    editable.appendChild(line);
    const oldDropdown = document.createElement("ul");
    oldDropdown.className = "aiev3-dropdown-list";
    editor.appendChild(oldDropdown);
    oldDropdown.innerHTML = "<li class='aiev3-drop-item'>Old item</li>";
    expect(editor.querySelector(".aiev3-dropdown-list")?.textContent).toEqual("Old item");

    await act(async () => {
      block.toHtml({ editableEl: editable, currentEl: line });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
    });
    expect(editor.querySelector(".aiev3-dropdown-list")?.textContent).not.toEqual("Old item");
    expect(editor.innerHTML).toMatchSnapshot();
    // Check dropdown click
    const items = editor.querySelectorAll(".aiev3-drop-item");
    expect(items).toBeDefined();
    expect(items.length).toBe(2);
    fireEvent.mouseDown(items![1].childNodes[0] as HTMLElement);
    expect(editor.querySelector(".aiev3-drop-item")).toBeNull();
    expect(editor.innerHTML).toMatchSnapshot();
  });

  test("should remove existing style", async () => {
    const text = "-- Select --";
    const style = "bold";
    const availableOptions: EditorV3DropListItem<Record<string, string>>[] = [
      {
        text: "Hello",
      },
      {
        text: "World",
        data: { style: "shiny" },
      },
    ];
    const block = new EditorV3SelectBlock({ text, style, availableOptions });
    block.showDropdown();
    const editor = document.createElement("div");
    editor.className = "aiev3";
    const editable = document.createElement("div");
    editable.className = "aiev3-editable";
    editable.contentEditable = "true";
    editor.appendChild(editable);
    const line = document.createElement("div");
    line.className = "aiev3-line";
    editable.appendChild(line);

    await act(async () => {
      block.toHtml({ editableEl: editable, currentEl: line });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
    });
    expect(editor.innerHTML).toMatchSnapshot();
    // Check dropdown click
    const items = editor.querySelectorAll(".aiev3-drop-item");
    expect(items).toBeDefined();
    expect(items.length).toBe(2);
    fireEvent.mouseDown(items![0].childNodes[0] as HTMLElement);
    expect(editor.querySelector(".aiev3-drop-item")).toBeNull();
    expect(editor.querySelector(".select-block") as HTMLSpanElement).not.toHaveClass(
      "editorv3style-bold",
    );
    expect(editor.innerHTML).toMatchSnapshot();
  });
});

describe("EditorV3SelectBlock errors", () => {
  test("should throw an error from an empty document fragment", async () => {
    expect(() => {
      new EditorV3SelectBlock(document.createDocumentFragment());
    }).toThrow("EditorV3SelectBlock:Constructor: DocumentFragment must have 1 child node");
  });
  test("should throw an error from an unknown node type", async () => {
    const frag = new DocumentFragment();
    frag.appendChild(new Text("Bad text!"));
    expect(() => {
      new EditorV3SelectBlock(frag);
    }).toThrow(
      "EditorV3SelectBlock:Constructor: DocumentFragment child node must be HTMLSpanElement",
    );
  });
});

describe("EditorV3SelectBlock markdown output", () => {
  test("should return the correct markdown output", async () => {
    const text = "-- Select --";
    const style = "bold";
    const availableOptions: EditorV3DropListItem<Record<string, string>>[] = [
      {
        text: "Hello",
      },
      {
        text: "World",
        data: { style: "shiny" },
      },
    ];
    const testBlock = new EditorV3SelectBlock({ text, style, availableOptions });
    const result = testBlock.toMarkdown();
    expect(testBlock.toMarkdown()).toEqual("[[bold::-- Select --**Hello||shiny::World]]");
    const eatOwnTail = new EditorV3SelectBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });
});
