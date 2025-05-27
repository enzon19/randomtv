<p align="center">
  <img src="./assets/logo.png" alt="RandomTV Logo" height="120px" />
  <h1 align="center">
    RandomTV for Trakt
  </h1>

  <p align="center">
    An extension to pick a random item from a list on Trakt.
    <br />
    <a href="https://chromewebstore.google.com/detail/randomtv-for-trakt/pfpgceagljbjijjfbhafopadmhdifoaa"><strong>Install for Chrome »</strong></a>
    <br />
    <a href="https://addons.mozilla.org/en-US/firefox/addon/randomtv-for-trakt/">Install for Firefox</a> • <a href="https://randomtv.enzon19.com">Website</a>
  </p>

</p>

## Screenshots

Click an image to view full size.

<div align="center">
  <img src="https://github.com/user-attachments/assets/a10752d9-feb3-4375-b004-8ef108b4a6b8" height="220" style="vertical-align: middle; margin: 5px;" />
  <img src="https://github.com/user-attachments/assets/bf590f35-dfdd-4fda-aade-46df58277013" height="220" style="vertical-align: middle; margin: 5px;" />
  <img src="https://github.com/user-attachments/assets/0ccbc739-5cf7-4e43-a53b-d7ad77f2e82c" height="220" style="vertical-align: middle; margin: 5px;" />
  <img src="https://github.com/user-attachments/assets/747aedda-61a4-4dd1-898b-0bd5238f2e43" height="220" style="vertical-align: middle; margin: 5px;" />
</div>

## About

When we have a big list and don't know what to watch, choose a random item can be the solution. That's what RandomTV does! The extension will pick a random item from any list on Trakt.

You just have to click on the Random button on the list you want a random item. Then, RandomTV will show the item in a modal, or highlight in the page or even redirect. You can set different ways to show the chosen item.

RandomTV also offers one more advanced thing: in lists with more than one pages (120+ items), all the items can be choose, even the ones not in the current page. This works because of the use of the API.

## Development
To reproduce the project locally for development or contribution:

1. **Clone the repository**
   ```bash
   git clone https://github.com/enzon19/randomtv.git
   cd randomtv
   ```

2. **Load the extension in your browser**

   - **Chrome**:  
     - Go to `chrome://extensions/`  
     - Enable *Developer mode*  
     - Click *Load unpacked* and select the `randomtv`

   - **Firefox**:  
     - Rename `manifest.json` to `manifest-chrome.json`
     - Rename `manifest-firefox.json` to `manifest.json`
     - Go to `about:debugging#/runtime/this-firefox`  
     - Click *Load Temporary Add-on* and select the `manifest.json` file in the appropriate folder

## Website

The website source code is available in the `gh` branch.
