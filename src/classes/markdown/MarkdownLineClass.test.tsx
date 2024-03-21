import { MarkdownAtClass } from "./MarkdownAtClass";
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
    expect(testMLC.toTextBlocks().map((tb) => tb.data)).toEqual([{ text: "test", type: "text" }]);
    // Self creation
    expect(new MarkdownLineClass(testMLC.data).data).toEqual(testMLC.data);
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
      { style: "st1", text: "test1", type: "text" },
      { text: "test2", type: "text" },
      { style: "st2", text: "test3", type: "text" },
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

  test("Long style", async () => {
    const mdstring = "<<st1::Hello large world person>> pie hollding @[shiny::@chicken@]   ";
    const testMLC = new MarkdownLineClass({
      line: mdstring,
    });
    expect(testMLC.data).toEqual({
      parts: [
        new MarkdownStyleClass({
          text: "Hello large world person",
          style: "st1",
          startTag: "<<",
          endTag: ">>",
          nameEndTag: "::",
        }),
        " pie hollding ",
        new MarkdownAtClass({
          text: "@chicken",
          style: "shiny",
          startTag: "@[",
          endTag: "@]",
          nameEndTag: "::",
        }),
        "   ",
      ],
      markdownSettings: defaultMarkdownSettings,
    });
    expect(testMLC.markdownText).toEqual(mdstring);
    expect(testMLC.toTextBlocks().map((tb) => tb.data)).toEqual([
      { style: "st1", text: "Hello large world person", type: "text" },
      { text: " pie hollding ", type: "text" },
      { style: "shiny", text: "@chicken", type: "at", atData: {} },
      { text: "   ", type: "text" },
    ]);
  });
});
