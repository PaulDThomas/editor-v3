import { EditorV3AtListItem } from "../../src/classes/interface";

export async function loadAvailableItems(typedString: string): Promise<
  EditorV3AtListItem<{
    country: string;
    name: string;
    dialing_code: string;
    national_animal: string;
  }>[]
> {
  try {
    if (typedString.length < 2) return [];
    if (typedString.includes("qq")) throw new Error("No Q");
    const request = await fetch("http://localhost:3003/public/availableAtItems.json");
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
