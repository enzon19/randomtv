'use strict';

const list = new RegExp(/\/users\/(.*)\/lists\/(.*)\?(.*)/);
const watchlist = new RegExp(/\/users\/(.*)\/(watchlist)\?(.*)/);
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
  span#randomtv {
    font-family: 'Material Symbols Outlined';
    box-sizing: border-box;
    display: inline-block;
    font-size: 1px !important;
    margin-left: 4px !important;
    margin-right: 0 !important;
    position: relative;
    cursor: pointer;
  }
  span#randomtv::before { 
    content: "shuffle" !important;
    font-size: 25px !important;
  }
  div#randomtvTooltip {
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 163%;
    margin-left: -60px;
    opacity: 0;
  }
  #randomtv:hover #randomtvTooltip {
    opacity: 1;
  }
  </style>
  <span id="randomtv" class="material-symbols-outlined trakt-icon-arrow-right">
    <div class="tooltip fade top in" role="tooltip" id="randomtvTooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" style="font-family: varela round,helvetica neue,Helvetica,Arial,sans-serif !important">Random</div></div>
  </span>`;
  const range = document.createRange();
  range.selectNode(document.querySelector('.dropdown.filter-dropdown'));
  const documentFragment = range.createContextualFragment(htmlToInsert);
  document.querySelector('.dropdown.filter-dropdown').after(documentFragment);

  document.getElementById('randomtv').addEventListener('click', () => chooseProcess());
  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/range/createContextualFragment
}

function chooseProcess() {
  const isPrivateList = ['Friends', 'Private'].includes(document.querySelector('.pill.spoiler')?.innerHTML);
  const isHidingItems = filters.includes('hide=') || filters.includes('genres=');
  const haveMoreThanOnePage = !!document.querySelector('.pagination');

  // any of this have to be true to make local: isPrivateList, isHidingItems, !haveMoreThanOnePage

  if (isPrivateList) {
    localPick();
  } else if (isHidingItems) {
    localPick();
  } else if (!haveMoreThanOnePage) {
    localPick();
  } else {
    serverPick();
  }

  // https://randomtv.enzon19.com/pickItem?username=enzon19&list_id=world-history-school&type=movie,show,season,episode,person&is_watchlist=0
  // https://randomtv.enzon19.com/pickItem?username=enzon19&type=movie,show,season,episode,person&is_watchlist=1
}

function pickItem(items) {
  const luckNumber = Math.floor(Math.random() * items.length);
  return items[luckNumber];
}

function localPick() {
  const pickedItem = pickItem(Array.from(document.getElementsByClassName('grid-item')));
  //showItem(, 'local');
}

function serverPick() {
  let filterType = 'movie,show,season,episode,person';
  if (filters.includes('display=')) filterType = filters.match(/display=(.*)\&|display=(.*)/)[1] || filters.match(/display=(.*)\&|display=(.*)/)[2];
  
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
      const pickedItem = pickItem(message.response);
      //showItem(, 'server');
    } else {
      localPick();
    }
  } else if (message.action == 'serverError') {
    localPick();
  }
})

function showItem(url, name, cover) {

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

document.addEventListener("turbolinks:load", function() {
  updateVariables();
  main();
});

main();