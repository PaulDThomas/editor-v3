import { EditorV3AtBlock } from "./EditorV3AtBlock";

describe("EditorV3AtBlock", () => {
  test("should return a DocumentFragment with the correct structure and attributes", () => {
    const text = "Hello, world!";
    const style = "bold";
    const block = new EditorV3AtBlock({ text, style });
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
