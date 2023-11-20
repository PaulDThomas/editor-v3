import { MarkdownLineClass } from "./MarkdownLineClass";
import { IMarkdownSettings, defaultMarkdownSettings } from "./MarkdownSettings";
import { MarkdownStyleClass } from "./MarkdownStyleClass";

describe("Test MarkdownLineClass", () => {
  test("Initial constructor, very basic", async () => {
    const testMLC = new MarkdownLineClass({ line: "test" });
    expect(testMLC).toBeInstanceOf(MarkdownLineClass);
    expect(testMLC.markdownText).toBe("test");
    expect(testMLC.data).toEqual({
      parts: ["test"],
      markdownSettings: defaultMarkdownSettings,
    });
    expect(testMLC.markdownText).toBe("test");
    expect(testMLC.toTextBlocks().map((tb) => tb.data)).toEqual([{ text: "test" }]);
    // Self creation
    expect(new MarkdownLineClass(testMLC.data)).toEqual(testMLC);
  });

  test("Initial constructor with style", async () => {
    const testMLC = new MarkdownLineClass({ line: "<<st1::test>>" });
    expect(testMLC).toBeInstanceOf(MarkdownLineClass);
    expect(testMLC.data).toEqual({
      parts: [
        new MarkdownStyleClass({
          text: "test",
          style: "st1",
          startTag: "<<",
          endTag: ">>",
          nameEndTag: "::",
        }),
      ],
      markdownSettings: defaultMarkdownSettings,
    });
    expect(testMLC.markdownText).toBe("<<st1::test>>");
  });

  test("Check nothing", async () => {
    const testMLC = new MarkdownLineClass();
    expect(testMLC).toBeInstanceOf(MarkdownLineClass);
    expect(testMLC.markdownText).toBe("");
  });

  test("Initial constructor with multiple styles", async () => {
    const testMSC = new MarkdownLineClass({ line: "<<st1::test1>>test2<<st2::test3>>" });
    expect(testMSC).toBeInstanceOf(MarkdownLineClass);
    expect(testMSC.markdownText).toBe("<<st1::test1>>test2<<st2::test3>>");
    expect(testMSC.data).toEqual({
      parts: [
        new MarkdownStyleClass({
          text: "test1",
          style: "st1",
          startTag: "<<",
          endTag: ">>",
          nameEndTag: "::",
        }),
        "test2",
        new MarkdownStyleClass({
          text: "test3",
          style: "st2",
          startTag: "<<",
          endTag: ">>",
          nameEndTag: "::",
        }),
      ],
      markdownSettings: defaultMarkdownSettings,
    });
    expect(testMSC.toTextBlocks().map((tb) => tb.data)).toEqual([
      { style: "st1", text: "test1" },
      { text: "test2" },
      { style: "st2", text: "test3" },
    ]);
  });

  test("Initial constructor with custom markdown settings", async () => {
    const customMarkdownSettings: IMarkdownSettings = {
      ...defaultMarkdownSettings,
      styleStartTag: "[[",
      styleEndTag: "]]",
      styleNameEndTag: "!!",
    };
    const testMSC = new MarkdownLineClass({
      line: "[[st1!!test]]",
      markdownSettings: customMarkdownSettings,
    });
    expect(testMSC).toBeInstanceOf(MarkdownLineClass);
    expect(testMSC.markdownText).toBe("[[st1!!test]]");
    expect(testMSC.data).toEqual({
      parts: [
        new MarkdownStyleClass({
          text: "test",
          style: "st1",
          startTag: "[[",
          endTag: "]]",
          nameEndTag: "!!",
        }),
      ],
      markdownSettings: customMarkdownSettings,
    });
  });

  test("Lines that are nearly markdown", async () => {
    expect(new MarkdownLineClass({ line: "<<st1::test" }).data).toEqual({
      parts: ["<<st1::test"],
      markdownSettings: defaultMarkdownSettings,
    });
    expect(new MarkdownLineClass({ line: "<st1:test>" }).data).toEqual({
      parts: ["<st1:test>"],
      markdownSettings: defaultMarkdownSettings,
    });
  });
});
