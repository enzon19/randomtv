const radiosNames = ["displayType", "defaultMethod"];
const checkboxesNames = ["showMethod"];
const textsInputsNames = ["apiKey"];

async function updateSettings() {
  const data = await chrome.storage.sync.get([
    ...radiosNames,
    ...checkboxesNames,
    ...textsInputsNames,
  ]);

  for (const radioName of radiosNames) {
    const radio = document.querySelector(
      `input[name="${radioName}"][value="${data?.[radioName]}"]`
    );
    if (radio && data?.[radioName]) radio.checked = true;
  }

  for (const checkboxName of checkboxesNames) {
    const checkbox = document.querySelector(`input[name="${checkboxName}"]`);
    if (checkbox && data?.[checkboxName])
      checkbox.checked = data?.[checkboxName];
  }

  for (const textInputName of textsInputsNames) {
    const input = document.querySelector(`input[name="${textInputName}"]`);
    if (input && data?.[textInputName]) input.value = data?.[textInputName];
  }
}

updateSettings();
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("change", async (event) => {
    console.log(event.target);
    const prop = event.target.type === "checkbox" ? "checked" : "value";
    chrome.storage.sync.set({ [event.target.name]: event.target[prop] });
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const textInputs = Array.from(
      event.target.querySelectorAll("input[type=text]")
    );
    for (const input of textInputs) {
      chrome.storage.sync.set({ [input.name]: input.value.substring(0, 250) });
    }
  });
});
