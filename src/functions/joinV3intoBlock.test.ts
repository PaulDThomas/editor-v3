import { joinV3intoBlock } from "./joinV3intoBlock";
import { IEditorV3 } from "../classes/interface";

describe("Join V3 into block", () => {
  test("Standard check", () => {
    const lines: IEditorV3[] = [
      { lines: [{ textBlocks: [{ text: "line1" }] }] },
      { lines: [{ textBlocks: [{ text: "line2" }] }] },
    ];
    const result = joinV3intoBlock(lines);
    expect(result).toEqual({
      lines: [{ textBlocks: [{ text: "line1" }] }, { textBlocks: [{ text: "line2" }] }],
    });
  });
});
