# URL Incrementer
<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/icon-dark.png?sanitize=true" width="128" height="128" alt="URL Incrementer" title="URL Incrementer">
<br><br>

## Available For
<a href="https://chrome.google.com/webstore/detail/url-incrementer/hjgllnccfndbjbedlecgdedlikohgbko" title="Chrome Web Store Download"><img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/chrome.svg?sanitize=true" height="64" alt="Google Chrome"></a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://addons.mozilla.org/firefox/addon/url-incrementer/" title="Firefox Addon Download"><img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/firefox.svg?sanitize=true" height="64" alt="Mozilla Firefox"></a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://microsoftedge.microsoft.com/addons/detail/url-incrementer/hnndkchemmjdlodgpcnojbmadckbieek" title="Microsoft Edge Extension Download"><img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/edge.png" height="64" alt="Microsoft Edge, Icon: By Source, Fair use, https://en.wikipedia.org/w/index.php?curid=62848768"></a>

<br><br>
<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/urli.svg?sanitize=true" width="256" height="256" align="left" title="URLI">

## About
URLI can help you increment URLs. For example, if the URL has a "page=1" in it or if there's a Next link on the page, URLI can get you to "page=2" in a variety of ways.
<br><br><br><br><br><br>

## Features
<em>Some Features Coming Soon in 6.0 (December 2020)</em>

- Keyboard and Mouse Shortcuts
- 1-Click Increment Decrement Buttons
- Auto Incrementing
- Download Incrementing (Multiple Page Downloading) [Experimental]
- Advanced Incrementing Features: Multi, Error Skip, Date Time, Decimal Number, Roman Numeral, Custom Base, and Alphanumeric (Base 2-36)
- Next Prev Link Support
- URLI's Toolkit [Experimental]
- Save URLs and Wildcards [Experimental]: Save settings for your favorite URLs and URLI will always remember them the next time you visit
- Shuffle URLs: Make it fun and randomize the next pages you see!
- Options: Change how URLI pre-selects the number to increment... and more
- Chrome / Edge: Uses 0 Background Memory when inactive
- Chrome / Edge: No permissions required
- Firefox: Support for Firefox for Android (Fennec Version 68, Some features may not work perfectly)
- No Ads, No Tracking, No Bloat

## Notes
- Mapping shortcut keys to mouse buttons with 3rd party apps like Logitech Gaming Software is not supported and may only work if you use Logitech's "Multikey Macro" option.
- Download Incrementing is an optional and experimental feature that is designed to be used with Auto so you can have a unique Multiple Page Downloader (think a simple "Down them all" that can run automatically!). It uses a custom-built downloader that I've developed for URLI.
- URLI's Toolkit is a toolkit I made to help me develop and test URLI, but I've "unlocked" for you to use as a non-standard feature!
- Saving URLs is completely optional.
- Firefox only: Local file:// URLs may not increment due to a bug in Firefox (Bug 1266960).
- Firefox only: URLI's Popup may not work in Private Windows due to the different way Firefox decided to handle this in respect to Chrome (Bug 1329304).
- Firefox only: Firefox 60 (non ESR) Users won't be able to grant Download permissions on the Options page due to a bug in Firefox 60 (Bug 1382953); please update to Firefox 61 or higher.

## Help Guide
[View the Help Guide!](https://github.com/roysix/url-incrementer/wiki)

## Permissions Justification
Chrome/Edge: URL Incrementer requires no special permissions.

Firefox: URL Incrementer requires the `all_urls` permission in order to offer Internal Shortcuts because Firefox does not support the chrome.declarativeContent API to make this an optional feature that sticks like in Chrome/Edge.

Some optional features require extra permissions:
1. Internal Shortcuts - requires the `all_urls` Permission
2. Enhanced Mode - requires the `all_urls` Permission
3. Download - requires the Download Permission and `all_urls` Permission

## Remote Code Policy
URL Incrementer does *not* use any remote code. All code is included locally in the software package and goes under review before being published.

## Privacy Policy
URL Incrementer does *not* track you. It does *not* use analytic services. It does *not* collect or transmit any data from your device or computer. All your data is stored locally on your device. Your data is *your* data.

## Credits and Special Thanks
<ul>
  <li>UI: <a href="https://material.io/">Material Design</a></li>
  <li>Fonts: <a href="https://fonts.google.com/specimen/Roboto" target="_blank">Roboto</a></li>
  <li>Icons: <a href="https://fontawesome.com/">FontAwesome</a></li>
  <li>Animations: <a href="https://ianlunn.github.io/Hover/">Hover.css</a></li>
  <li>Tooltips: <a href="https://kazzkiq.github.io/balloon.css/">Balloon.css</a></li>
  <li>With Special Thanks: <a href="#">@akaustav, Coolio Wolfus, NickMWPrince</a></li>
  <li>Shoutout To: <a href="#">URL Flipper by Kai Liu</a></li>
</ul>

## License
<a href="https://github.com/roysix/url-incrementer/blob/master/LICENSE">View License</a>

## Copyright
URLI, a URL Incrementer  
Copyright &copy; 2011-2020 <a href="https://github.com/roysix" target="_blank">Roy Six</a>