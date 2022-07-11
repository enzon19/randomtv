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

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action == 'serverRequest') {
    fetch(message.urlToRequest).then(response => {
      chrome.tabs.sendMessage({
        tabId: sender.tab.id,
        message: {
          action: 'serverResponse',
          response: response
        }
      })
    }).catch(error => {
      chrome.tabs.sendMessage({
        tabId: sender.tab.id,
        message: {
          action: 'serverError',
          error: error
        }
      })
    });
  }
})