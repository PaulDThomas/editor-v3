export const renderMoreItems = (dropdownUl: HTMLUListElement, moreNumber: number) => {
  const atSpan = document.createElement("li");
  atSpan.classList.add("aiev3-more-items");
  atSpan.textContent = `...${moreNumber} more`;
  dropdownUl.appendChild(atSpan);
};
