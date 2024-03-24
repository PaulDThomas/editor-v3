import { EditorV3Align } from "../classes/interface";
import { textBlockFactory } from "../classes/textBlockFactory";
import { readV3DivElement } from "./readV3DivElement";

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

    expect(result.textBlocks).toEqual([
      textBlockFactory({ text: "123." }),
      textBlockFactory({ text: "45" }),
    ]);
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
      textBlockFactory({ text: "Hello" }),
      textBlockFactory({ text: "World" }),
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
    expect(result.textBlocks).toEqual([textBlockFactory({ text: "123." })]);
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
    expect(result.textBlocks).toEqual([
      textBlockFactory({ text: "123." }),
      textBlockFactory({ text: "45" }),
    ]);
    expect(result.decimalAlignPercent).toEqual(60);
    expect(result.textAlignment).toEqual(EditorV3Align.right);
  });

  test("Read empty div element", async () => {
    const divElement = document.createElement("div");

    const result = readV3DivElement(divElement);

    expect(result.textBlocks).toEqual([textBlockFactory({ text: "" })]);
    expect(result.decimalAlignPercent).toEqual(60);
    expect(result.textAlignment).toEqual(EditorV3Align.left);
  });

  test("Read div containing at block", async () => {
    const divElement = document.createElement("div");
    divElement.classList.add("aiev3-line", "left");

    const atBlock = document.createElement("span");
    atBlock.classList.add("aiev3-tb", "at-block");
    atBlock.dataset.type = "at";
    atBlock.dataset.isLocked = "true";
    atBlock.dataset.email = "some@email";
    const atBlockText = document.createTextNode("at");
    atBlock.appendChild(atBlockText);
    divElement.appendChild(atBlock);

    const result = readV3DivElement(divElement);

    expect(result.textBlocks[0].data).toEqual({
      text: "at",
      type: "at",
      isLocked: true,
      atData: { email: "some@email" },
    });
  });
});

describe("Read in multiple space text blocks", () => {
  test("Read in non-breaking spaces only", () => {
    const div = document.createElement("div");
    div.classList.add("aiev3-line", "left");
    div.innerHTML =
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb">&nbsp;</span>` +
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb">&nbsp;</span>` +
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb">&nbsp;</span>`;
    const ret = readV3DivElement(div);
    expect(ret.textBlocks.map((tb) => tb.text).join("")).toEqual("   ");
    expect(ret.textBlocks.length).toBe(3);
  });

  test("Read in non-breaking and normal spaces", () => {
    const div = document.createElement("div");
    div.classList.add("aiev3-line", "left");
    div.innerHTML =
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb">&nbsp; </span>` +
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb"> &nbsp;</span>` +
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb">&nbsp; </span>`;
    const ret = readV3DivElement(div);
    expect(ret.textBlocks.map((tb) => tb.text).join("")).toEqual("      ");
    expect(ret.textBlocks.length).toBe(3);
  });

  test("Read text with spaces", () => {
    const div = document.createElement("div");
    div.classList.add("aiev3-line", "left");
    div.innerHTML =
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb is-active">0&nbsp;</span><span class="aiev3-tb is-active">&nbsp;</span>` +
      // eslint-disable-next-line quotes
      `<span class="aiev3-tb is-active">&nbsp;</span><span class="aiev3-tb is-active">world</span>`;
    const ret = readV3DivElement(div);
    expect(ret.textBlocks.map((tb) => tb.text).join("")).toEqual("0   world");
    expect(ret.textBlocks.length).toBe(4);
  });
});
