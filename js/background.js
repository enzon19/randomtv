chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == "install") {
    const defaultValues = {
      displayType: "modal",
      showMethod: false,
      defaultMethod: "api",
    };
    await chrome.storage.sync.set(defaultValues);

    chrome.runtime.setUninstallURL("https://randomtv.enzon19.com/uninstall");
  } else if (details.reason == "update") {
    chrome.tabs.create({
      url: "/html/updated.html",
    });
  }
});

chrome.runtime.onMessage.addListener(
  async ({ action, username, route, type }, sender) => {
    /* 
      https://api.trakt.tv/users/id/ | lists/list_id/items | /type/sort_by/sort_how
      https://api.trakt.tv/users/id/ | watchlist | /type/sort_by/sort_how
      https://api.trakt.tv/users/id/ | favorites | /type/sort_by/sort_how (recommendations)
    */

    if (action == "apiRequest") {
      try {
        let apiKey =
          (await chrome.storage.sync.get("apiKey"))?.apiKey ||
          "009ac196a9311ba017007c49ef8634fb0cf98828b2f5fb1d3e4f56f6a8a28c84";
        const request = await fetch(
          `https://api.trakt.tv/users/${username}/${route}${type ? `/${type}` : ""}/?extended=images`,
          {
            headers: {
              "Content-Type": "application/json",
              "trakt-api-version": "2",
              "trakt-api-key": apiKey,
            },
          }
        );
        if (request.status !== 200) throw request;
        const response = await request.json();

        chrome.tabs.sendMessage(sender.tab.id, {
          action: "apiResponse",
          response,
          status: response.status,
        });
      } catch (error) {
        console.error("API METHOD FAILED:", error);

        chrome.tabs.sendMessage(sender.tab.id, {
          action: "apiError",
          status: error?.status || "500",
        });
      }
    }
  }
);
