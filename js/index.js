const list = new RegExp(/\/users\/(.*)\/lists\/(.*)\?(.*)/);
const watchlist = new RegExp(/\/users\/(.*)\/(watchlist)\?(.*)/);
const actualUrl = window.location.href;

const urlVariables = actualUrl.match(/\/users\/.*\/watchlist/) ? actualUrl.match(watchlist) : actualUrl.match(list);

const username = urlVariables[1];
const listId = urlVariables[2];
const filters = urlVariables[3];

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
    left: 150%;
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

  document.getElementById('randomtv').addEventListener('click', () => pickItem());
  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/range/createContextualFragment
}

function pickItem() {
  alert('aaaa')
  // https://randomtv.enzon19.com/pickItem?username=enzon19&list_id=world-history-school&type=movie,show,season,episode,person&is_watchlist=0
  // https://randomtv.enzon19.com/pickItem?username=enzon19&type=movie,show,season,episode,person&is_watchlist=1
}

if (document.readyState !== 'loading') {
  if (username && listId) appendButton();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (username && listId) appendButton();
  });
}