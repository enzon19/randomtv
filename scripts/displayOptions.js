const option = 'displayType';

function applyEffectOnOption(option, elementId) {
  for (const element of document.getElementsByClassName(option + "-applied")) {
    element.classList.remove(option + "-applied")
  }
  const optionElement = document.getElementById(elementId);
  optionElement.classList.add(option + "-applied");
}

function setOption(option, elementId) {
  document.getElementById("previewOption").src = "assets/displayOptions/results/" + elementId.split("-")[1] + ".png";
  applyEffectOnOption(option, elementId);
}

for (const element of document.getElementsByClassName(option)) {
  element.addEventListener('click', () => setOption(option, element.id));
}