document.querySelectorAll("[id]").forEach((e) => {
  let property = "innerHTML"
  if (e.nodeName == "IMG") property = "src"

  const translation = chrome.i18n.getMessage(e.id);
  if (translation) e[property] = translation;
});