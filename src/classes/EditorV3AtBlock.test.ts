import { act } from "react";
import { fireEvent } from "@testing-library/react";
import { EditorV3AtBlock } from "./EditorV3AtBlock";
import { EditorV3DropListItem } from "./interface";

describe("EditorV3AtBlock", () => {
  test("should return a DocumentFragment with the correct structure", () => {
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
        new Promise<EditorV3DropListItem<{ tree: string }>[]>((resolve) =>
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
        new Promise<EditorV3DropListItem<{ tree: string }>[]>((resolve) =>
          resolve([{ text: "Oak", data: { tree: "oak" } }]),
        ),
    });
    expect(updatedBlock.data).toEqual({ text, type: "at", atData: { tree: "oak" } });
    expect(await updatedBlock.atListFunction("")).toEqual([{ text: "Oak", data: { tree: "oak" } }]);
    expect(updatedBlock.maxAtListLength).toBe(20);
  });

  test("should return a DocumentFragment when isActive with the correct structure", () => {
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
    new Promise<EditorV3DropListItem<{ email: string }>[]>((resolve) =>
      window.setTimeout(() => {
        const available: EditorV3DropListItem<{ email: string }>[] = [
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
      }, 1000),
    );

  test("Ensure previous dropdowns are removed", async () => {
    const text = "@";
    const block = new EditorV3AtBlock({ text, atListFunction });
    block.setActive(true);
    const editor = document.createElement("div");
    document.body.appendChild(editor);
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
    expect(document.body.innerHTML).toMatchSnapshot();
    // Check dropdown click
    const items = document.body.querySelectorAll(".aiev3-drop-item");
    expect(items).toBeDefined();
    expect(items.length).toBe(10);
    fireEvent.mouseDown(items![0]);
    await act(async () => jest.runAllTimers());
    expect(editor.querySelector(".aiev3-drop-item")).toBeNull();
    expect(document.body.innerHTML).toMatchSnapshot();
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
      expect(document.body.querySelector(".aiev3-dropdown-list")).not.toBeNull();
      expect(document.body.querySelector(".aiev3-dropdown-list")!.textContent).toEqual(
        "Loading...",
      );
    });
    expect(document.body.querySelector(".aiev3-dropdown-list")).not.toBeNull();
    expect(document.body.querySelector(".aiev3-dropdown-list")!.textContent).toEqual(
      "No items found",
    );
  });

  test("Render dropdown for all objects", async () => {
    const text = "@";
    const block = new EditorV3AtBlock({ text, atListFunction });
    block.setActive(true);
    const div = document.createElement("div");
    document.body.appendChild(div);

    block.toHtml({ currentEl: div });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    // Run pending timer from the function to display the dropdown list
    expect(document.body.querySelector(".aiev3-dropdown-list")).not.toBeNull();
    expect(document.body.querySelector(".aiev3-dropdown-list")!.textContent).toEqual("Loading...");
    await act(async () => {
      jest.runAllTimers();
    });
    const dropDown = document.body.querySelector(".aiev3-dropdown-list");
    expect(dropDown).not.toBeNull();
    expect(dropDown!.textContent).not.toEqual("Loading...");
    expect(document.body.innerHTML).toMatchSnapshot();

    // Check dropdown click
    const items = dropDown?.querySelectorAll("li.aiev3-drop-item");
    expect(items).toBeDefined();
    expect(items?.length).toBe(10);
    const expectedText = items![0].textContent;
    fireEvent.mouseDown(items![0]);
    await act(async () => jest.runAllTimers());
    expect(document.body.querySelector(".aiev3-drop-item")).toBeNull();
    // Check span contents
    const span = div.querySelector(".aiev3-tb.at-block") as HTMLSpanElement;
    expect(span.textContent).toBe(expectedText);
    expect(span.dataset.isLocked).toBe("true");
    expect(span.dataset.email).toBe("one");
    expect(span.className).toBe("aiev3-tb at-block show-dropdown is-locked");
  });

  test("Render dropdown and click off", async () => {
    const text = "@q";
    const block = new EditorV3AtBlock({
      text,
    });
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

    await act(async () => {
      block.toHtml({ currentEl: line });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
    });
    // Check outside dropdown click
    fireEvent.mouseDown(document);
    expect(line.querySelector(".aiev3-at-dropdown-list")).toBeNull();
    expect(line.textContent).toBe("@q");
    expect((line.querySelector(".aiev3-tb.at-block") as HTMLSpanElement)?.dataset.isLocked).toBe(
      "true",
    );
    expect(line.innerHTML).toMatchSnapshot();
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
      expect(document.body.querySelector(".aiev3-dropdown-list")).not.toBeNull();
      expect(document.body.querySelector(".aiev3-dropdown-list")!.textContent).toEqual(
        "Loading...",
      );
      // Resolve the promise in errorCall
      expect(errorCall).toHaveBeenCalled();
    });
    expect(document.body.querySelector(".aiev3-dropdown-list")).not.toBeNull();
    expect(document.body.querySelector(".aiev3-dropdown-list")!.textContent).toEqual(
      "Error fetching list",
    );
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
        const retItem: EditorV3DropListItem<{ email: string }> = {
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
    const editor = document.createElement("div");
    document.body.appendChild(editor);
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
    expect(document.body.innerHTML).toMatchSnapshot();

    // Check dropdown click
    const items = document.body.querySelectorAll(".aiev3-drop-item");
    expect(items).toBeDefined();
    expect(items.length).toBe(20);
    fireEvent.mouseDown(items![0]);
    await act(async () => jest.runAllTimers());
    expect(line.querySelector(".aiev3-drop-item")).toBeNull();
    expect(line.textContent).toBe("aa");
    expect(document.body.innerHTML).toMatchSnapshot();

    // Check data
    const readBack = new EditorV3AtBlock(line.children[0] as HTMLSpanElement);
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
    }).toThrow("EditorV3AtBlock:Constructor: Child node must be HTMLSpanElement");
  });
});

describe("EditorV3AtBlock markdown output", () => {
  test("should return the correct markdown output", async () => {
    const testBlock = new EditorV3AtBlock({
      text: "@Hello",
      style: "shiny",
      label: "label",
      atData: {
        email: "aa@0.com",
      },
    });
    const result = testBlock.toMarkdown();
    // eslint-disable-next-line quotes
    expect(testBlock.toMarkdown()).toEqual('@[shiny::label::@Hello**{"email":"aa@0.com"}@]');
    const eatOwnTail = new EditorV3AtBlock(result);
    expect(eatOwnTail.data).toEqual(testBlock.data);
  });

  test("should have no data from bad JSON in tyhe markdown", async () => {
    // eslint-disable-next-line quotes
    const testMarkdown = '@[shiny::label::@Hello**{"email":wooo!}@]';
    const testBlock = new EditorV3AtBlock(testMarkdown);
    expect(testBlock.data).toEqual({
      text: "@Hello",
      type: "at",
      style: "shiny",
      label: "label",
    });
  });
});
