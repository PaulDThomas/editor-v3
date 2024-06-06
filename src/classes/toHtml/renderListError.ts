// For when something goes wrong
export const renderListError = (dropdownUl: HTMLUListElement) => {
  dropdownUl.innerHTML = "";
  const errorItem = document.createElement("li");
  errorItem.classList.add("aiev3-drop-items-error");
  errorItem.textContent = "Error fetching list";
  dropdownUl.appendChild(errorItem);
};
