import { setCaretPosition } from "./setCaretPosition";
import * as gc from "./getCaretPosition";
import { EditorV3PositionClass } from "../classes/EditorV3Position";

describe("Test setCaretPosition, null return tests", () => {
  test("Set caret position for non-HTMLDivElement", () => {
    // Mock the element
    const el = document.createElement("span");

    // Call the setCaretPosition function
    const ret = setCaretPosition(el, new EditorV3PositionClass(1, 1, 1, 1, [], []));

    // Assert the expected output
    expect(ret).toBeNull();
  });

  test("Set caret position for HTMLDivElement with getCaretPosition returning null", () => {
    // Mock the HTMLDivElement
    const el = document.createElement("div");

    // Mock the getCaretPosition function
    jest.spyOn(gc, "getCaretPosition").mockReturnValue(null);

    // Call the setCaretPosition function
    const ret = setCaretPosition(el, new EditorV3PositionClass(1, 1, 1, 1, [], []));

    // Assert the expected output
    expect(ret).toBeNull();

    // Restore the getCaretPosition function
    jest.restoreAllMocks();
  });
});
