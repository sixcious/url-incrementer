# URL Incrementer
<img src="https://raw.githubusercontent.com/sixcious/assets/main/repository/url-incrementer/icon.svg?sanitize=true" width="128" height="128" alt="URL Incrementer" title="URL Incrementer">

## Available For
<a href="https://chromewebstore.google.com/detail/url-incrementer/hjgllnccfndbjbedlecgdedlikohgbko" title="Download for Google Chrome"><img src="https://raw.githubusercontent.com/sixcious/assets/main/vendor/chrome.svg?sanitize=true" width="64" height="64" alt="Google Chrome"></a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://microsoftedge.microsoft.com/addons/detail/url-incrementer/hnndkchemmjdlodgpcnojbmadckbieek" title="Download for Microsoft Edge"><img src="https://raw.githubusercontent.com/sixcious/assets/main/vendor/edge.svg?sanitize=true" width="64" height="64" alt="Microsoft Edge"></a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://addons.mozilla.org/firefox/addon/url-incrementer/" title="Download for Mozilla Firefox"><img src="https://raw.githubusercontent.com/sixcious/assets/main/vendor/firefox.svg?sanitize=true" width="64" height="64" alt="Mozilla Firefox"></a>

<br><br>
<img src="https://raw.githubusercontent.com/sixcious/assets/main/repository/url-incrementer/urli.svg?sanitize=true" width="400" height="400" align="left" title="URLI">

### Important Note About Version 6 (September 2024)
In order to update URLI to Manifest V3 (MV3), the permissions level needed to be increased to `<all_urls>`. Please see this [GitHub Issue](https://github.com/sixcious/url-incrementer/issues/17) for more information. Thank you for your understanding.

<br><br><br><br><br><br><br><br><br><br><br>

## Features
- 4 Actions: Increment URL, Next Link, Click Element, URL List
- Keyboard, Mouse, and Context Menu Shortcuts
- 1-Click Increment Decrement Buttons
- Advanced Incrementing Features: Multi, Error Skip, Date Time, Decimal Number, Roman Numeral, Custom Base, and Alphanumeric (Base 2-36, includes Hexadecimal)
- Auto Incrementing
- Save URLs: Save settings for your favorite URLs and URLI will always remember them the next time you visit
- Shuffle URLs: Make it fun and randomize the next pages you see!
- Options: Change how URLI pre-selects the number to increment... and more
- Toolkit: Generate Links, Open Tabs, Crawl URLs (Special Mode Required)

#### Feature Notes
- Firefox only: Local file:// URLs may not increment due to a bug in Firefox (Bug 1266960)
- Mapping shortcut keys to mouse buttons with 3rd party apps like Logitech Gaming Software is not officially supported and may only work if you use Logitech's "Multikey Macro" option

## Documentation
- [Help Guide](https://github.com/sixcious/url-incrementer/wiki)
- [Version History](https://github.com/sixcious/url-incrementer/wiki/Version-History)

## FAQ

#### What is the minimum browser version (and why is it to so high)?
The current minimum browser version is Chrome/Edge/Firefox `128`. I usually update the minimum browser version every time I do a release so I can use the latest and greatest ECMAScript features without worry. If your browser doesn't support it, I'm afraid you'll have to use another app/extension (sorry!).

#### Why is the production version's source code minified?
I use [Terser](https://github.com/terser/terser) to minify the source code for production releases that I upload to your browser's web store. I mainly do this because I write a lot of comments and `console.log()` statements for debugging and because it cuts down the file size significantly.

## Permissions Justification
`Read and change all your data on the websites you visit`- URLI needs to request this permission so that it can offer its advanced internal shortcuts, auto incrementing, and for the content script to load on each page you want to incrememt.

## Privacy Policy
URL Incrementer does *not* track you. It does *not* use analytic services. It does *not* collect or transmit any data from your device or computer. All your data is stored locally on your device. Your data is *your* data.

## Contributing
Thank you for considering to contribute! The best way you can help me is to leave a review on the [Chrome Web Store](https://chromewebstore.google.com/detail/url-incrementer/hjgllnccfndbjbedlecgdedlikohgbko/reviews), [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/url-incrementer/hnndkchemmjdlodgpcnojbmadckbieek), or [Mozilla Firefox Add-ons](https://addons.mozilla.org/firefox/addon/url-incrementer/). I really appreciate your support.

## License
<a href="https://github.com/sixcious/url-incrementer/blob/main/LICENSE">View License</a>

## Copyright
URLI, a URL Incrementer  
Copyright &copy; 2011-2020 <a href="https://github.com/sixcious" target="_blank">Roy Six</a>
