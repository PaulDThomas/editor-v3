import { getObjectDiff } from "./getObjectDiff";

describe("getObjectDiff", () => {
  test("Not an object", async () => {
    const obj1 = null;
    const obj2 = { hello: "world" };

    const result1 = getObjectDiff(obj1, obj1);
    expect(result1).toBeUndefined();
    const result2 = getObjectDiff(obj1, obj2);
    expect(result2).toEqual([null, { hello: "world" }]);
  });

  it("should return undefined when objects are equal", () => {
    const obj1 = { name: "John", age: 30 };
    const obj2 = { name: "John", age: 30 };

    const result = getObjectDiff(obj1, obj2);

    expect(result).toBeUndefined();
  });

  it("should return the differences between two objects", () => {
    const obj1 = { name: "John", age: 30 };
    const obj2 = { name: "John", age: 35 };

    const result = getObjectDiff(obj1, obj2);

    expect(result).toEqual({ age: [30, 35] });
  });

  it("should handle nested objects", () => {
    const obj1 = { name: "John", address: { city: "New York", country: "USA" } };
    const obj2 = { name: "John", address: { city: "Los Angeles", country: "USA" } };

    const result = getObjectDiff(obj1, obj2);

    expect(result).toEqual({ address: { city: ["New York", "Los Angeles"] } });
  });
});
