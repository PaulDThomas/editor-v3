// For when something goes wrong
export const renderListError = (dropdownUl: HTMLUListElement) => {
  dropdownUl.innerHTML = "";
  const errorItem = document.createElement("li");
  errorItem.classList.add("aiev3-at-items-error");
  errorItem.textContent = "Error fetching list";
  errorItem.style.color = "red";
  dropdownUl.appendChild(errorItem);
};
