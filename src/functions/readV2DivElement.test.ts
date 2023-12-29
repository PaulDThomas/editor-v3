import { readV2DivElement } from "./readV2DivElement";

describe("readV2DivElement", () => {
  test("Read basic div element", async () => {
    const template = document.createElement("template");
    template.innerHTML =
      '<div classname="aie-text" data-key="3fsuc" data-type="unstyled" data-inline-style-ranges=\'[{"offset":32,"length":9,"style":"Optional"}]\'>[b] CR, non-measurable disease: <span classname="Optional" style="color:seagreen">Confirmed</span> CR response but subject has non-measurable disease at baseline.</div>';
    const result = readV2DivElement(template.content.children[0] as HTMLDivElement);
    expect(result.textBlocks.length).toEqual(3);
    expect(result.textBlocks[0].data).toEqual({
      style: undefined,
      text: "[b] CR, non-measurable disease: ",
    });
    expect(result.textBlocks[1].data).toEqual({
      style: "Optional",
      text: "Confirmed",
    });
    expect(result.textBlocks[2].data).toEqual({
      style: undefined,
      text: " CR response but subject has non-measurable disease at baseline.",
    });
  });

  test("Read made up element with no style", async () => {
    const template = document.createElement("template");
    template.innerHTML =
      '<div classname="aie-text" data-key="3fsuc" data-type="unstyled">[b] CR, non-measurable disease: <span class="style-optional" style="color:seagreen">Confirmed</span> CR response but subject has non-measurable disease at baseline.</div>';
    const result = readV2DivElement(template.content.children[0] as HTMLDivElement);
    expect(result.textBlocks.length).toEqual(3);
    expect(result.textBlocks[0].data).toEqual({
      style: undefined,
      text: "[b] CR, non-measurable disease: ",
    });
    expect(result.textBlocks[1].data).toEqual({
      style: undefined,
      text: "Confirmed",
    });
    expect(result.textBlocks[2].data).toEqual({
      style: undefined,
      text: " CR response but subject has non-measurable disease at baseline.",
    });
  });

  test("Read empty string", async () => {
    const template = document.createElement("template");
    template.innerHTML = '<div classname="aie-text" data-key="3fsuc" data-type="unstyled"></div>';
    const result = readV2DivElement(template.content.children[0] as HTMLDivElement);
    expect(result.textBlocks.length).toEqual(1);
    expect(result.textBlocks[0].data).toEqual({
      style: undefined,
      text: "",
    });
  });

  test("Read small uncharactieristic span", async () => {
    const template = document.createElement("template");
    template.innerHTML =
      '<div classname="aie-text" data-key="3fsuc" data-type="unstyled"><span>Hello world!</span></div>';
    const result = readV2DivElement(template.content.children[0] as HTMLDivElement);
    expect(result.textBlocks.length).toEqual(1);
    expect(result.textBlocks[0].data).toEqual({
      style: undefined,
      text: "Hello world!",
    });
  });
});
