# URL Incrementer

![URL Incrementer](_assets/img/darku/128.png?raw=true "URL Incrementer")

URLI (Extension Mascot / Incrementer Robot):
![URLI](src/img/extras/urli.png?raw=true "URLI")

URLI ("yur-lee") increments URLs and other interesting incrementing things. For example, if the URL has a "page=1" in it or if there's a Next [>] link on the page, URLI can get you to "page=2" quickly and conveniently. You can use shortcuts or the UI buttons to increment. Or toggle on AUTO to auto-increment and start a custom webpage slideshow! Download a series of pages while incrementing, or use Download and Auto together for a unique "Auto Incrementer Downloader" (experimental feature)! You can even add super convenient "1-Click" Increment Decrement Button extensions to your toolbar as well. URLI also features Error and Redirection skipping so you can skip past 404 Page Not Founds and other bad URLs until you get to the one you want. You can use URLI to navigate or flip thru image gallery or thumbnail websites, forums, or any site that keeps its URLs organized sequentially in a pattern.

This is the first extension/app I ever made, so it's important to me 100% that you are happy with it.

If something isn't working right or if there's anything you don't like, I'd really appreciate it if you could please give me a chance and email me before leaving a low-rating/review, and I'll try my hardest to fix it in the next version. Thank you (times infinity!) for letting URLI play a small part in your web experience!

# Features
- Auto Incrementing
- Download Incrementing [Experimental] **
- Multi Incrementing
- "The Incrementer's Toolkit" Open up to 100 incremented tabs at once or generate 10,000 incremented links in 1 second!
- Increment [+] Decrement [-]
- Next [>] Prev [<]
- Browser Shortcuts
- Internal Keyboard and Mouse Button Shortcuts
- "1-Click" Increment [+] Decrement [-] Button Extensions for Your Toolbar (Available on the Chrome Web Store)
- Save URLs for faster incrementing! URLs are saved as cryptographic hashes, just like how websites save your passwords
- Custom URLs: Enter your own customized list of URLs to increment or play a slideshow with!
- Shuffle URLs: Make it fun and have the next URLs you see be randomized!
- Error Skipping: 404 Page Not Found, 3XX Redirects, 4XX Client Errors, 5XX Server Errors, and any other codes you want!
- So Many Options: Alphanumeric Incrementing, Change how URLI pre-selects the number to increment... and more!
- Safe, Open Source, Lightweight (Under 190KiB!), No Ads, No Bloat, and No permissions required for most functionality

** Download Incrementing is an optional and experimental feature that is designed to be used with Auto. URLI can use its Auto-Incrementing capabilities to offer you a unique and flexible "Auto Incrementer Downloader" (think a simple "Down em all" that runs automatically)! It's still rough around the edges, and very much still in BETA. Thank you for being patient as this feature continues to be improved!

