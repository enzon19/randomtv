chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == "install") {
    const defaultValues = await (await fetch(chrome.runtime.getURL("/data/defaultSettings.json"))).json();
    await chrome.storage.sync.set(defaultValues);
    chrome.tabs.create({
      url: "/pages/welcome.html",
    });
    chrome.runtime.setUninstallURL('https://qrm.enzon19.com/uninstall');
  } else if (details.reason == "update") {
    chrome.tabs.create({
      url: "/pages/updated.html",
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      message: 'urlChangeded',
      url: changeInfo.url
    });
  }
});