# URL Incrementer

![URL Incrementer](_assets/img/darku/128.png?raw=true "URL Incrementer")

URLI (Extension Mascot / Incrementer Robot):
![URLI](src/img/extras/urli.png?raw=true "URLI")

URLI ("yur-lee") increments URLs. For example, if the URL has a "page=1" in it or if there's a Next [>] link on the page, URLI can get you to "page=2" quickly and conveniently. You can use shortcuts or the UI buttons to increment. Or toggle on AUTO to auto-increment and start a custom webpage slideshow! Download a series of pages while incrementing, or use Download and Auto together for a unique "Auto Incrementer Downloader" (experimental feature)! You can even add super convenient "1-Click" Increment Decrement Button extensions to your toolbar as well. URLI also features Error & Redirection skipping so you can skip past 404 Page Not Founds and other bad URLs until you get to the one you want. You can use URLI to navigate or flip thru image gallery or thumbnail websites, forums, or any site that keeps its URLs organized sequentially in a pattern.

Features:
- Auto Incrementing (Custom Web Page Slideshows) with Repeat Mode
- Download Incrementing [Experimental] (Optional, Requires Extra Permissions) **
- The Incrementer's Toolkit: Open up to 100 incremented tabs at once or generate up to 10,000 incremented URL Links in 1 second!
- Increment [+] Decrement [-]
- Next [>] Prev [<]
- Chrome Shortcuts
- Internal Keyboard and Mouse Button Shortcuts (Requires Extra Permissions)
- "1 Click" Increment [+] Decrement [-] Button Extensions for Your Toolbar (Available on the Chrome Web Store)
- Save Your Favorite URL Profiles for Quick Incrementing! URLs are saved securely, just like how websites save your passwords as hashes using a secure cryptographic hashing algorithm such as PBKDF2 with HMAC SHA-512
- Error Skipping: 404 Page Not Found, 3XX Redirects, 4XX Client Errors, 5XX Server Errors, and any other combination of HTTP Response Codes you want!
- So Many Options: Alphanumeric Incrementing, Change how URLI pre-selects the number to increment, Intervals, Leading Zeros, Randomized Sequences (Shuffling)... and more!
- Safe, Open Source, Lightweight (Under 400KB unpacked!), Low Memory Footprint, No Ads, No Bloat, and Requires no permissions for most functionality

** Download Incrementing is an optional and experimental feature that is designed to be used with Auto. URLI can use its Auto-Incrementing capabilities to offer you a unique and flexible "Auto Incrementer Downloader" (think a simple "Down em all" that runs automatically)! It's still rough around the edges, and very much still in BETA. Thank you for being patient as this feature continues to be improved!

URLI 5 and a personal apology to you ...

If you were using Versions 3 or 4, I really want to apologize to you for the state this extension has been in. You deserve a way better extension. The only reason Version 5 exists is because of you!

This is the first extension/app I ever made, so it's important to me 100% that you are happy with it. If there's anything you don't like, please let me know and I'll try my hardest to fix it in the next version. I can't express in words how happy I am that you are using URLI. Thank you (times infinity!) for letting URLI play a small part in your Chrome experience!

Coming Soon in Version 5.4 (TBD)
- New Feature: Save URL Profiles/Patterns. URLI can now remember different URL patterns and intervals you set. You can check the save checkbox if you want to save a URL Profile while in the Popup UI Setup. To protect your privacy, URLs saved will be saved as cryptographic hashes using PBKDF2 with HMAC SHA-512, a salt, and a high number of iterations. Not even URLI can figure out the URLs!
- New Feature: "The Incrementer's Toolkit" - 1: Open a range of up to 100 incremented tabs in your browser or 2: Generate a list of incremented URL links for easy navigation!
- New Feature: Repeat Mode for AUTO: Loops back to the starting URL and repeats!
- New Feature: Randomize Sequence: Shuffles the next URLs you'll see in random order, like shuffling a deck of cards. Works in normal, AUTO, or Toolkit modes. Uses the Durstenfeld algorithm to perform the shuffling in O(n) time.
- Error Skipping Improvement: Reduced redirect false alarms by maintaining the current state with the server (added "credentials same-origin" to the fetch request)
- Bug fix: Now ensuring the toolbar icon and the Internal Shortcuts declarativeContent rule are correctly re-set when the extension first starts as opposed to when the extension just updates (e.g. covers a Chrome bug use-case when the declarativeContent rule is lost when the extension is simply disabled and re-enabled)
- Bug fix: popup.html and options.html rewritten in valid HTML 5

What's New in Version 5.3 (7/4/2018)
- Error Skipping now supports any combination of HTTP Response codes! Just check the custom checkbox in the options and enter any combinations of codes you want separated by commas!
- Bug Fix: Fixed Error Skipping to detect redirects correctly (e.g. 301, 302); URLI's icon will now flash with the text "RED" for any redirect skipped (Real sorry for this mistake!)
- Another permission bug fix: Fixed losing Internal Shortcuts declarativeContent rule when the extension updates in rare circumstances. This seems to be a Chrome/Chromium bug.

What's New in Version 5.2 (6/30/2018)
- New "1 Click" Increment Button and Decrement Button mini extensions for your toolbar are now available on the Chrome Web Store -- no more popups needed, super convenient, and consume 0 background memory when inactive! They're a win-win!
- Improved increment decrement prefixes selection to find the last = or / instead of the first = or / (the last one is usually the one we want to increment!)
- Increased Error Skip max value from 10 to 100 times, but also added warning about using high values ("Too Many Requests")
- Internal Shortcuts now have easier to press default modifiers Ctrl+Shift (like Chrome Shortcuts) instead of Alt+Ctrl (sorry for the awkward defaults!)
- Internal Shortcuts modifier keys by themselves can no longer be used as shortcuts due to unforeseen complexities that arise in modifier-only combinations (Apologies, but hopefully no one was doing this anyway!)
- Download Preview can now find URLs in style properties like background-image
- Bug Fix: When Download and Auto are both enabled and the Popup UI is still open, changed the download preview to only update when the tab has loaded completely to ensure no issues when the preview updates for the next URL
- More permissions bug fixes: There was a bug with the permissions that happened in rare circumstances. If you encountered any issues with downloading only working "once" or with the Internal Shortcuts not working at all, please try disabling and re-enabling it again in the Options and the issue should be resolved so that it works properly (Apologies for the inconvenience, this time it was a bug with the Chrome/Chromium permissions, not URLI!)

What's New in Version 5.1 (6/14/18)
- Bug Fix: Fixed a permissions bug that affected you if you had Internal Shortcuts enabled in Version 4. The permissions and options are now reset when you update to 5.1 to ensure a clean slate! (Sorry for the inconvenience!)

What's New in Version 5.0 (6/13/18)
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

Special Thanks:
NickMWPrince and Gopi P. (AUTO Concept), Coolio Wolfus (Ver 1.X Testing), Eric C. (Alphanumeric Idea), Will & Adam C. (User Feedback)

... and most of all you for using URLI!