# Coming Soon in Version 6.0 (8/8/2018)
- Save URLs - URLI can now finally remember your favorite URL patterns and intervals you set so you don't have to go into Setup each time. It's completely optional ("opt-in"), you can check the Save checkbox if you want to save a URL Profile. To protect your privacy to the highest standard, URLs will be saved just like the industry standard is for saving passwords: as cryptographic hashes. We use the PBKDF2 algorithm with an HMAC SHA-512, a randomly generated salt, and a high number of iterations.
- "The Incrementer's Toolkit" - 1. Open a range of up to 100 incremented tabs in your browser or 2. Generate a list of incremented URL links and download them as an HTML file for easy navigation!
- Multi-Incrementing - A long-requested feature! Increment up to 3 parts of the URL...at the same time!!! Click the Multi near Selection and then click Accept. + - Buttons will show in the UI. Great for year/month/day URLs!
- AUTO Repeat Mode - Loops back to the starting URL and repeats!
- Return to Start Button (Yellow) - Convenient button to return you back to the starting URL 
- Custom URLs - Enter a list of your favorite URLs and have URLI go to them. Increment takes you to the next URL, Decrement takes you to the previous URL. Works with AUTO so you can TRULY have a custom web page slideshow, and you can loop through them... repeatedly with repeat mode! 
- Shuffle URLs - Shuffles the next URLs you'll see in random order, like shuffling a deck of cards! Works in Normal, AUTO, Custom URL, and Toolkit modes. Uses the Durstenfeld algorithm to perform the shuffling in O(n) time.
- "S" Increment Decrement Shortcuts - 2 Extra Shortcuts that will only activate on your saved/enabled URLs. You can set easier 1-key shortcuts for these sites and still keep the "quick" increment / decrement keys! This goes back to URLI's original design in 1.0/2.0 and removes the need to have Quick Checkboxes and a less flexible "all or nothing" approach.
- Download Features: 1. Manually select/deselect items to download by clicking the checkboxes (applies only to the current URL you're on) 2. Save each URL's downloads in a new subfolder (experimental)
- Help Guide: Click the ? in the Setup UI for detailed help guide on how the extension works
- Internal Code Enhancements: Caching storage for faster performance
- Bug fix: popup.html and options.html rewritten in valid HTML 5

# What's New in Version 5.5 (7/26/2018)
- Removed debug statements (apologies!)

# What's New in Version 5.4 (7/26/2018)
- To ensure compatibility with older Chrome versions (Min Version 55+), replaced Lookbehind regex for finding the part in the URL to increment with an equivalent non-lookbehind regex 
- Error Skipping Improvement: Reduced redirect false alarms by maintaining the current state with the server (added "credentials same-origin" to the fetch request)
- Now ensuring the toolbar icon and the Internal Shortcuts declarativeContent rule are correctly re-set when the extension first starts as opposed to when the extension just updates (e.g. covers a Chrome bug use-case when the declarativeContent rule is lost when the extension is simply disabled and re-enabled)

# What's New in Version 5.3 (7/4/2018)
- Error Skipping now supports any combination of HTTP Response codes! Just check the custom checkbox in the options and enter any combinations of codes you want separated by commas!
- Bug Fix: Fixed Error Skipping to detect redirects correctly (e.g. 301, 302); URLI's icon will now flash with the text "RED" for any redirect skipped (Real sorry for this mistake!)
- Another permission bug fix: Fixed losing Internal Shortcuts declarativeContent rule when the extension updates in rare circumstances. This seems to be a Chrome/Chromium bug.

# What's New in Version 5.2 (6/30/2018)
- New "1 Click" Increment Button and Decrement Button mini extensions for your toolbar are now available on the Chrome Web Store -- no more popups needed, super convenient, and consume 0 background memory when inactive! They're a win-win!
- Improved increment decrement prefixes selection to find the last = or / instead of the first = or / (the last one is usually the one we want to increment!)
- Increased Error Skip max value from 10 to 100 times, but also added warning about using high values ("Too Many Requests")
- Internal Shortcuts now have easier to press default modifiers Ctrl+Shift (like Chrome Shortcuts) instead of Alt+Ctrl (sorry for the awkward defaults!)
- Internal Shortcuts modifier keys by themselves can no longer be used as shortcuts due to unforeseen complexities that arise in modifier-only combinations (Apologies, but hopefully no one was doing this anyway!)
- Download Preview can now find URLs in style properties like background-image
- Bug Fix: When Download and Auto are both enabled and the Popup UI is still open, changed the download preview to only update when the tab has loaded completely to ensure no issues when the preview updates for the next URL
- More permissions bug fixes: There was a bug with the permissions that happened in rare circumstances. If you encountered any issues with downloading only working "once" or with the Internal Shortcuts not working at all, please try disabling and re-enabling it again in the Options and the issue should be resolved so that it works properly (Apologies for the inconvenience, this time it was a bug with the Chrome/Chromium permissions, not URLI!)

# What's New in Version 5.1 (6/14/18)
- Bug Fix: Fixed a permissions bug that affected you if you had Internal Shortcuts enabled in Version 4. The permissions and options are now reset when you update to 5.1 to ensure a clean slate! (Sorry for the inconvenience!)

# What's New in Version 5.0 (6/13/18)
- New Look: New extension icon and more intuitive, color-coded circle buttons that match URLI's early versions! Icons are 2x AA compatible. And URLI, the extension mascot from 1.0 / 2.0 is back in a prominent role!
- New Auto Increment function: Supports Multiple Tabs at the same time and it also has Pause/Resume functionality. No permissions needed. Create your own webpage slideshows on YOUR terms!
- New Download Increment function [Experimental]: Added to URLI so that with Auto, you can have your own "Auto Incrementer Downloader." Has a preview table with loads of options and filters! This feature is completely optional (opt-in) and requires your permissions to enable it.
- New Error Skipping feature: URLI can now check if the next URL will return an HTTP error code (like 404 Page Not Found) and increment again, skipping it (up to 10 times). Supports 404, 3XX Redirects, 4XX Client Errors, and 5XX Server Errors.
- Many options added: Change the extension icon to match your toolbar theme, adjust the button sizes (up to 64px!), get icon feedback when incrementing, and add Next Prev buttons to the Popup UI (...only if you want to!)
- Many convenience enhancements: Now saves changes you make in Popup UI, automatically brings up the Setup panel if the URL hasn't been setup, better support for selecting the part of the URL (now includes touch support for tablet devices!), and a new Reset Options Button has been added
- Improved Increment Decrement selection algorithm to first look for common URL parameters like "page=" so the number pre-selected by URLI is more likely to be "correct"
- Improved Next Prev functionality by a 1000% for MUCH better link accuracy
- Improved Internal Shortcuts: Updated KeyboardEvent: "keyCode" to "code" and MouseEvent: "which" to "button" and also now supports modifier keys by themselves as shortcuts (e.g. not that you should, but the Shift key can be used by itself now)
- Improved Permissions: Permissions for features (Internal Shortcuts, Download, Enhanced) are now modularized and separated so you can grant and enable only the features you want to
- Improved Internal code: Better tab instance memory management + numerous minor bugfixes
- Note: The options had to be reset due to this major update and the way URLI now modularizes permissions for each feature. I'm VERY sorry for this.

# Special Thanks
NickMWPrince and Gopi P. (AUTO Concept), Coolio Wolfus (Ver 1.X Testing), Eric C. (Alphanumeric Idea), and Adam C. & Will (User Feedback)

... and most of all you for using URLI!

Copyright © 2018 Roy Six