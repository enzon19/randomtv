'use strict';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == "install") {
    const defaultValues = await (await fetch(chrome.runtime.getURL("/assets/defaultSettings.json"))).json();
    await chrome.storage.sync.set(defaultValues);
    chrome.runtime.setUninstallURL('https://randomtv.enzon19.com/uninstall');
  } else if (details.reason == "update") {
    chrome.tabs.create({
      url: "/html/updated.html",
    });
  }
});