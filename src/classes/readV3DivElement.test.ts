import { readV3DivElement } from "./readV3DivElement";
import { EditorV3Align } from "./interface";
import { EditorV3TextBlock } from "./EditorV3TextBlock";

describe("readV3DivElement", () => {
  test("Read decimal aligned div element", async () => {
    const divElement = document.createElement("div");
    divElement.classList.add("aiev3-line", "decimal");

    const lhsSpan = document.createElement("span");
    lhsSpan.classList.add("aiev3-span-point", "lhs");
    lhsSpan.style.minWidth = "40%";
    const lhsText = document.createTextNode("123.");
    lhsSpan.appendChild(lhsText);
    divElement.appendChild(lhsSpan);

    const rhsSpan = document.createElement("span");
    rhsSpan.classList.add("aiev3-span-point", "rhs");
    rhsSpan.style.minWidth = "60%";
    const rhsText = document.createTextNode("45");
    rhsSpan.appendChild(rhsText);
    divElement.appendChild(rhsSpan);

    const result = readV3DivElement(divElement);

    expect(result.textBlocks).toEqual([new EditorV3TextBlock("123."), new EditorV3TextBlock("45")]);
    expect(result.decimalAlignPercent).toEqual(40);
    expect(result.textAlignment).toEqual(EditorV3Align.decimal);
  });

  test("Read standard aligned div element", async () => {
    const divElement = document.createElement("div");
    divElement.classList.add("aiev3-line", "right");

    const span1 = document.createElement("span");
    const text1 = document.createTextNode("Hello");
    span1.appendChild(text1);
    divElement.appendChild(span1);

    const span2 = document.createElement("span");
    const text2 = document.createTextNode("World");
    span2.appendChild(text2);
    divElement.appendChild(span2);

    const result = readV3DivElement(divElement);

    expect(result.textBlocks).toEqual([
      new EditorV3TextBlock("Hello"),
      new EditorV3TextBlock("World"),
    ]);
    expect(result.decimalAlignPercent).toEqual(60);
    expect(result.textAlignment).toEqual(EditorV3Align.right);
  });

  test("Read bad decimal aligned div element", async () => {
    const divElement = document.createElement("div");
    divElement.classList.add("aiev3-line", "decimal");
    const text1 = document.createTextNode("123.");
    divElement.appendChild(text1);

    const result = readV3DivElement(divElement);
    expect(result.textBlocks).toEqual([new EditorV3TextBlock("123.")]);
    expect(result.decimalAlignPercent).toEqual(60);
    expect(result.textAlignment).toEqual(EditorV3Align.decimal);
  });

  test("Read bad standard aligned div element", async () => {
    const divElement = document.createElement("div");
    divElement.classList.add("aiev3-line", "right");
    const text1 = document.createTextNode("123.");
    divElement.appendChild(text1);
    const node2 = document.createElement("span");
    const text2 = document.createTextNode("45");
    node2.appendChild(text2);
    divElement.appendChild(node2);

    const result = readV3DivElement(divElement);
    expect(result.textBlocks).toEqual([new EditorV3TextBlock("123."), new EditorV3TextBlock("45")]);
    expect(result.decimalAlignPercent).toEqual(60);
    expect(result.textAlignment).toEqual(EditorV3Align.right);
  });

  test("Read empty div element", async () => {
    const divElement = document.createElement("div");

    const result = readV3DivElement(divElement);

    expect(result.textBlocks).toEqual([new EditorV3TextBlock("")]);
    expect(result.decimalAlignPercent).toEqual(60);
    expect(result.textAlignment).toEqual(EditorV3Align.left);
  });
});
