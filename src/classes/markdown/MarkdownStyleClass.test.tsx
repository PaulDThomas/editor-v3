import { MarkdownStyleClass } from "./MarkdownStyleClass";

describe("Test MarkdownStyleClass", () => {
  test("Initial contrustor, very basic", async () => {
    const testMSC = new MarkdownStyleClass({ text: "test" });
    expect(testMSC).toBeInstanceOf(MarkdownStyleClass);
    expect(testMSC.style).toBe("defaultStyle");
    expect(testMSC.text).toBe("test");
    expect(testMSC.data).toEqual({
      text: "test",
      style: "defaultStyle",
      isDefault: true,
      startTag: "<<",
      nameEndTag: "::",
      endTag: ">>",
    });
    expect(testMSC.toMarkdown()).toBe("<<test>>");
    // Self creation
    expect(new MarkdownStyleClass(testMSC.data)).toEqual(testMSC);
    const testMSCRev = new MarkdownStyleClass();
    testMSCRev.fromMarkdown(testMSC.toMarkdown());
    expect(testMSCRev).toEqual(testMSC);
    // Update style
    testMSC.style = "st1";
    expect(testMSC.style).toBe("st1");
    expect(testMSC.text).toBe("test");
    expect(testMSC.data).toEqual({
      text: "test",
      style: "st1",
      isDefault: false,
      startTag: "<<",
      nameEndTag: "::",
      endTag: ">>",
    });
    expect(testMSC.toMarkdown()).toBe("<<st1::test>>");
  });

  test("Initial contrustor with style", async () => {
    const testMSC = new MarkdownStyleClass({ text: "test", style: "st1" });
    expect(testMSC).toBeInstanceOf(MarkdownStyleClass);
    expect(testMSC.style).toBe("st1");
    expect(testMSC.text).toBe("test");
    expect(testMSC.data).toEqual({
      text: "test",
      style: "st1",
      isDefault: false,
      startTag: "<<",
      nameEndTag: "::",
      endTag: ">>",
    });
    expect(testMSC.toMarkdown()).toBe("<<st1::test>>");
    // Update contest
    testMSC.text = "moreContent";
    expect(testMSC.style).toBe("st1");
    expect(testMSC.text).toBe("moreContent");
    expect(testMSC.data).toEqual({
      text: "moreContent",
      style: "st1",
      isDefault: false,
      startTag: "<<",
      nameEndTag: "::",
      endTag: ">>",
    });
    expect(testMSC.toMarkdown()).toBe("<<st1::moreContent>>");
    // Self creation
    expect(new MarkdownStyleClass(testMSC.data)).toEqual(testMSC);
    const testMSCRev = new MarkdownStyleClass();
    testMSCRev.fromMarkdown(testMSC.toMarkdown());
    expect(testMSCRev).toEqual(testMSC);
    const testMSCBlock = testMSC.toTextBlock();
    expect(testMSCBlock.data).toEqual({
      text: "moreContent",
      style: "st1",
    });
  });

  test("Bad markdown in constructor", async () => {
    const testMSC = new MarkdownStyleClass();
    expect(() => testMSC.fromMarkdown("<<test")).toThrow();
    expect(() => testMSC.fromMarkdown("test>>")).toThrow();
    expect(() => testMSC.fromMarkdown(">>test<<")).toThrow();
    expect(() => testMSC.fromMarkdown("<<test>> ")).toThrow();
    expect(() => testMSC.fromMarkdown(" <<test>>")).toThrow();
  });
});
