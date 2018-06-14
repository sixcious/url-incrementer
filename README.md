# URL Incrementer

![URL Incrementer](src/img/icons/dark/128.png?raw=true "URL Incrementer")

URLI (Extension Mascot / Incrementer Robot):
![URLI](src/img/extras/urli.png?raw=true "URLI")

URLI ("yur-lee") increments URLs. For example, if the URL has a "page=1" in it or if there's a Next [>] link on the page,
URLI can get you to "page=2" quickly and conveniently. You can use shortcuts or the buttons to increment. Or toggle on
AUTO to auto-increment and start a webpage slideshow! Download a series of pages as you increment using AUTO for a
unique Auto Incrementer Downloader (experimental feature)! You can use URLI on image gallery or thumbnail websites,
forums, or any site that keeps its URLs organized sequentially in a pattern.

Features:
- Auto Incrementing
- Download Incrementing [Experimental] (Optional, Requires Extra Permissions) **
- Increment [+] Decrement [-]
- Next [>] Prev [<]
- Chrome Shortcuts
- Internal Keyboard and Mouse Button Shortcuts (Requires Extra Permissions)
- So Many Options: Alphanumeric Incrementing, Change how URLI pre-selects the number to increment, Intervals, Leading Zeros, Error Skipping... and more!
- Safe, Open Source, Lightweight (Under 400KB unpacked!), Low Memory Footprint, No Ads, No Bloat, and Requires no permissions for most functionality

**Download Incrementing is an optional and experimental feature that is designed to be used with Auto. URLI can use its Auto-Incrementing capabilities to offer you a unique and flexible "Auto Incrementer Downloader." It's still rough around the edges, and very much still in BETA. Thank you for being patient as this feature continues to be improved!

URLI 5.0 and a personal apology to you ...

First, if you were using Versions 3 or 4, I really want to apologize to you for the state this extension has been in. You deserve a way better extension. The only reason Version 5 exists is because of you! I tried to go back to URLI's roots in 5.0.
I re-installed Version 2 and tried to make sure 5.0 was as simple and easy to use as that version out of the box, while still adding as much incrementing functionality I could.
Also, URLI the original extension mascot, is now back for good. If you only use URLI for shortcuts, no worries! Nothing has changed in that regard! The only thing is that the options had to be reset so you might need to re-set a few things (I really apologize for that). If there's anything you don't like in 5.0, please let me know and I'll try my hardest to fix it in the next version.
This is the only extension I ever made, so it's important to me 100% that you are happy with it. I can't express in words how thankful I am that you are using URLI. Thank you (times infinity!) for letting URLI play a small part in your Chrome experience!

What's New in Version 5.1 (6/14/18)
- BUG FIX: Fixed a permissions bug that affected you if you had Internal Shortcuts enabled in Version 4. The permissions and options are now reset when you update to 5.1 to ensure a clean slate! (Sorry for the inconvenience!)

What's New in Version 5.0 (6/13/18)
- NEW Look: New extension icon and more intuitive, color-coded circle buttons that match URLI's early versions! Icons are 2x AA compatible. And URLI, the extension mascot from 1.0 / 2.0 is back in a prominent role!
- NEW Auto Increment function: Supports Multiple Tabs at the same time and it also has Pause/Resume functionality. No permissions needed. Create your own webpage slideshows on YOUR terms!
- NEW Download Increment function [Experimental]: Added to URLI so that with Auto, you can have your own "Auto Incrementer Downloader." Has a preview table with loads of options and filters! This feature is completely optional (opt-in) and requires your permissions to enable it.
- NEW Error Skipping feature: URLI can now check if the next URL will return an HTTP error code (like 404 Page Not Found) and increment again, skipping it (up to 10 times). Supports 404, 3XX Redirects, 4XX Client Errors, and 5XX Server Errors.
- MANY options added: Change the extension icon to match your toolbar theme, adjust the button sizes (up to 64px!), get icon feedback when incrementing, and add Next Prev buttons to the Popup UI (...only if you want to!)
- MANY convenience enhancements: Now saves changes you make in Popup UI, automatically brings up the Setup panel if the URL hasn't been setup, better support for selecting the part of the URL (now includes touch support for tablet devices!), and a new Reset Options Button has been added
- IMPROVED Increment Decrement selection algorithm to first look for common URL parameters like "page=" so the number pre-selected by URLI is more likely to be "correct"
- IMPROVED Next Prev functionality by a 1000% for MUCH better link accuracy
- IMPROVED Internal Shortcuts: Updated KeyboardEvent: "keyCode" to "code" and MouseEvent: "which" to "button" and also now supports modifier keys by themselves as shortcuts (e.g. not that you should, but the Shift key can be used by itself now)
- IMPROVED Permissions: Permissions for features (Internal Shortcuts, Download, Enhanced) are now modularized and separated so you can grant and enable only the features you want to
- IMPROVED Internal code: Better tab instance memory management + numerous minor bugfixes
- NOTE: The options had to be reset due to this major update and the way URLI now modularizes permissions for each feature. I'm VERY sorry for this.

Special Thanks:
Nick MW Prince and Gopi P. (AUTO Concept), Coolio Wolfus (Ver 1.X Testing), Eric C. (Alphanumeric Concept), Blue / Will / Adam C (Feedback)

... and most of all you for using URLI!