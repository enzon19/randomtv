function appendButton() {
  const htmlToInsert = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,200,0,0"/>
  <style>
  span#random {
    font-family: 'Material Symbols Outlined';
    box-sizing: border-box;
    display: inline-block;
    font-size: 1px !important;
    margin-left: 4px !important;
    margin-right: 0 !important;
  }
  span#random::before { 
    content: "shuffle" !important;
    color: #333333;
    font-size: 25px !important;
  }
  div#randomTooltip {
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 50%;
    margin-left: -60px;
    visibility: hidden;
  }
  #random:hover #randomTooltip {
    visibility: visible;
  }
  </style>
  <span id="random" class="material-symbols-outlined trakt-icon-arrow-right">
  <div class="tooltip fade top in" role="tooltip" id="randomTooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" style="font-family: varela round !important">Random</div></div>
  </span>`;
  const range = document.createRange();
  range.selectNode(document.querySelector('.dropdown.filter-dropdown'));
  const documentFragment = range.createContextualFragment(htmlToInsert);
  document.querySelector('.dropdown.filter-dropdown').after(documentFragment);

  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/range/createContextualFragment
}

function randomTooltip() {

}

appendButton()