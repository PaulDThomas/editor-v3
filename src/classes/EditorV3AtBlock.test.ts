import { act, fireEvent } from "@testing-library/react";
import { EditorV3AtBlock } from "./EditorV3AtBlock";
import { EditorV3AtListItem } from "./interface";

describe("EditorV3AtBlock", () => {
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

  test("should return a DocumentFragment with the correct structure and attributes", () => {
    const text = "Hello, world!";
    const style = "bold";
    const block = new EditorV3AtBlock({ text, style });
    expect(block.wordPositions).toEqual([
      {
        line: -1,
        startChar: 0,
        endChar: 13,
        isLocked: false,
      },
    ]);
    block.setActive(true);
    const result = block.toHtml({});

    // Check if the DocumentFragment contains a single span element
    expect(result.childNodes.length).toBe(1);
    expect(result.firstChild).toBeInstanceOf(HTMLSpanElement);

    const span = result.firstChild as HTMLSpanElement;

    // Check if the span element has the correct class names
    expect(span.classList.contains("aiev3-tb")).toBe(true);
    expect(span.classList.contains("at-block")).toBe(true);
    expect(span.classList.contains("is-active")).toBe(true);
    expect(span.classList.contains("is-locked")).toBe(false);
    expect(span.classList.contains(`editorv3style-${style}`)).toBe(true);

    // Check if the span element has the correct content and attributes
    expect(span.textContent).toBe(text);
    expect(span.dataset.isLocked).not.toBeDefined();
    expect(span.dataset.styleName).toBe(style);
  });

  test("should update forcedParams", async () => {
    const text = "Hello, world!";
    const block = new EditorV3AtBlock({
      text,
      maxAtListLength: 15,
      atData: { tree: "larch" },
      atListFunction: () =>
        new Promise<EditorV3AtListItem<{ tree: string }>[]>((resolve) =>
          resolve([{ text: "Birch", data: { tree: "silver birch" } }]),
        ),
    });
    expect(block.data).toEqual({ text, type: "at", atData: { tree: "larch" } });
    expect(await block.atListFunction("")).toEqual([
      { text: "Birch", data: { tree: "silver birch" } },
    ]);
    expect(block.maxAtListLength).toBe(15);
    const updatedBlock = new EditorV3AtBlock(block.data, {
      maxAtListLength: 20,
      atData: { tree: "oak" },
      atListFunction: () =>
        new Promise<EditorV3AtListItem<{ tree: string }>[]>((resolve) =>
          resolve([{ text: "Oak", data: { tree: "oak" } }]),
        ),
    });
    expect(updatedBlock.data).toEqual({ text, type: "at", atData: { tree: "oak" } });
    expect(await updatedBlock.atListFunction("")).toEqual([{ text: "Oak", data: { tree: "oak" } }]);
    expect(updatedBlock.maxAtListLength).toBe(20);
  });

  test("should return a DocumentFragment with the correct structure and attributes when isActive is false and isLocked is true", () => {
    const text = "Hello, world!";
    const style = undefined;
    const block = new EditorV3AtBlock({ text, style, isLocked: true });
    const result = block.toHtml({});

    // Check if the DocumentFragment contains a single span element
    expect(result.childNodes.length).toBe(1);
    expect(result.firstChild).toBeInstanceOf(HTMLSpanElement);

    const span = result.firstChild as HTMLSpanElement;

    // Check if the span element has the correct class names
    expect(span.classList.contains("aiev3-tb")).toBe(true);
    expect(span.classList.contains("at-block")).toBe(true);
    expect(span.classList.contains("is-active")).toBe(false);
    expect(span.classList.contains("is-locked")).toBe(true);
    expect(span.classList.toString().includes("editorv3style")).toBe(false);

    // Check if the span element has the correct content and attributes
    expect(span.textContent).toBe("Hello, world!");
    expect(span.dataset.isLocked).toBe("true");
    expect(span.dataset.styleName).not.toBeDefined();
  });
});

