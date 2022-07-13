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

function chooseProcess() {
  const isPrivateList = ['Friends', 'Private'].includes(document.querySelector('.pill.spoiler')?.innerHTML);
  const isHidingItems = filters.includes('hide=') || filters.includes('genres=');
  const haveMoreThanOnePage = !!document.querySelector('.pagination');

  // any of this have to be true to make local: isPrivateList, isHidingItems, !haveMoreThanOnePage
  if (isPrivateList || isHidingItems || !haveMoreThanOnePage) {
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

    showItem(title.innerText, subtitle.innerText, url.href, cover.dataset.original, 'Local');
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

async function showItem(title, subtitle, url, cover, method) {
  const displayType = (await chrome.storage.sync.get('displayType')).displayType;
  const showMethod = (await chrome.storage.sync.get('showMethod')).showMethod;
  const displayActions = {
    'modal': showUsingModal
  }
  // ,
  //   'highlight': showHighlighting,
  //   'redirect': showRedirecting
  displayActions[displayType](title, subtitle, url, cover, method, showMethod);
}

function showUsingModal(title, subtitle, url, cover, method, showMethod) {
  if (!document.getElementsByClassName('randomTV-modalDialog')[0]) {
    const modal = `<style class="randomTV-modal">
      .randomTV-modalDialog {
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
        --cc-overlay-bg: rgba(4, 6, 8, .85);
        font-family: varela round,helvetica neue,Helvetica,Arial,sans-serif;
        font-size: 14px;
        line-height: 1.428571429;
        color: #333;
        text-rendering: optimizeLegibility!important;
        -webkit-font-smoothing: antialiased!important;
        --cc-bg: #181b1d;
        --cc-text: #d8e5ea;
        --cc-btn-primary-bg: #ed1c24;
        --cc-btn-primary-text: #fff;
        --cc-btn-primary-hover-bg: #c50000;
        --cc-btn-secondary-bg: #33383c;
        --cc-btn-secondary-text: var(--cc-text);
        --cc-btn-secondary-hover-bg: #3e454a;
        --cc-toggle-bg-off: #667481;
        --cc-toggle-bg-on: var(--cc-btn-primary-bg);
        --cc-toggle-bg-readonly: #454c54;
        --cc-toggle-knob-bg: var(--cc-cookie-category-block-bg);
        --cc-toggle-knob-icon-color: var(--cc-bg);
        --cc-block-text: #b3bfc5;
        --cc-cookie-category-block-bg: #23272a;
        --cc-cookie-category-block-bg-hover: #2b3035;
        --cc-section-border: #292d31;
        --cc-cookie-table-border: #2b3035;
        --cc-webkit-scrollbar-bg: #667481;
        --cc-webkit-scrollbar-bg-hover: #9199a0;
        box-sizing: border-box;
        position: fixed;
        z-index: 10000;
        background-color: #f5f5f7;
        width: 360px;
        left: 50%;
        margin-left: -180px;
        box-shadow: 0 0 20px #666;
        border-radius: 3px;
        margin-bottom: 40px;
        height: auto;
        bottom: auto;
        outline: none;
        opacity: 1;
        top: 135px;
        display: block;
      }

      .randomTV-modalDialogInside {
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
        --cc-overlay-bg: rgba(4, 6, 8, .85);
        font-family: varela round,helvetica neue,Helvetica,Arial,sans-serif;
        font-size: 14px;
        line-height: 1.428571429;
        color: #333;
        --cc-bg: #181b1d;
        --cc-text: #d8e5ea;
        --cc-btn-primary-bg: #ed1c24;
        --cc-btn-primary-text: #fff;
        --cc-btn-primary-hover-bg: #c50000;
        --cc-btn-secondary-bg: #33383c;
        --cc-btn-secondary-text: var(--cc-text);
        --cc-btn-secondary-hover-bg: #3e454a;
        --cc-toggle-bg-off: #667481;
        --cc-toggle-bg-on: var(--cc-btn-primary-bg);
        --cc-toggle-bg-readonly: #454c54;
        --cc-toggle-knob-bg: var(--cc-cookie-category-block-bg);
        --cc-toggle-knob-icon-color: var(--cc-bg);
        --cc-block-text: #b3bfc5;
        --cc-cookie-category-block-bg: #23272a;
        --cc-cookie-category-block-bg-hover: #2b3035;
        --cc-section-border: #292d31;
        --cc-cookie-table-border: #2b3035;
        --cc-webkit-scrollbar-bg: #667481;
        --cc-webkit-scrollbar-bg-hover: #9199a0;
        cursor: default !important;
        box-sizing: border-box;
        max-width: 330px;
        padding: 15px 15px 25px;
        margin: 0 auto;
        text-align: center;
      }

      .randomTV-buttonsGrid {
        display: grid;
        grid-template-columns: auto auto;
        margin: 15px;
      }

      .randomTV-showMethod {
        background-color: #ddd;
        padding: 6px;
        border-radius: 8px;
        font-size: 12px;
        color: #333;
        font-family: varela round,helvetica neue,Helvetica,Arial,sans-serif;
      }
    </style>
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