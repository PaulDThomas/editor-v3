interface Item {
  country: string;
  name: string;
  dialing_code: string;
  national_animal: string;
}

export async function loadAvailableItems(typedString: string): Promise<string[]> {
  try {
    if (typedString.length < 2) return [];
    if (typedString.includes("qq")) throw new Error("No Q");
    const request = await fetch("http://localhost:3003/public/availableAtItems.json");
    const response = (await request.json()) as Item[];
    return response
      .filter(
        (item) =>
          item.name.toLowerCase().includes(typedString.slice(1).toLowerCase()) ||
          item.country.toLowerCase().includes(typedString.slice(1).toLowerCase()),
      )
      .map((item) => `${item.name} (${item.country})`);
  } catch (error) {
    throw new Error("Failed to load available items: " + error);
  }
}
