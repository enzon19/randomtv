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
    fetch(`https://randomtv.enzon19.com/pickItem?username=${message.username}&list_id=${message.listId}&type=${message.filterType}&is_watchlist=${+message.isWatchlist}`).then(async response => {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'serverResponse',
        response: await response.json(),
        status: response.status
      })
    }).catch(error => {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'serverError',
        error: error
      })
    });
  }
})