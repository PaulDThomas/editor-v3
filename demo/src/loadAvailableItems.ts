import { EditorV3AtListItem } from "../../src/classes/interface";

interface IAvailableItem extends Record<string, string> {
  country: string;
  name: string;
  dialing_code: string;
  national_animal: string;
}

export async function loadAvailableItems(
  typedString: string,
): Promise<EditorV3AtListItem<IAvailableItem>[]> {
  try {
    if (typedString.length < 2) return [];
    if (typedString.includes("qq")) throw new Error("No Q");
    const url = "http://localhost:3001/public/availableAtItems.json";
    const request = await fetch(url);
    const response = (await request.json()) as {
      country: string;
      name: string;
      dialing_code: string;
      national_animal: string;
    }[];
    return response
      .filter(
        (item) =>
          item.name.toLowerCase().includes(typedString.slice(1).toLowerCase()) ||
          item.country.toLowerCase().includes(typedString.slice(1).toLowerCase()),
      )
      .map((item) => ({ text: `${item.name} (${item.country})`, data: item }));
  } catch (error) {
    throw new Error("Failed to load available items: " + error);
  }
}
