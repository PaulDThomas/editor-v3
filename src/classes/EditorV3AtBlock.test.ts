import { fireEvent } from "@testing-library/dom";
import { EditorV3AtBlock } from "./EditorV3AtBlock";

describe("EditorV3AtBlock", () => {
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
    new Promise<string[]>((resolve) => {
      const available = [
        "@one",
        "@two",
        "@three",
        "@four",
        "@five",
        "@six",
        "@seven",
        "@eight",
        "@nine",
        "@ten",
        "@eleven",
        "@twelve",
        "@thirteen",
        "@fourteen",
        "@fifteen",
        "@sixteen",
        "@seventeen",
        "@eighteen",
        "@nineteen",
        "@twenty",
      ];
      resolve(available.filter((item) => item.includes(typedString)));
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
    block.toHtml({ currentEl: div });
    // Run pending timer from the function to display the dropdown list
    jest.runAllTimers();
    expect(div.querySelector(".aiev3-at-dropdown")).not.toBeNull();
    expect(div.querySelector(".aiev3-at-dropdown")!.textContent).toEqual("Loading...");
    // Add new promise to ensure all other promises are resolved
    await Promise.resolve();
    expect(div.querySelector(".aiev3-at-dropdown")).not.toBeNull();
    expect(div.querySelector(".aiev3-at-dropdown")!.textContent).toEqual("No items found");
  });

  test("Render dropdown for all objects", async () => {
    const text = "@";
    const block = new EditorV3AtBlock({ text, atListFunction });
    block.setActive(true);
    const div = document.createElement("div");
    block.toHtml({ currentEl: div });
    // Run pending timer from the function to display the dropdown list
    jest.runAllTimers();
    expect(div.querySelector(".aiev3-at-dropdown")).not.toBeNull();
    expect(div.querySelector(".aiev3-at-dropdown")!.textContent).toEqual("Loading...");
    // Add new promise to ensure all other promises are resolved
    await Promise.resolve();
    const dropDown = div.querySelector(".aiev3-at-dropdown");
    expect(dropDown).not.toBeNull();
    expect(dropDown!.textContent).not.toEqual("Loading...");
    expect(div.innerHTML).toMatchSnapshot();

    // Check dropdown click
    const items = dropDown?.querySelectorAll("li.aiev3-at-item");
    expect(items).toBeDefined();
    expect(items?.length).toBe(10);
    const expectedText = items![0].textContent;
    fireEvent.click(items![0]);
    expect(div.querySelector(".aiev3-at-dropdown")).toBeNull();
    expect(div.textContent).toBe(expectedText);
  });

  test("Render dropdown and click off", async () => {
    const text = "@q";
    const block = new EditorV3AtBlock({
      text,
    });
    block.setActive(true);
    const div = document.createElement("div");
    block.toHtml({ currentEl: div });
    // Run pending timer from the function to display the dropdown list
    jest.runAllTimers();
    await Promise.resolve();
    // Check outside dropdown click
    fireEvent.click(document);
    expect(div.querySelector(".aiev3-at-dropdown")).toBeNull();
    expect(div.textContent).toBe("@q");
    expect((div.querySelector(".aiev3-tb.at-block") as HTMLSpanElement)?.dataset.isLocked).toBe(
      "true",
    );
    expect(div.innerHTML).toMatchSnapshot();
  });
});