describe("should return a DocumentFragment with a dropdown", () => {
  const atListFunction = (typedString: string) =>
    new Promise<EditorV3AtListItem<{ email: string }>[]>((resolve) => {
      const available: EditorV3AtListItem<{ email: string }>[] = [
        { text: "@one", data: { email: "one" } },
        { text: "@two", data: { email: "two" } },
        { text: "@three", data: { email: "three" } },
        { text: "@four", data: { email: "four" } },
        { text: "@five", data: { email: "five" } },
        { text: "@six", data: { email: "six" } },
        { text: "@seven", data: { email: "seven" } },
        { text: "@eight", data: { email: "eight" } },
        { text: "@nine", data: { email: "nine" } },
        { text: "@ten", data: { email: "ten" } },
        { text: "@eleven", data: { email: "eleven" } },
        { text: "@twelve", data: { email: "twelve" } },
        { text: "@thirteen", data: { email: "thirteen" } },
        { text: "@fourteen", data: { email: "fourteen" } },
        { text: "@fifteen", data: { email: "fifteen" } },
        { text: "@sixteen", data: { email: "sixteen" } },
        { text: "@seventeen", data: { email: "seventeen" } },
        { text: "@eighteen", data: { email: "eighteen" } },
        { text: "@nineteen", data: { email: "nineteen" } },
        { text: "@twenty", data: { email: "twenty" } },
      ];
      resolve(
        available.filter((item) => item.text.toLowerCase().includes(typedString.toLowerCase())),
      );
    });

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
    const text = "@";
    const block = new EditorV3AtBlock({ text, atListFunction });
    block.setActive(true);
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
    expect(items.length).toBe(10);
    fireEvent.click(items![0]);
    expect(editor.querySelector(".aiev3-drop-item")).toBeNull();
    expect(editor.innerHTML).toMatchSnapshot();
  });

  test("Render dropdown for no objects", async () => {
    const text = "@nothing";
    const block = new EditorV3AtBlock({ text, atListFunction });
    block.setActive(true);
    const div = document.createElement("div");

    await act(async () => {
      block.toHtml({ currentEl: div });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
      expect(div.querySelector(".aiev3-dropdown-list")).not.toBeNull();
      expect(div.querySelector(".aiev3-dropdown-list")!.textContent).toEqual("Loading...");
    });
    expect(div.querySelector(".aiev3-dropdown-list")).not.toBeNull();
    expect(div.querySelector(".aiev3-dropdown-list")!.textContent).toEqual("No items found");
  });

  test("Render dropdown for all objects", async () => {
    const text = "@";
    const block = new EditorV3AtBlock({ text, atListFunction });
    block.setActive(true);
    const div = document.createElement("div");

    await act(async () => {
      block.toHtml({ currentEl: div });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
      expect(div.querySelector(".aiev3-dropdown-list")).not.toBeNull();
      expect(div.querySelector(".aiev3-dropdown-list")!.textContent).toEqual("Loading...");
    });
    const dropDown = div.querySelector(".aiev3-dropdown-list");
    expect(dropDown).not.toBeNull();
    expect(dropDown!.textContent).not.toEqual("Loading...");
    expect(div.innerHTML).toMatchSnapshot();

    // Check dropdown click
    const items = dropDown?.querySelectorAll("li.aiev3-drop-item");
    expect(items).toBeDefined();
    expect(items?.length).toBe(10);
    const expectedText = items![0].textContent;
    fireEvent.click(items![0]);
    expect(div.querySelector(".aiev3-drop-item")).toBeNull();
    // Check span contents
    const span = div.querySelector(".aiev3-tb.at-block") as HTMLSpanElement;
    expect(span.textContent).toBe(expectedText);
    expect(span.dataset.isLocked).toBe("true");
    expect(span.dataset.email).toBe("one");
    expect(span.className).toBe("aiev3-tb at-block is-locked");
  });

  test("Render dropdown and click off", async () => {
    const text = "@q";
    const block = new EditorV3AtBlock({
      text,
    });
    block.setActive(true);
    const div = document.createElement("div");

    await act(async () => {
      block.toHtml({ currentEl: div });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
    });
    // Check outside dropdown click
    fireEvent.click(document);
    expect(div.querySelector(".aiev3-at-dropdown-list")).toBeNull();
    expect(div.textContent).toBe("@q");
    expect((div.querySelector(".aiev3-tb.at-block") as HTMLSpanElement)?.dataset.isLocked).toBe(
      "true",
    );
    expect(div.innerHTML).toMatchSnapshot();
  });

  test("Render error in list", async () => {
    const text = "@some error";
    const errorCall = jest.fn().mockRejectedValue(new Error("A bad thing happened"));
    const block = new EditorV3AtBlock({
      text,
      atListFunction: errorCall,
    });
    block.setActive(true);
    const div = document.createElement("div");

    await act(async () => {
      block.toHtml({ currentEl: div });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
      expect(div.querySelector(".aiev3-dropdown-list")).not.toBeNull();
      expect(div.querySelector(".aiev3-dropdown-list")!.textContent).toEqual("Loading...");
      // Resolve the promise in errorCall
      expect(errorCall).toHaveBeenCalled();
    });
    expect(div.querySelector(".aiev3-dropdown-list")).not.toBeNull();
    expect(div.querySelector(".aiev3-dropdown-list")!.textContent).toEqual("Error fetching list");
  });

  test("Use data and linkRenderer", async () => {
    // Create function
    const atListFunction = async (typedString: string) => {
      const items = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i).repeat(2)).map(
        (letter) => `${letter}`,
      );
      const filter = items.filter((item) =>
        item.toLowerCase().includes(typedString.slice(1).toLowerCase()),
      );
      const ret = filter.map((text, ix) => {
        const retItem: EditorV3AtListItem<{ email: string }> = {
          text,
          data: { email: `${text}@${ix}.com` },
        };
        retItem.listRender = document.createElement("li");
        retItem.listRender.textContent = `George ${text} (${text}@${ix}.com)`;
        return retItem;
      });
      return ret;
    };
    // Create block
    const text = "@";
    const block = new EditorV3AtBlock({ text, atListFunction, maxAtListLength: 20 });
    block.setActive(true);
    const div = document.createElement("div");

    await act(async () => {
      block.toHtml({ currentEl: div });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
    });
    expect(div.innerHTML).toMatchSnapshot();

    // Check dropdown click
    const items = div.querySelectorAll(".aiev3-drop-item");
    expect(items).toBeDefined();
    expect(items.length).toBe(20);
    fireEvent.click(items![0]);
    expect(div.querySelector(".aiev3-drop-item")).toBeNull();
    expect(div.textContent).toBe("aa");
    expect(div.innerHTML).toMatchSnapshot();

    // Check data
    const readBack = new EditorV3AtBlock(div.children[0] as HTMLSpanElement);
    expect(readBack.data).toEqual({
      text: "aa",
      type: "at",
      isLocked: true,
      style: undefined,
      atData: {
        email: "aa@0.com",
      },
    });

    // Eat your own tail
    expect(new EditorV3AtBlock(readBack.data).data).toEqual(readBack.data);
    expect(new EditorV3AtBlock(readBack.toHtml({})).data).toEqual(readBack.data);
  });
});

describe("EditorV3AtBlock errors", () => {
  test("should throw an error from an empty document fragment", async () => {
    expect(() => {
      new EditorV3AtBlock(document.createDocumentFragment());
    }).toThrow("EditorV3AtBlock:Constructor: DocumentFragment must have 1 child node");
  });
  test("should throw an error from an unknown node type", async () => {
    const frag = new DocumentFragment();
    frag.appendChild(new Text("Bad text!"));
    expect(() => {
      new EditorV3AtBlock(frag);
    }).toThrow("EditorV3AtBlock:Constructor: DocumentFragment child node must be HTMLSpanElement");
  });
});
