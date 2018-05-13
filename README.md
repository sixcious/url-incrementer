# URL Incrementer

URLI ("yur-lee") lets you "increment" [+] any part of the URL. You can use it on gallery or thumbnail websites, forums, or any site that keeps its URLs organized sequentially by numbers or letters or paginated via next prev links. It's a lightweight extension (under 200KB!) and its core functionality doesn't require any special permissions from you.

To start using it, just click the extension icon, select the part of the URL you want to increment, and then press the [+] button (or use shortcuts) to start incrementing!

Features:
- Auto Incrementing
- Downloading [Experimental] (Requires Extra Permissions)
- Next [>] Prev [<] [Experimental]
- Chrome Shortcuts
- Internal Keyboard / Mouse Button Shortcuts (Requires Extra Permissions)
- Many Options

Special Thanks:
NickMWPrince, Blue, Blue Chan, Will, Adam C., Coolio Wolfus ... and "U" of course for using "URLI"! :)

What's New in Version 4.4 (May 14, 2018)
- New Look: New extension icon and more intuitive UI icons
- New Auto Increment function!
- New Download function! (Experimental)
- MANY options added! Change the toolbar icon, adjust the popup icon sizes, get icon feedback when incrementing or other actions, and add Next [>] Prev [<] buttons to Popup UI
- MANY convenience enhancements! Now saves changes you make in Popup UI, automatically brings up the Popup UI Setup panel if the URL hasn't been setup, and better support for selecting the part of the URL (now includes touch support)
- Permissions Modularized: Internal Shortcuts, Download, Enhanced Functionality permissions are now separate so you can grant and enable only what you want to 
- Improved Internal Shortcuts #1: Updated KeyboardEvent: "keyCode" to "code" and MouseEvent: "which" to "button" and also now supports modifier keys as shortcuts (e.g. "Shift" can be used by itself now)
- Changed default internal keyboard shortcuts from Alt+Ctrl+Shift+? to Alt+Shift+? due to some platforms disabling the former recently
- Internal code changes: better tab instance memory management (now using JavaScript Map instead of array) + minor bugfixes
- Note: The options had to be reset due to this major update and the way URLI now modularizes permissions for each function. I'm very sorry for the inconvenience!

What's New in Version 3.3 (July 20, 2015)
- Added back internal keyboard and mouse button shortcuts
- Added support for Alphanumeric and Bases (Base 2 Binary thru Base 36 Hexatrigesimal)
- Added support for selection customization including using custom Regular Expressions
- To provide better flexibility, Plus [+], Minus [-], Next [>], and Prev [<] are now each separate shortcut operations and are no longer "shared" together
- Next [>] Prev [<] functionality now only works with quick shortcuts and was removed from UI to avoid confusion with Plus [+] Minus [-] Setup
- Fixed leading zeros issue where it would forget a number originally had a leading zero after Plus [+]'ing it (e.g. 09 -> 10)
- Fixed an issue where it would forget its URL/Pattern when you go back to Setup after navigating away
- Note: The options had to be reset to fix and make all the changes in this update. I'm very sorry for the inconvenience. I apologize deeply to anyone who used this extension from 7/1/2015 thru 7/19/2015 (Version 3 thru 3.2). The extension was in a beta state and should have undergone much more testing before being updated.