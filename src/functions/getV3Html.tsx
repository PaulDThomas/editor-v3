export const getV3Html = (text: string): string => {
  // Check if JSON input
  // Do nothing if there is nothing to do
  if (!text.includes('classname')) return text;
  // Create element so you can read the things
  const d = document.createElement('div');
  d.innerHTML = text;
  // Any style info will have been in the first child dataset
  if ((d.children[0] as HTMLDivElement).dataset.inlineStyleRanges) {
    // Get the inline style range, but only interested in the style name
    // const isr = JSON.parse((d.children[0] as HTMLDivElement).dataset.inlineStyleRanges ?? '[]');
    // Add the style name
  }
  return d.textContent ?? '';
};
