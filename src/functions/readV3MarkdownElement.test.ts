import { defaultContentProps } from "classes/defaultContentProps";
import { EditorV3Align } from "../classes/interface";
import { readV3MarkdownElement } from "./readV3MarkdownElement";

describe("Test readV3MarkdownElement", () => {
  test("Basic test", async () => {
    // Create a mock HTMLDivElement
    const div = document.createElement("div");
    div.innerText = "Hello world!";
    div.className = "aiev3-markdown-line";

    // Call the function
    const result = readV3MarkdownElement(div, defaultContentProps);

    // Assert the expected output
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "Hello world!", type: "text" },
    ]);
  });

  test("Default style", async () => {
    const div = document.createElement("div");
    div.textContent = "<<Hello world>>";
    div.className = "aiev3-markdown-line";
    const result = readV3MarkdownElement(div, defaultContentProps);

    expect(result.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "Hello world", style: "defaultStyle", type: "text" },
    ]);
  });

  test("Empty div", async () => {
    // Create a mock HTMLDivElement with no innerText
    const div = document.createElement("div");
    div.className = "aiev3-markdown-line";

    // Call the function
    const result = readV3MarkdownElement(div, defaultContentProps);

    // Assert the expected output
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([{ text: "", type: "text" }]);
    expect(result.decimalAlignPercent).toEqual(60);
    expect(result.textAlignment).toEqual(EditorV3Align.left);
  });

  test("Multiple styles", async () => {
    // Create a mock HTMLDivElement with multiple styles
    const div = document.createElement("div");
    const s = document.createElement("span");
    div.appendChild(s);
    s.textContent = "&lt;&lt;st1::hello&gt;&gt; world <<st2::annoyed>>";
    div.className = "aiev3-markdown-line";

    // Call the function
    const result = readV3MarkdownElement(div, defaultContentProps);

    // Assert the expected output
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hello", style: "st1", type: "text" },
      { text: " world ", type: "text" },
      { text: "annoyed", style: "st2", type: "text" },
    ]);
  });

  test("React at block and styles", async () => {
    // Create a mock HTMLDivElement with multiple styles
    const div = document.createElement("div");
    const s = document.createElement("span");
    div.appendChild(s);
    s.textContent = "@[@Hello world@] piece of @[iced::cake@]";
    div.className = "aiev3-markdown-line";
    const result = readV3MarkdownElement(div, defaultContentProps);
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "@Hello world", type: "at", atData: {} },
      { text: " piece of ", type: "text" },
      { text: "cake", style: "iced", type: "at", atData: {} },
    ]);
  });
});
