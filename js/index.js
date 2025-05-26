function init() {
  if (document.readyState !== "loading") {
    tryAppendingButton();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      tryAppendingButton();
    });
  }
}

document.addEventListener("turbo:load", () => {
  init(); // executado ao navegar pelos links do Trakt
});

init(); // executado ao abrir uma aba

function tryAppendingButton() {
  const currentUrl = window.location.href;
  const supportedURLs =
    /trakt\.tv\/users\/.*?\/(watchlist|favorites|recommendations|collection|ratings|lists\/.*)/;
  if (
    supportedURLs.test(currentUrl) &&
    !document.querySelector("#randomtv-button")
  )
    appendButton(currentUrl);
}

function appendButton(url) {
  // Create the Random button
  const span = document.createElement("span");
  span.className = "fa-thin fa-shuffle";
  span.id = "randomtv-button";
  span.style.position = "relative";
  span.style.cursor = "pointer";

  // Create tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip fade top in";
  tooltip.id = "randomTV-tooltip";
  tooltip.setAttribute("role", "tooltip");

  tooltip.innerHTML = `
    <div class="tooltip-arrow"></div>
    <div class="tooltip-inner" style="font-family: 'Varela Round', 'Helvetica Neue', Helvetica, Arial, sans-serif">
      Random
    </div>
  `;

  // Style the tooltip (as in your CSS)
  tooltip.style.cssText =
    "position:absolute;z-index:1;bottom:100%;left:163%;margin-left:-60px;opacity:0;transition:opacity 0.2s ease;";

  // Show/hide on hover
  span.addEventListener("mouseenter", () => {
    tooltip.style.opacity = "1";
  });
  span.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });

  // Add click behavior
  span.addEventListener("click", async () => {
    if (span.classList.contains("randomTV-loading")) return;

    const { username, apiRoute, filterAndSort } = getParamsFromURL(url);

    const methods = {
      local: pickItemLocally,
      api: pickItemAPI,
    };
    const method = await chooseMethod(filterAndSort);

    methods[method](username, apiRoute, filterAndSort);
  });

  // Append tooltip to span
  span.appendChild(tooltip);

  // Inject into the page
  const target = document.querySelector(".dropdown.filter-dropdown");
  if (target) {
    target.after(span);
  }
}

function getParamsFromURL(url) {
  const params = url.match(
    /.*\/users\/(.*?)\/(watchlist|favorites|lists|recommendations|collection|ratings)(?:\/([^\/\?]+))?(?:\?(.*))?/
  );

  try {
    const username = params[1];
    const type = params[2];
    const filterAndSort = params[4];

    let apiRoute;
    if (type === "lists") {
      apiRoute = `lists/${params[3]}/items`;
    } else {
      apiRoute = type === "recommendations" ? "favorites" : type;
    }

    return {
      username,
      apiRoute,
      filterAndSort: Object.fromEntries(new URLSearchParams(filterAndSort)),
    };
  } catch (e) {
    console.error("Error getting params from URL: ", url, e);
  }
}

async function chooseMethod(filterAndSort) {
  let method =
    (await chrome.storage.sync.get("defaultMethod"))?.defaultMethod || "api";
  if (method === "local") return method;

  // se tiver outras coisas filtrando, adeus!
  if (
    Object.keys(filterAndSort).some(
      (e) => !["sort", "display", "fade", "page"].includes(e)
    )
  )
    method = "local";

  // se não tiver mais de uma página, adeus!
  if (!document.querySelector(".pagination-top").textContent) method = "local";

  return method;
}

function getRandomItem(items) {
  const luckyNumber = Math.floor(Math.random() * items.length);
  return items[luckyNumber];
}

function pickItemLocally() {
  const items = Array.from(document.querySelectorAll(".grid-item")).filter(
    (e) => !e.classList.contains("fanarts")
  );

  if (items.length > 0) {
    const pickedItem = getRandomItem(items);
    const title = pickedItem
      .querySelector("div.poster")
      .getAttribute("data-original-title");
    const subtitle = pickedItem.querySelectorAll("a.titles-link")[1].innerText;
    const url = pickedItem.getAttribute("data-url");
    const cover = pickedItem
      .querySelector("div.poster > img.real")
      .getAttribute("data-original");

    showItem(title, subtitle, url, cover, "Local", pickedItem);
  } else {
    console.error("RandomTV: no item picked");
    alert("No item was found to RandomTV to pick. Sorry.");
  }
}

async function pickItemAPI(username, route, filterAndSort) {
  document.querySelector("#randomtv-button").classList.add("randomTV-loading");

  const type = filterAndSort.display;
  chrome.runtime.sendMessage({
    action: "apiRequest",
    username,
    route,
    type,
  });
}

