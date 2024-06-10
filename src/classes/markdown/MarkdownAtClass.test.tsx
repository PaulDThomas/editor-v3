import { MarkdownAtClass } from "./MarkdownAtClass";

describe("Test MarkdownAtClass", () => {
  test("Initial contrustor, very basic", async () => {
    const testMAC = new MarkdownAtClass({ text: "@text" });
    expect(testMAC).toBeInstanceOf(MarkdownAtClass);
    expect(testMAC.data).toEqual({
      text: "@text",
      startTag: "@[",
      nameEndTag: "::",
      endTag: "@]",
    });
    expect(testMAC.toMarkdown()).toBe("@[@text@]");
    // Self creation
    expect(new MarkdownAtClass(testMAC.data)).toEqual(testMAC);
    const testMACRev = new MarkdownAtClass();
    testMACRev.fromMarkdown(testMAC.toMarkdown());
    expect(testMACRev).toEqual(testMAC);
    // Update style
    testMAC.style = "st1";
    expect(testMAC.style).toBe("st1");
    testMAC.text = "newText";
    expect(testMAC.text).toBe("newText");
    expect(testMAC.data).toEqual({
      text: "newText",
      style: "st1",
      startTag: "@[",
      nameEndTag: "::",
      endTag: "@]",
    });
    expect(testMAC.toMarkdown()).toBe("@[st1::newText@]");
  });

  test("Initial contrustor with style", async () => {
    const testMAC = new MarkdownAtClass({ text: "@text", style: "st1" });
    expect(testMAC).toBeInstanceOf(MarkdownAtClass);
    expect(testMAC.text).toBe("@text");
    expect(testMAC.style).toBe("st1");
    expect(testMAC.data).toEqual({
      text: "@text",
      style: "st1",
      startTag: "@[",
      nameEndTag: "::",
      endTag: "@]",
    });
    expect(testMAC.toMarkdown()).toBe("@[st1::@text@]");
    // Update content
    testMAC.text = "@moreContent";
    expect(testMAC.style).toBe("st1");
    expect(testMAC.text).toBe("@moreContent");
    expect(testMAC.data).toEqual({
      text: "@moreContent",
      style: "st1",
      startTag: "@[",
      nameEndTag: "::",
      endTag: "@]",
    });
    expect(testMAC.toMarkdown()).toBe("@[st1::@moreContent@]");
    // Self creation
    expect(new MarkdownAtClass(testMAC.data)).toEqual(testMAC);
    const testMACRev = new MarkdownAtClass();
    testMACRev.fromMarkdown(testMAC.toMarkdown());
    expect(testMACRev).toEqual(testMAC);
    const testMACBlock = testMAC.toTextBlock();
    expect(testMACBlock.data).toEqual({
      text: "@moreContent",
      style: "st1",
      type: "at",
    });
  });

  test("Create from good markdown", async () => {
    const testMAC = new MarkdownAtClass();
    testMAC.fromMarkdown("@[@moreContent@]");
    expect(testMAC.style).toBe(undefined);
    expect(testMAC.text).toBe("@moreContent");
    expect(testMAC.data).toEqual({
      text: "@moreContent",
      startTag: "@[",
      nameEndTag: "::",
      endTag: "@]",
    });
    expect(testMAC.toMarkdown()).toBe("@[@moreContent@]");
  });
});

describe("Test MarkdownAtClass errors", () => {
  test("Bad markdown in function", async () => {
    expect(() => {
      const testMAC = new MarkdownAtClass();
      testMAC.fromMarkdown("@[@moreContent");
    }).toThrow();
    expect(() => {
      const testMAC = new MarkdownAtClass();
      testMAC.fromMarkdown("@moreContent@");
    }).toThrow();
    expect(() => {
      const testMAC = new MarkdownAtClass();
      testMAC.fromMarkdown("[@@moreContent@]");
    }).toThrow();
    expect(() => {
      const testMAC = new MarkdownAtClass();
      testMAC.fromMarkdown("@[@moreContent@] ");
    }).toThrow();
    expect(() => {
      const testMAC = new MarkdownAtClass();
      testMAC.fromMarkdown(" @[@moreContent@]");
    }).toThrow();
  });
});
