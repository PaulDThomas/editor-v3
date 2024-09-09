import { stopDragOnto } from "./stopDragOnto";

describe("stopDragOnto", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);
    stopDragOnto(el);
  });

  test("should prevent default and set dropEffect to none on dragover", () => {
    const event = new Event("dragover", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: { dropEffect: "move" },
    });

    el.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect((event as DragEvent).dataTransfer!.dropEffect).toBe("none");
    expect(el.style.cursor).toBe("not-allowed");
  });

  test("should reset cursor on dragleave", () => {
    const dragleaveEvent = new Event("dragleave", { bubbles: true, cancelable: true });

    el.dispatchEvent(dragleaveEvent);

    expect(el.style.cursor).toBe("default");
  });

  test("should prevent default and stop propagation on drop", () => {
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });

    const stopPropagationSpy = jest.spyOn(dropEvent, "stopPropagation");

    el.dispatchEvent(dropEvent);

    expect(dropEvent.defaultPrevented).toBe(true);
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(el.style.cursor).toBe("default");
  });
});
