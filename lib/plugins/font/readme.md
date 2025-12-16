# Font Loader Plugin
Load the font before the first screen (Loading Screen)
## Quick Use
* Set your font(s) into the `fonts` property of `font-info.js`. e.g:
    ```
    fonts: [
        //No need to include extension on source
        {name: 'montserrat', source: 'media/fonts/montserrat-regular'}
    ]
    ```
* Each font should have 5 different extensions: `.ttf, .eot, .woff, .woff2, .svg`
* Make sure the font source uses `lowercase` or and `dash` as the name.

## Installation
* This plugin uses 3rd party libraries:
    - Promise Polyfill: https://github.com/taylorhakes/promise-polyfill
    - FontFaceObserver: https://github.com/bramstein/fontfaceobserver
* Include those libraries into `load.js` and `push.sh`. (Register Promise Polyfill first)
* Include `'plugins.font.font-loader'` into `required` section of `main.js`
* Then do step `Quick Use` above.

## Changing 3rd Party Library
Incase you want to use other 3rd party libarary?
* Replace the default library on `load.js` and `push.sh`
* Open `font-loader.js`
* Modify `_loadByLib` to load the font by the library.
* Call `this.onload` when the library success loading the font
* Call `this.onerror` when failed