# URL Incrementer

URLI ("yur-lee") lets you "increment" [+] any part of the URL. You can use it on gallery or thumbnail websites, forums, or any website that keeps its URLs organized sequentially by numbers or letters or paginated via links.

Set your own shortcuts and fine-tune many options, including increment interval, alphanumeric/base and custom regular expression support. It's a lightweight extension and it was developed to not require any special permissions from you.

Also supports auto-incrementing, next-prev functionality, and downloading!

Please Note: Download and Next [>] Prev [<] functionality are currently experimental and may not work properly on some sites.

Special Thanks:
NickMWPrince, Blue, Blue Chan, Will, Adam C., Coolio Wolfus, and everyone who has providing valuable feedback/comments in the reviews and support.
... and of course YOU for using this extension! :)

What's New in Version 4.4 (May 14, 2018)
- New name and look! "URL Incrementer" (URLI) with a new icon and more intuitive UI icons
- New Auto-Increment function
- New Download + Increment function (Experimental)
- MANY more options added! Change the toolbar icon, adjust the popup icon sizes, get icon feedback when incrementing or other actions, and allow changes in Popup UI to persist
- MANY convenience enhancements! Now saves setting changes you make in Popup UI, automatically brings up the Setup panel if the URL hasn't been setup, and now supports touch support for selecting the part of the URL
- Internal code changes: better tab instance memory management (now using JavaScript Map instead of array)
- Improved Internal Shortcuts: Changed KeyboardEvent "keyCode" to "code" and MouseEvent "which" to "button"; can also now support modifier keys as shortcuts (e.g. "Shift" can be used by itself now); Changed default keyboard shortcuts from Alt+Ctrl+Shift+? to Alt+Shift+? due to some platforms disabling the former recently
- Note: The options had to be reset due to the way URLI now modularizes permissions for each function. Very sorry for the inconvenience!

What's New in Version 3.3 (July 20, 2015)
- Added back internal keyboard and mouse button shortcuts
- Added support for Alphanumeric and Bases (Base 2 Binary thru Base 36 Hexatrigesimal)
- Added support for selection customization including using custom Regular Expressions
- To provide better flexibility, Plus [+], Minus [-], Next [>], and Prev [<] are now each separate shortcut operations and are no longer "shared" together
- Next [>] Prev [<] functionality now only works with quick shortcuts and was removed from UI to avoid confusion with Plus [+] Minus [-] Setup
- Fixed leading zeros issue where it would forget a number originally had a leading zero after Plus [+]'ing it (e.g. 09 -> 10)
- Fixed an issue where it would forget its URL/Pattern when you go back to Setup after navigating away
- Note: The options had to be reset to fix and make all the changes in this update. I'm very sorry for the inconvenience. I apologize deeply to anyone who used this extension from 7/1/2015 thru 7/19/2015 (Version 3 thru 3.2). The extension was in a beta state and should have undergone much more testing before being updated.