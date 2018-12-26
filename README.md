# URL Incrementer

![URL Incrementer](assets/img/128-default.png?raw=true "URL Incrementer")
<br>
<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/svg/urli.svg?sanitize=true" width="196" height="196" align="right" title="URLI">

URLI can help you increment URLs. For example, if the URL has a "page=1" in it or if there's a Next [>] link on the page, URLI can get you to "page=2" in a variety of ways.

<a href="https://chrome.google.com/webstore/detail/url-incrementer/hjgllnccfndbjbedlecgdedlikohgbko" title="Chrome Web Store Download">
  <img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/img/chrome/ChromeWebStore_Badge_v2_496x150.png" height="128" alt="Chrome Web Store">
</a>

<a href="https://addons.mozilla.org/firefox/addon/url-incrementer" title="Firefox Addon Download">
  <img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/img/firefox/FirefoxAddon_Badge_v2_496x128.png" height="128" alt="Firefox Addon">
</a>

<a href="https://github.com/roysix/url-incrementer/wiki/Help" title="Help Guide" style="font-size: 2rem;">
  <img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/img/question-circle.png" alt="question-circle">Help Guide
</a>


# Features
<em>Coming Soon in 6.0 (December 2018)</em>
- Customizable Keyboard and Mouse Shortcuts (Multi-Click + Rocker)
- 1-Click Increment Decrement Button Extensions for Your Toolbar (Available on AMO)
- Auto Incrementing
- Download Incrementing (Multiple Page Downloading) [Experimental]
- Multi Incrementing [Experimental]
- Date Time, Decimal Number, Roman Numeral, Custom Base, and Alphanumeric (Base 2-36) Incrementing [Experimental]
- URLI's Toolkit [Experimental]
- Error Skipping
- Next Prev Link Support
- Save URLs and Wildcards [Experimental]: Save settings for your favorite URLs and URLI will always remember them the next time you visit
- Shuffle URLs: Make it fun and randomize the next pages you see!
- Options: Change how URLI pre-selects the number to increment... and more
- Safe, Open Source, Lightweight, No Ads, No Tracking, No Bloat
- Chrome Only: Uses 0 Chrome memory when inactive
- Firefox Only: Support for Firefox for Android (Some features may not work perfectly) [Experimental]

## Notes
1. Mapping shortcut keys to mouse buttons with 3rd party apps like Logitech Gaming Software is not supported and may only work if you use Logitech's "Multikey Macro" option.
2. Download Incrementing is an optional and experimental feature that is designed to be used with Auto so you can have a unique Multiple Page Downloader (think a simple "Down them all" that can run automatically!). It uses a custom-built downloader that I've developed for URLI.
3. URLI's Toolkit is a toolkit I made to help me develop and test URLI, but I've "unlocked" for you to use as a non-standard feature!
4. Saving URLs is completely optional. URLI only saves URLs as cryptographic hashes that are stored on your device's local storage -- not in the cloud.
5. Firefox only: Local file:// URLs may not increment due to a bug in Firefox (Bug 1266960).
6. Firefox only: URLI's Popup may not work in Private Windows due to the different way Firefox decided to handle this in respect to Chrome (Bug 1329304).
7. Firefox only: Firefox 60 (non ESR) Users won't be able to grant Download permissions on the Options page due to a bug in Firefox 60 (Bug 1382953); please update to Firefox 61 or higher.

# Credits and Special Thanks
NickMWPrince & Gopi P (AUTO Concept), Coolio Wolfus (Ver 1.x Testing), Eric C (Alphanumeric Idea), URL Flipper (Firefox), FontAwesome (Icons), Hover.css (Animations), @mallendeo (Toggles), Mike West (Dialogs), The Chromium Authors (Styles), ZURB Foundation (Styles / Tables), tinypng.com (Compression), regex101.com (Regex Test), httpstat.us (Error Skipping Test), Stack Overflow Users (Internal Code), ...

... and most of all you for using URLI :)

# License
URLI, a URL Incrementer  
Copyright © 2011 - 2019 Roy Six  
License: LGPL-3.0  
https://www.gnu.org/licenses/lgpl-3.0.html

chromium.css  
Copyright © 2015 The Chromium Authors. All rights reserved.  
License: BSD 3-Clause  
https://chromium.googlesource.com/chromium/src/+/master/LICENSE

This open-source software uses code made by user contributions to the StackOverflow website  
License: CC BY-SA 3.0  
https://creativecommons.org/licenses/by-sa/3.0/