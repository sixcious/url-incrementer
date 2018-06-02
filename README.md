# URL Incrementer

URLI ("yur-lee") increments URLs. If the URL has a "page=1" in it, URLI can get you to "page=2" quickly and conveniently. Use shortcuts or the UI Buttons to increment, or say "Good-Bye!" to manual incrementing and start your own web page slideshows with URLI's Auto-Incrementer! You can even download n' increment a series of pages using the Download Incrementer (experimental)! You can use URLI on gallery or thumbnail websites, forums, or any site that keeps its URLs organized sequentially.

Features:
- Auto Incrementing
- Download Incrementing [Experimental] (Requires Extra Permissions) **
- Increment [+] Decrement [-]
- Next [>] Prev [<]
- Chrome Shortcuts
- Internal Keyboard and Mouse Button Shortcuts (Requires Extra Permissions)
- So Many Options (Alphanumeric Incrementing, Selection algorithms, Intervals, Leading Zeros, Error Skipping... and so much more)
- Safe, Open Source, Lightweight (Under 300KB!), NO Ads, NO Bloat, and Requires NO permissions for most functionality

**Download Incrementing is a completely optional and experimental feature that is designed to be used with Auto. URLI can use its Auto-Incrementing capabilities to offer you a unique and flexible "Auto Incrementer Downloader." It's still rough around the edges, so I ask for your patience as I work hard to get it up to snuff. Thank you very much for understanding!

URLI 5.0 and a personal apology ...

If you were using Versions 3 or 4, I really want to apologize to you for the state this extension has been in. You all deserve a better extension. The reason Version 5 exists is because of you. I tried hard to go back to URLI's roots in 5.0.
I re-installed Version 2 and tried to make sure 5.0 was as simple and easy to use as that version out of the box, while still adding as much incrementing functionality I could.
If you only use URLI for shortcuts, no worries, nothing has changed in that regard! The only thing is that the options had to be reset so you might need to re-set a few things (I really apologize for that). If there's anything you don't like in 5.0, please let me know and I'll try my hardest to fix it in the next version. I know this is going to sound cliche, but ... without "U" there is no URLI.
Thank you (x Infinity) for letting URLI play a small part in your Chrome experience. :)

What's New in Version 5.0 (June 5, 2018)
- NEW Look: New extension icon and more intuitive, color-coded circle buttons that match URLI's early versions! (Blue for Increment/Decrement, Green for Next/Prev, Red for Clear, Orange for Auto, and Purple for Download)
- NEW Auto Increment function: Supports Multiple Tabs at the same time and it also has Pause/Resume functionality. No permissions needed. Create your own webpage slideshows on YOUR terms!
- NEW Download Increment function [Experimental]: Added to URLI so that with Auto, you can have your own "Auto Incrementer Downloader." This feature is completely optional (opt-in) and requires your permissions to enable it.
- NEW Error Skipping feature: URLI can now check if the next URL will return an HTTP error code (like 404 Page Not Found) and increment again, skipping it (up to 10 times). Supports 404, 3XX Redirects, 4XX Client Errors, and 5XX Server Errors.
- MANY options added: Change the extension icon to match your toolbar theme, adjust the button sizes (up to 64px!), get icon feedback when incrementing, and add Next Prev buttons to the Popup UI (...only if you want to!)
- MANY convenience enhancements: Now saves changes you make in Popup UI, automatically brings up the Setup panel if the URL hasn't been setup, and better support for selecting the part of the URL (now includes touch support for tablet devices!)
- IMPROVED Increment Decrement selection algorithm to first look for common URL parameters like "page=" so the number pre-selected by URLI is more likely to be "correct"
- IMPROVED Next Prev functionality by a 1000% for MUCH better link accuracy
- IMPROVED Internal Shortcuts: Updated KeyboardEvent: "keyCode" to "code" and MouseEvent: "which" to "button" and also now supports modifier keys by themselves as shortcuts (e.g. not that you should, but the Shift key can be used by itself now)
- IMPROVED Permissions: Permissions for features (Internal Shortcuts, Download, Enhanced) are now modularized and separated so you can grant and enable only the features you want to
- IMPROVED Internal code: Better tab instance memory management (now using JavaScript Map instead of array) + numerous minor bugfixes
- NOTE: The options had to be reset due to this major update and the way URLI now modularizes permissions for each feature. I'm VERY sorry for this.

Special Thanks:
NickMWPrince, Blue, Blue Chan, Will, Adam C, Coolio Wolfus

... AND "U" for using URLI!