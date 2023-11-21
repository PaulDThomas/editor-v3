import { EditorV3Align } from "./interface";
import { defaultMarkdownSettings } from "./markdown/MarkdownSettings";
import { readV3MarkdownElement } from "./readV3MarkdownElement";

describe("Test readV3MarkdownElement", () => {
  test("Basic test", async () => {
    // Create a mock HTMLDivElement
    const div = document.createElement("div");
    div.innerText = "Hello world!";
    div.className = "aiev3-markdown-line";
    div.dataset.decimalAlignPercent = "50";
    div.dataset.textAlignment = EditorV3Align.center;

    // Call the function
    const result = readV3MarkdownElement(div, defaultMarkdownSettings);

    // Assert the expected output
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([{ text: "Hello world!" }]);
    expect(result.decimalAlignPercent).toEqual(50);
    expect(result.textAlignment).toEqual(EditorV3Align.center);
  });

  test("Default style", async () => {
    const div = document.createElement("div");
    div.textContent = "<<Hello world>>";
    div.className = "aiev3-markdown-line";
    const result = readV3MarkdownElement(div, defaultMarkdownSettings);

    expect(result.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "Hello world", style: "defaultStyle" },
    ]);
  });

  test("Empty div", async () => {
    // Create a mock HTMLDivElement with no innerText
    const div = document.createElement("div");
    div.className = "aiev3-markdown-line";

    // Call the function
    const result = readV3MarkdownElement(div, defaultMarkdownSettings);

    // Assert the expected output
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([{ text: "" }]);
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
    const result = readV3MarkdownElement(div, defaultMarkdownSettings);

    // Assert the expected output
    expect(result.textBlocks.map((tb) => tb.data)).toEqual([
      { text: "hello", style: "st1" },
      { text: " world " },
      { text: "annoyed", style: "st2" },
    ]);
  });
});
