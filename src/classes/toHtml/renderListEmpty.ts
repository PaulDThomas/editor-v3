export const renderListEmpty = (dropdownUl: HTMLUListElement) => {
  const noItems = document.createElement("li");
  noItems.classList.add("aiev3-at-no-items");
  noItems.textContent = "No items found";
  dropdownUl.appendChild(noItems);
};