// finishing the work of pickItemAPI()
chrome.runtime.onMessage.addListener((message) => {
  if (message.action == "apiResponse") {
    const pickedItem = getRandomItem(message.response);
    const pickedItemType = pickedItem.type;
    const pickedItemMetadata = pickedItem[pickedItemType];

    const title =
      pickedItemMetadata.title ||
      pickedItemMetadata.name ||
      "Season " + pickedItemMetadata.number;

    const subtitle = ["season", "episode"].includes(pickedItemType)
      ? pickedItem.show.title
      : undefined;

    let url = "https://trakt.tv/";
    if (pickedItemType === "person") {
      url += "people/" + pickedItemMetadata.ids.slug;
    } else if (pickedItemType === "season") {
      url += `shows/${pickedItem.show.ids.slug}/seasons/${pickedItemMetadata.number}`;
    } else if (pickedItemType === "episode") {
      url += `shows/${pickedItem.show.ids.slug}/seasons/${pickedItemMetadata.season}/episodes/${pickedItemMetadata.number}`;
    } else {
      url += `${pickedItemType}s/${pickedItemMetadata.ids.slug}`;
    }

    const cover =
      "https://" +
      (pickedItemMetadata?.images?.poster?.[0] ||
        pickedItem.show?.images?.poster?.[0] ||
        pickedItemMetadata?.images?.headshot?.[0]);

    const element = document.querySelector(
      `[data-list-item-id="${pickedItem.id}"]`
    );

    showItem(title, subtitle, url, cover, "API", element);
  } else if (message.action == "apiError") {
    console.error(
      "ERROR ON RANDOMTV API METHOD. USING LOCAL INSTEAD.",
      message.status,
      message.error
    );
    pickItemLocally();
  }

  document
    .querySelector("#randomtv-button")
    .classList.remove("randomTV-loading");
});

async function showItem(title, subtitle, url, cover, method, pickedElement) {
  const displayType =
    (await chrome.storage.sync.get("displayType")).displayType || "modal";
  const displayActions = {
    modal: showModal,
    highlight: highlight,
    redirect: redirect,
  };

  const showMethod =
    (await chrome.storage.sync.get("showMethod")).showMethod || false;

  displayActions[displayType](
    title,
    subtitle,
    url,
    cover,
    method,
    showMethod,
    pickedElement
  );
}

async function showModal(title, subtitle, url, cover, method, showMethod) {
  removeHighlights();
  if (document.querySelector("#randomTV-modal")) return;

  // Backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop fade in blur";

  // Modal
  const modal = document.createElement("div");
  modal.className = "checkin-modal fade in";
  modal.id = "randomTV-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("tabindex", "-1");
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "block";
  modal.style.top = "135px";

  modal.innerHTML = `
    <div class="checkin-close trakt-icon-delete-thick" id="randomTV-closeModal"></div>
    <div class="form-signin">
      ${showMethod ? `<span class="randomTV-showMethod">${method}</span>` : ""}
      <img src="${cover}" class="randomTV-cover">
      <h2 class="randomTV-title">${title}</h2>
      ${
        subtitle && subtitle !== " "
          ? `<span class="randomTV-subtitle">${subtitle}</span>`
          : ""
      }
      <div class="form-inputs">
        <a class="checkin-submit btn btn-primary btn-block" style="margin: 0" id="randomTV-viewItemModal" href="${url}" target="_blank" rel="noopener noreferrer">View Item</a>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.appendChild(backdrop);

  const close = () => {
    modal.remove();
    backdrop.remove();
    document.removeEventListener("keydown", onEsc);
  };

  document
    .getElementById("randomTV-closeModal")
    ?.addEventListener("click", close);
  document
    .getElementById("randomTV-closeModalBtn")
    ?.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  const onEsc = (e) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", onEsc);
}

function highlight(
  title,
  subtitle,
  url,
  cover,
  method,
  showMethod,
  pickedElement
) {
  if (!pickedElement)
    return showModal(title, subtitle, url, cover, method, showMethod);

  removeHighlights();
  if (showMethod) alert(method);

  const pickedElementTop =
    pickedElement.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({
    top: pickedElementTop - 165,
    behavior: "smooth",
  });

  pickedElement.classList.add("randomTV-highlight");
}

function removeHighlights() {
  for (const element of document.querySelectorAll(".randomTV-highlight")) {
    element.classList.remove("randomTV-highlight");
  }
}

function redirect(title, subtitle, url, cover, method, showMethod) {
  removeHighlights();
  if (showMethod) alert(method);
  window.location.href = url;
}
