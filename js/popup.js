'use strict';

async function updateSettings() {
  const options = ['displayType'];
  const checkboxes = ['showMethod', 'disableAPI'];
  const data = await chrome.storage.sync.get([...options, ...checkboxes]);

  options.forEach(option => {
    for (const element of document.getElementsByClassName(option)) {
      element.addEventListener('click', () => setOption(option, element.id));
    }
    applyEffectOnOption(option, `${option}-${data[option]}`);
  });
  
  checkboxes.forEach(checkbox => {
    const checkboxElement = document.getElementById(checkbox);
    checkboxElement.checked = data[checkbox];
    checkboxElement.addEventListener('click', () => setCheckbox(checkbox));
  });
}

function applyEffectOnOption(option, elementId) {
  for (const element of document.getElementsByClassName(option + "-applied")) {
    element.classList.remove(option + "-applied")
  }
  const optionElement = document.getElementById(elementId);
  optionElement.classList.add(option + "-applied");
}

function setOption(option, elementId) {
  const optionElement = document.getElementById(elementId);
  let newData = {};
  newData[elementId.split("-")[0]] = elementId.split("-")[1];
  console.log(newData)
  chrome.storage.sync.set(newData);
  applyEffectOnOption(option, elementId);
}

function setCheckbox(elementId) {
  const checkboxElement = document.getElementById(elementId);
  let newData = {};
  newData[elementId] = checkboxElement.checked;
  chrome.storage.sync.set(newData);
}

updateSettings(); 