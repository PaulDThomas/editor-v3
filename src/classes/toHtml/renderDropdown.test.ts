import { act } from "react";
import { renderDropdown } from "./renderDropdown";

describe("renderDropdown tests", () => {
  test("Render empty list", async () => {
    const span = document.createElement("span");
    span.classList.add("show-dropdown");
    document.body.appendChild(span);

    renderDropdown(span, "test", {
      atListFunction: jest.fn().mockResolvedValue([]),
    });

    // Wait for the dropdown to be rendered
    await act(async () => jest.runAllTimers());

    const dropdownUl = document.querySelector(".aiev3-dropdown-list");
    expect(dropdownUl).not.toBeNull();
    expect(dropdownUl?.textContent).toBe("No items found");
  });

  test("Dispatch refreshEvent when dropdown item is clicked", async () => {
    const span = document.createElement("span");
    span.classList.add("show-dropdown");
    document.body.appendChild(span);

    renderDropdown(span, "test", {
      atListFunction: jest.fn().mockResolvedValue([{ text: "Item 1" }, { text: "Item 2" }]),
    });

    // Wait for the dropdown to be rendered
    await act(async () => jest.runAllTimers());
    const dropdownUl = document.querySelector(".aiev3-dropdown-list");
    expect(dropdownUl).not.toBeNull();

    // Simulate clicking on a dropdown item
    const dropItem = document.createElement("li");
    dropItem.classList.add("aiev3-drop-item");
    dropItem.textContent = "Item 1";
    dropdownUl?.appendChild(dropItem);

    const refreshEventListener = jest.fn();
    span.addEventListener("editorv3refresh", refreshEventListener);

    dropItem.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    jest.runAllTimers();

    expect(refreshEventListener).toHaveBeenCalled();
    expect(refreshEventListener.mock.calls[0][0].detail.target).toBe(span);
  });

  test("Render more items", async () => {
    const span = document.createElement("span");
    span.classList.add("show-dropdown");
    document.body.appendChild(span);

    renderDropdown(span, "test", {
      atListFunction: jest.fn().mockResolvedValue(Array(15).map((_, i) => ({ text: `Item ${i}` }))),
    });

    await act(async () => jest.runAllTimers());
    const dropdownUlmore = document.querySelector(".aiev3-more-items");
    expect(dropdownUlmore).not.toBeNull();
    expect(dropdownUlmore?.textContent).toBe("...5 more");
  });
});
