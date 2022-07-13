'use strict';

const list = new RegExp(/\/users\/(.*)\/lists\/(.*)\?(.*)/);
const watchlist = new RegExp(/\/users\/(.*)\/(watchlist)\/?\??(.*)/); // \/users\/(.*)\/(watchlist)\??(.*)
let actualUrl, urlVariables, username, listId, filters;
let isWatchlist = false;

function updateVariables() {
  actualUrl = window.location.href;
  urlVariables = actualUrl.match(/\/users\/.*\/watchlist/) ? (isWatchlist = true, actualUrl.match(watchlist)) : actualUrl.match(list);
  if (urlVariables) {
    username = urlVariables[1];
    listId = urlVariables[2];
    filters = urlVariables[3];
  }
}

updateVariables();

function appendButton() {
  const htmlToInsert = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,200,0,0"/>
  <style>
  span#randomTV-button {
    font-family: 'Material Symbols Outlined';
    box-sizing: border-box;
    display: inline-block;
    font-size: 1px !important;
    margin-left: 4px !important;
    margin-right: 0 !important;
    position: relative;
    cursor: pointer;
  }
  span#randomTV-button::before { 
    content: "shuffle" !important;
    font-size: 25px !important;
  }
  div#randomTV-tooltip {
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 163%;
    margin-left: -60px;
    opacity: 0;
  }
  #randomTV-button:hover #randomTV-tooltip {
    opacity: 1;
  }
  .randomTV-highlight {
    transition: all 0.4s;
    transform: scale(1.3, 1.3);
    z-index: 1000;
  }

  .randomTV-highlight:hover {
    transition: all 0.4s;
    transform: scale(1, 1);
  }
  .randomTV-highlight > a > div {
    border: 1px solid #ed1c24 !important;
    border-bottom: 0px !important;
    box-shadow: 0px 0px 20px 4px rgba(0, 0, 0, 0.4);
  }
  .randomTV-highlight > .quick-icons.smaller {
    border: 1px solid #ed1c24 !important;
    border-top: 0px !important;
    box-shadow: 0px 0px 20px 4px rgba(0, 0, 0, 0.4);
  }
  </style>
  <span id="randomTV-button" class="material-symbols-outlined trakt-icon-arrow-right">
    <div class="tooltip fade top in" role="tooltip" id="randomTV-tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" style="font-family: varela round,helvetica neue,Helvetica,Arial,sans-serif !important">Random</div></div>
  </span>`;
  const range = document.createRange();
  range.selectNode(document.querySelector('.dropdown.filter-dropdown'));
  const documentFragment = range.createContextualFragment(htmlToInsert);
  document.querySelector('.dropdown.filter-dropdown').after(documentFragment);

  document.getElementById('randomTV-button').addEventListener('click', () => chooseProcess());
  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/range/createContextualFragment
}

async function chooseProcess() {
  const isPrivateList = ['Friends', 'Private'].includes(document.querySelector('.pill.spoiler')?.innerHTML);
  const isHidingItems = filters.includes('hide=') || filters.includes('genres=');
  const haveMoreThanOnePage = !!document.querySelector('.pagination');
  const disableAPI = (await chrome.storage.sync.get('disableAPI')).disableAPI;

  // any of this have to be true to make local: isPrivateList, isHidingItems, !haveMoreThanOnePage, disableAPI
  if (isPrivateList || isHidingItems || !haveMoreThanOnePage || disableAPI) {
    localPick();
  } else {
    serverPick();
  }

  // https://randomtv.enzon19.com/pickItem?username=enzon19&list_id=world-history-school&type=movie,show,season,episode,person&is_watchlist=0
  // https://randomtv.enzon19.com/pickItem?username=enzon19&type=movie,show,season,episode,person&is_watchlist=1
}

function getRandomItem(items) {
  const luckNumber = Math.floor(Math.random() * items.length);
  return items[luckNumber];
}

function localPick() {
  const pickedItem = getRandomItem(Array.from(document.getElementsByClassName('grid-item')));
  if (pickedItem) {
    const pickedItem = getRandomItem(Array.from(document.getElementsByClassName('grid-item')));
    const cover = pickedItem.querySelector('div.poster > img.real');
    const url = cover.parentElement.parentElement;
    const title = pickedItem.querySelectorAll('a.titles-link')[0];
    const subtitle = pickedItem.querySelectorAll('a.titles-link')[1];

    showItem(title.innerText, subtitle.innerText, url.href, cover.dataset.original, 'Local', pickedItem);
  } else {
    console.error('Error with RandomTV.')
  }
}

function serverPick() {
  let filterType = 'movie,show,season,episode,person';
  if (filters.includes('display=')) filterType = (filters.match(/display=(.*)\&|display=(.*)/)[1] || filters.match(/display=(.*)\&|display=(.*)/)[2]) + 's';
  
  chrome.runtime.sendMessage({
    'action': 'serverRequest', 
    'username': username,
    'listId': listId,
    'filterType': filterType,
    'isWatchlist': isWatchlist
  });
}

// finishing the work of serverPick()
chrome.runtime.onMessage.addListener(message => {
  if (message.action == 'serverResponse') {
    if (message.status == 200) {
      const pickedItem = message.response;
      showItem(pickedItem.title, pickedItem.subtitle, pickedItem.url, pickedItem.cover, 'API');
    } else {
      localPick();
    }
  } else if (message.action == 'serverError') {
    localPick();
  }
})

async function showItem(title, subtitle, url, cover, method, pickedItem) {
  const displayType = (await chrome.storage.sync.get('displayType')).displayType;
  const showMethod = (await chrome.storage.sync.get('showMethod')).showMethod;
  const displayActions = {
    'modal': showUsingModal,
    'highlight': showHighlighting,
    'redirect': showRedirecting
  }
  displayActions[displayType](title, subtitle, url, cover, method, showMethod, pickedItem);
}

async function showUsingModal(title, subtitle, url, cover, method, showMethod) {
  removeHighlights();
  if (!document.getElementsByClassName('randomTV-modalDialog')[0]) {
    const modal = `<link rel="stylesheet" href="${chrome.runtime.getURL("/data/modal.css")}" class="randomTV-modal">
    <div class="randomTV-modalDialog">
      <div class="randomTV-modalDialogInside">
        ${showMethod ? `<span class="randomTV-showMethod">${method}</span>` : ""}
        <img src=${cover} style="max-height: 400px; margin: 15px;">
        <h2 style="margin-top: 5px !important;">${title}</h2>
        ${subtitle ? `<span>${subtitle}</span>` : ""}
        <div class="randomTV-buttonsGrid">
          <div class="form-inputs">
            <a class="checkin-submit btn btn-basic btn-block" id="randomTV-closeModal">Close</a>
          </div>
          <div class="form-inputs">
            <a class="checkin-submit btn btn-primary btn-block" id="randomTV-viewItemModal" href="${url}">View Item</a>
          </div>
        </div>
      </div>
    </div>
    <div class="randomTV-backdrop modal-backdrop fade in blur"></div>`

    document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', modal);

    document.getElementById('randomTV-closeModal').addEventListener('click', () => {
      document.getElementsByClassName('randomTV-modalDialogInside')[0].remove();
      document.getElementsByClassName('randomTV-modalDialog')[0].remove();
      document.getElementsByClassName('randomTV-modal')[0].remove();
      document.getElementsByClassName('randomTV-backdrop')[0].remove();
    });
  }
}

function showHighlighting(title, subtitle, url, cover, method, showMethod, pickedItem) {
  if (method == 'API') {
    showUsingModal(title, subtitle, url, cover, method, showMethod);
  } else {
    removeHighlights();
    pickedItem.scrollIntoView({"behavior": "smooth"});
    pickedItem.classList.add('randomTV-highlight');
  }

  if (showMethod) alert(method);
}

function showRedirecting(title, subtitle, url, cover, method, showMethod) {
  removeHighlights();
  if (showMethod) alert(method);
  window.location.href = url;
}

function removeHighlights() {
  for (const element of document.getElementsByClassName('randomTV-highlight')) {
    element.classList.remove('randomTV-highlight')
  }
}

function main() {
  if (document.readyState !== 'loading') {
    if (username && listId) appendButton();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (username && listId) appendButton();
    });
  }
}

document.addEventListener('turbolinks:load', function() {
  updateVariables();
  main();
});

main();