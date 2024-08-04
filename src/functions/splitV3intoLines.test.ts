import { IEditorV3 } from "../classes";
import { splitV3intoLines } from "./splitV3intoLines";

describe("Split V3 into lines", () => {
  test("Standard check", async () => {
    const text: IEditorV3 = {
      lines: [
        { textBlocks: [{ text: "Once" }] },
        { textBlocks: [{ text: "Upon" }] },
        { textBlocks: [{ text: "a" }] },
        { textBlocks: [{ text: "time" }] },
      ],
    };

    const result = splitV3intoLines(text);

    expect(result).toEqual([
      { lines: [{ textBlocks: [{ text: "Once" }] }] },
      { lines: [{ textBlocks: [{ text: "Upon" }] }] },
      { lines: [{ textBlocks: [{ text: "a" }] }] },
      { lines: [{ textBlocks: [{ text: "time" }] }] },
    ]);
  });
});
