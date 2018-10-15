# Version History

# Version 6.0 (10/31/2018)
- Support for Firefox and Firefox for Android
- Now uses 0 Chrome Memory when inactive (e.g. when you haven't enabled it for a tab)! (Chrome Only)
- New Multi-Click Mouse Shortcuts
- "URLI's Toolkit" - Crawl up to 1,000 URLs, Open up to 100 incremented tabs, or generate a list of up to 10,000 incremented links!
- Save URLs - Save your favorite URLs' settings (selection, interval, and so on) so you don't have to go into Setup each time or have URLI take up memory. It's completely optional ("opt-in").
- Multi-Incrementing - Increment up to 3 parts of the URL individually, simultaneously, or in ranges! Click the Multi (+++) icon near Selection and then click Accept. Additional + - Buttons will show in the UI for each part you selected.
- Date Time Incrementing - Increment dates and times in URLs like "2018/01/25"
- AUTO Repeat Mode - Loops back to the starting URL and repeats
- Shuffle URLs - Shuffles the next URLs you'll see in random order, like shuffling a deck of cards! Works in Normal, AUTO, and Toolkit modes.
- Return to Start Button (Yellow) - Convenient button to return you back to the starting URL (Only for Enabled Instances)
- Next Prev Improvements: You can adjust the next prev keywords on the Options Page
- Download Features: 1. Manually select/un-select items to download by clicking the green checkboxes (applies only to the current URL you're on) 2. Subfolder Support: Save each page's downloads in a separate subfolder that will be incremented (experimental) 3. New Name column in Download Preview Table 4. Nested Iframe support (if the iframe is the same origin)
- Error Skipping: Requires Enhanced Mode. Now also works when you're on Browser Error Pages
- Help Guide: Click the ? in the Setup UI for detailed help guide on all the features
- Page loading speed improvements for popup and options by rewriting them in valid HTML 5, using async/defer for JS scripts, and replacing CSS @imports with HTML links
- File Size Dropped 50Kib from ~176KiB to ~126Kib
- Internal Code Enhancements: Rewrite to ECMAScript 6 using let, const, and async/await

# Version 5.8 (9/16/2018)
- Increased the AUTO times max value

# Version 5.7 (9/16/2018)
- Fixed button push animations

# Version 5.6 (9/16/2018)
- You can now edit or enter a custom URL in the Popup's URL textarea

# Version 5.5 (7/26/2018)
- Removed debug statements (apologies!)

# Version 5.4 (7/26/2018)
- To ensure compatibility with older Chrome versions (Min Version 55+), replaced Lookbehind regex for finding the part in the URL to increment with an equivalent non-lookbehind regex 
- Error Skipping Improvement: Reduced redirect false alarms by maintaining the current state with the server (added "credentials same-origin" to the fetch request)
- Now ensuring the toolbar icon and the Internal Shortcuts declarativeContent rule are correctly re-set when the extension first starts as opposed to when the extension just updates (e.g. covers a Chrome bug use-case when the declarativeContent rule is lost when the extension is simply disabled and re-enabled)

# Version 5.3 (7/4/2018)
- Error Skipping now supports any combination of HTTP Response codes! Just check the custom checkbox in the options and enter any combinations of codes you want separated by commas!
- Bug Fix: Fixed Error Skipping to detect redirects correctly (e.g. 301, 302); URLI's icon will now flash with the text "RED" for any redirect skipped (Real sorry for this mistake!)
- Another permission bug fix: Fixed losing Internal Shortcuts declarativeContent rule when the extension updates in rare circumstances. This seems to be a Chrome/Chromium bug.

# Version 5.2 (6/30/2018)
- New "1 Click" Increment Button and Decrement Button mini extensions for your toolbar are now available on the Chrome Web Store -- no more popups needed, super convenient, and consume 0 background memory when inactive! They're a win-win!
- Improved increment decrement prefixes selection to find the last = or / instead of the first = or / (the last one is usually the one we want to increment!)
- Increased Error Skip max value from 10 to 100 times, but also added warning about using high values ("Too Many Requests")
- Internal Shortcuts now have easier to press default modifiers Ctrl+Shift (like Chrome Shortcuts) instead of Alt+Ctrl (sorry for the awkward defaults!)
- Internal Shortcuts modifier keys by themselves can no longer be used as shortcuts due to unforeseen complexities that arise in modifier-only combinations (Apologies, but hopefully no one was doing this anyway!)
- Download Preview can now find URLs in style properties like background-image
- Bug Fix: When Download and Auto are both enabled and the Popup UI is still open, changed the download preview to only update when the tab has loaded completely to ensure no issues when the preview updates for the next URL
- More permissions bug fixes: There was a bug with the permissions that happened in rare circumstances. If you encountered any issues with downloading only working "once" or with the Internal Shortcuts not working at all, please try disabling and re-enabling it again in the Options and the issue should be resolved so that it works properly (Apologies for the inconvenience, this time it was a bug with the Chrome/Chromium permissions, not URLI!)

# Version 5.1 (6/14/18)
- Bug Fix: Fixed a permissions bug that affected you if you had Internal Shortcuts enabled in Version 4. The permissions and options are now reset when you update to 5.1 to ensure a clean slate! (Sorry for the inconvenience!)

# Version 5.0 (6/13/18)
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