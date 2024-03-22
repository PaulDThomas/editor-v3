import { fireEvent } from "@testing-library/dom";
import { EditorV3AtBlock } from "./EditorV3AtBlock";
import { EditorV3AtListItem } from "./interface";
import { act } from "react-dom/test-utils";

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
    new Promise<EditorV3AtListItem<undefined>[]>((resolve) => {
      const available = [
        { text: "@one" },
        { text: "@two" },
        { text: "@three" },
        { text: "@four" },
        { text: "@five" },
        { text: "@six" },
        { text: "@seven" },
        { text: "@eight" },
        { text: "@nine" },
        { text: "@ten" },
        { text: "@eleven" },
        { text: "@twelve" },
        { text: "@thirteen" },
        { text: "@fourteen" },
        { text: "@fifteen" },
        { text: "@sixteen" },
        { text: "@seventeen" },
        { text: "@eighteen" },
        { text: "@nineteen" },
        { text: "@twenty" },
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

  test("Render dropdown for no objects", async () => {
    const text = "@nothing";
    const block = new EditorV3AtBlock({ text, atListFunction });
    block.setActive(true);
    const div = document.createElement("div");

    await act(async () => {
      block.toHtml({ currentEl: div });
      // Run pending timer from the function to display the dropdown list
      jest.runAllTimers();
      expect(div.querySelector(".aiev3-at-dropdown-list")).not.toBeNull();
      expect(div.querySelector(".aiev3-at-dropdown-list")!.textContent).toEqual("Loading...");
    });
    expect(div.querySelector(".aiev3-at-dropdown-list")).not.toBeNull();
    expect(div.querySelector(".aiev3-at-dropdown-list")!.textContent).toEqual("No items found");
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
      expect(div.querySelector(".aiev3-at-dropdown-list")).not.toBeNull();
      expect(div.querySelector(".aiev3-at-dropdown-list")!.textContent).toEqual("Loading...");
    });
    const dropDown = div.querySelector(".aiev3-at-dropdown-list");
    expect(dropDown).not.toBeNull();
    expect(dropDown!.textContent).not.toEqual("Loading...");
    expect(div.innerHTML).toMatchSnapshot();

    // Check dropdown click
    const items = dropDown?.querySelectorAll("li.aiev3-at-item");
    expect(items).toBeDefined();
    expect(items?.length).toBe(10);
    const expectedText = items![0].textContent;
    fireEvent.click(items![0]);
    expect(div.querySelector(".aiev3-at-item")).toBeNull();
    expect(div.textContent).toBe(expectedText);
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
      expect(div.querySelector(".aiev3-at-dropdown-list")).not.toBeNull();
      expect(div.querySelector(".aiev3-at-dropdown-list")!.textContent).toEqual("Loading...");
      // Resolve the promise in errorCall
      expect(errorCall).toHaveBeenCalled();
    });
    expect(div.querySelector(".aiev3-at-dropdown-list")).not.toBeNull();
    expect(div.querySelector(".aiev3-at-dropdown-list")!.textContent).toEqual(
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
    const items = div.querySelectorAll(".aiev3-at-item");
    expect(items).toBeDefined();
    expect(items.length).toBe(20);
    fireEvent.click(items![0]);
    expect(div.querySelector(".aiev3-at-item")).toBeNull();
    expect(div.textContent).toBe("aa");
    expect(div.innerHTML).toMatchSnapshot();
  });
});
