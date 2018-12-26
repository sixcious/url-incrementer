<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/img/128-default.png" width="128" height="128" title="URL Incrementer">
<br>
<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/assets/svg/urli.svg?sanitize=true" width="196" height="196" align="right" title="URLI">


# Help and Support
Is something not working right, or is there a feature that you'd like to see in URLI?
***Before*** leaving a low rating or review, please email me (my email address can be found in the Extension's Options page at the very bottom) or [open an issue](https://github.com/roysix/url-incrementer/issues) on GitHub.
I'll be notified about it immediately and reply to you with a fix as soon as I can!

# Infinite Scrolling (Scroll Incrementing)
Infinite Scrolling is the next level of incrementing! But because infinite scrolling is more complicated than the tab updating that URLI was built for, I'm working on a new extension called "Infy Scroll" that will have this functionality, so please look out for it soon!

# Auto Incrementing
Just toggle on `AUTO` in the bottom-left area of the Popup to start an auto-incrementing session!
You can have it repeat by clicking the `orange repeat` icon in the upper-right area of the Popup, and the URLs can be shuffled by clicking the `red crossed arrows` icon.
Pause or resume Auto anytime by clicking the `orange pause/play` button or by using a shortcut.

`Times` can be between 1 and 10,000 and `Seconds` refers to how long it will wait on the page before incrementing again.
5 seconds is good for a page with one image and 15 seconds is a good value for pages with many thumbnails.
`Wait for the page to fully load` is recommended because it forces the auto timer to not start until the page has fully loaded (including images).
If `Show the times left in the icon` is checked, the extension's icon badge will show you the `Times` remaining; otherwise it will just display `AUTO`.
Note that when Auto is enabled, you will not see error skipping or other action icon feedback badges (if you checked that feature in the Icon Options section).

Auto can be used with a variety of other features including Next/Prev, Multi, Shuffle, and Download (Auto Incrementer Downloader).

# Download Incrementing
You must first enable Download in the Options to see the Download (`DL`) toggle in the UI.
Also, make sure the *Ask where to save each file* option is unchecked in your Browser Settings (usually found in the Downloads section) and that you're aware of your browser's default Downloads folder location.

First start by choosing a `Strategy` like `Download these file extensions`.
URLI will dynamically generate the list of available extensions, tags, or attributes found on the page.
But if one of the file extensions or tags you want isn't on the current page, you'll need to use a Custom JavaScript selector.
Use optional filters like `URL Includes` and `URL Excludes` to add further restrictions on what URLI will download.
You can also manually select/unselect files by clicking on the `green check` icons in the Download Preview table, but note that this only applies to the **current page** you are on.

Enable both `AUTO` and `DL` toggles to use URLI's unique Auto Incrementer Downloader!
The minimum Auto `Seconds` is 5 and it is highly recommended to have the Auto `Wait for the page to fully load` checked to ensure the DOM has fully loaded so URLI can find the URLs.

By default, the downloads will be stored in your root Downloads folder as set in your browser settings.
But you can optionally have each page's downloads stored in its own subfolder while incrementing.
Just note that the file name and extension will be based verbatim on the URL (not dynamically handled by the server as usual), so make sure that the `Name` and `Ext` columns look right before choosing this option.


# URLI's Toolkit
This is my own special toolkit used for testing URLI that has been "unlocked" and made available to you as a non-standard feature!
It lets you crawl URLs for response codes, open up to 100 incremented tabs at once, or generate a list of up to 10,000 incremented links.
Click the `wrench` icon in the bottom-right area of the Popup to open or close it.
The toolkit works with the URL and selection you have currently selected.

Crawl URLs will open a new window (except on Firefox for Android).
You can leave the window minimized and continue multi-tasking while crawling.
Check/Uncheck the response types you want to, then download the table of links to see the results in full screen mode.
Close the window anytime to stop crawling.
Note that putting your device to sleep may "kill" URLI's background process and cause it to stop crawling.

The Toolkit works with both Shuffle and Multi modes.

# Multi Incrementing
Multi lets you increment up to 3 parts of the URL individually, simultaneously, or in ranges. You can even increment the same selection in multiple ways (for example, different intervals)!
Select the part as normal and optionally adjust the interval or base, then click the Multi `+++` button near Selection.
Repeat for each additional part, then click Accept.
You'll then see a new set of color-coded Increment Decrement buttons allowing you to increment just that one part or simultaneously increment all parts.

Note: You can always reset the multi parts by just clicking on the `+++` button again (after three parts have been selected).

Here are some of the neat things you can do with Multi:

## Multi Selections (Most Common)
This is the most common use for multi.
Select the different parts in the URL to increment and you will have a set of + - buttons for each selection.
Each pair of buttons will be labeled  by a `1`, `2`, or `3` depending on the order of your selections.

## Multi Intervals
Select the **same** part multiple times, but change the interval each time before clicking the `+++` button. This will let you have multiple buttons that can increment/decrement the selection by different amounts (e.g. a +1 Button, a +10 Button, and a +100 button)!

## Multi-Simultaneous Incrementing
A pair of `S` labeled Increment Decrement buttons will appear allowing you to simultaneously increment all the parts together in one click.
If you use Multi with AUTO or the Toolkit or use your regular Increment/Decrement shortcuts, by default all the parts will be incremented simultaneously as well!

## Multi-Range Incrementing
The most complicated multi function allows you to edit the URL and enter ranges for each selection. This performs a "compounded" increment for each part. This also works with AUTO and the Toolkit.

**Example**

`https://www.google.com/1/1/1`

Say you want to increment all three of the `1`s in this URL in different ranges (2, 3, 4 from left to right).
First, you would edit the URL to be:

`https://www.google.com/[1-2]/[1-3]/[1-4]`

Note that the format is `[selection-times]` (using `[]` bracket characters).
This way you can even use this with non-number objects like dates and custom bases.
For example, a date could be edited to be `[12/25/2018-7]` and would start at 12/25 and go all the way to 12/31 (a total of 7 days).

Next, you would highlight and select each part fully (e.g. `[1-2]`) and click on the `+++` button one by one.
Note that you must finish all your edits to the URL and then start to click the `+++` button to do your selections (do not edit, click, edit, click ...).
Note also that your selections' order matters. You usually want to select them in left-to-right order.
This will perform a compounded increment, such that it starts from 1/1/1 and ends at 2/3/4, performing 2 * 3 * 4 = 24 total increments:

    1/1/1 1/1/2 1/1/3 1/1/4

    1/2/1 1/2/2 1/2/3 1/2/4

    1/3/1 1/3/2 1/3/3 1/3/4

    2/1/1 2/1/2 2/1/3 2/1/4

    2/2/1 2/2/2 2/2/3 2/2/4

    2/3/1 2/3/2 2/3/3 2/3/4



You can use Multi Incrementing with AUTO and the Toolkit to generate links or open tabs. In these modes, it will either do a multi-simultaneous increment or a multi-range increment (if you edited the URL to have ranges).

# Date Time Incrementing
Increment dates and times in URLs by changing the `Base` to `Date Time` and providing a date format that is based on the selection!
The "smallest" part of the date you selected will then be incremented.
For example, if you selected a pattern like month/day/year, then day will be incremented by the interval.

Important: Each part of the date needs to be separated by a non date-format character (like a `/` or a `-`, e.g. `2018/01/25`) or the format needs to contain only fixed-width date formats without any separators (e.g. `20180125`).

*The following formats are variable-width and are **not** allowed without separators: `mmmm`, `Mmmm`, `MMMM`, `m`, `d`, `h`, `i`, `s`,`l`.*

## Date Selection / Format Examples

**Valid Examples**

| Selection  | Format     |
| ---------  | ---------- |
| 01/25/2018 | mm/dd/yyyy |
| Jan-2018   | Mmm-yyyy   |
| 18_1_25    | yy_m_dd    |
| 20180125   | yyyymmdd   |
| 12:30:05   | hh:ii:ss   |
| 1-25_12:30 | m-d_hh:ii  |

**Invalid Examples**

| Selection   | Format     | Reason                                                                    |
| ----------  | ---------- | ------------------------------------------------------------------------- |
| /01/25/2018 | mm/dd/yyyy | Selection has an unnecessary leading / and does not match format |
| 01-252018   | mm-ddyyyy  | Mixed usage of separators and non-separators between date parts           |
| 1252018     | mddyyyy    | Uses a non fixed-width date part without separators ("m" instead of "mm") |
| Sept-2018   | Mmm-yyyy   | "Sept" not in supported short month names ("Sep" only is)                 |

## Date Formats
This is a table of all the allowable parts you can use in the format.

| Format | Component   | Presentation | Examples   |
| ------ | ----------- | ------------ | ---------- |
| yyyy   | Year        | 4 Digits     | 2000, 2010 |
| yy     | Year        | 2 Digits     | 00, 10     |
| mm     | Month       | 2 Digits     | 01, 12     |
| m      | Month       | 1-2 Digits   | 1, 12      |
| mmm    | Month       | Short Name Lowercased  | jan, dec |
| Mmm    | Month       | Short Name Capitalized | Jan, Dec |
| MMM    | Month       | Short Name Uppercased  | JAN, DEC |
| mmmm   | Month       | Long Name Lowercased   | january, december |
| Mmmm   | Month       | Long Name Capitalized  | January, December |
| MMMM   | Month       | Long Name Uppercased   | JANUARY, DECEMBER |
| dd     | Day         | 2 Digits     | 01, 31     |
| d      | Day         | 1-2 Digits   | 1, 31      |
| hh     | Hour        | 2 Digits     | 01, 23     |
| h      | Hour        | 1-2 Digits   | 1, 23      |
| ii     | Minute      | 2 Digits     | 01, 59     |
| i      | Minute      | 1-2 Digits   | 1, 59      |
| ss     | Second      | 2 Digits     | 01, 59     |
| s      | Second      | 1-2 Digits   | 1, 59      |
| ll     | Millisecond | 3 Digits     | 001, 999   |
| l      | Millisecond | 1-3 Digits   | 1, 999     |

* For the `yy` format (2 Digit Year), if the year is less than 70, we assume the 2000s (2000 - 2069). Otherwise, we assume the 1900s (1970-1999).

## Short and Long Month Names
Only the the en-US language is currently supported.

- Jan - January
- Feb - February
- Mar - March
- Apr - April
- May - May
- Jun - June
- Jul - July
- Aug - August
- Sep - September
- Oct - October
- Nov - November
- Dec - December

# Error Skipping
This checks if the next URL will return an HTTP error code (like 404) and increments again, skipping it up to 100 times, or until it finds the next good URL. If an error is encountered, the extension icon will flash with the error code (or flash \"RED\" for redirects). Set it to 0 to disable it. Important: This will make a request to the server each time to check the status code, and setting this value too high might cause the server to issue a \"Too Many Requests\" response. A value of 10 or less should be reasonably OK.

You may notice a minor delay (~1 second) when incrementing with error skipping due to the time it takes to wait for a response from a server.

## An Error-Skipping Example
You are on page=1 and increment with error skip set to 10. If the next 3 pages (page=2 thru page=4) don't exist, they'll be skipped and you'll be taken to the next valid page, page=5 automatically. If more than 10 consecutive pages don't exist, URLI will "give up" checking since error skip is set to 10, and take you to page=12. You can then manually increment again to repeat the process.

## Error Skipping: An Important Note!
1. You **must** have Enhanced Mode enabled in the Options to use Error Skipping
2. Some websites may not send an error code and "swallow" it, instead returning HTTP Response Code 200 ("OK"), even while still displaying an error page. Error Skipping won't work on these websites.

# Saving URLs
You can save your favorite `URLs` and Increment Decrement settings for each of them (such as selection, interval, and base).
To save a URL, in the Popup, click the `heart <3` icon and click Accept after you're done. After you save a URL, you can jump straight to using shortcuts to increment on every subsequent visit, even after closing your browser.

***Example***: If you save URL `https://www.example.com/page-1`, and chose to increment the `1` then any URL that is exactly like that URL (except for the `1` part) will be recognized.

You can also save `Wildcards` to match multiple URLs. Wildcards are helpful, if for example, you wanted to match just the domain or a small substring of a URL. Wildcards can just be normal text or also be regular expressions.
To save a Wildcard, in the Options under Saved URLs, click the `Add Wildcard...` button, enter the wildcard, adjust the Increment Decrement settings for it, then click Save.

***Example***: Wildcard `example.com/posts/` with an Interval of `42` will match all URLs that contain `example.com/posts/` and increment them by 42 whenever you visit them.

Saving is completely optional ("opt-in").


## Saving URLs vs Saving Wildcards
URLs are saved just like passwords, must match exactly for it to be recognized (except for the part/number you selected to increment).
However, sometimes -- most especially on image boards or when you do searches -- sites will add tags and other parameters to the URL. In these cases, a **Wildcard** will work the best and allow you to match all the variances.
For example, say you save a wildcard `example.com/posts` with an Increment of `42`, then both `https://example.com/posts/tags=abc&page=0` and `https://www.example.com/posts/tags=xyz&page=0` will both be "recognized" and allow you to increment the page=0 to 42.
So long as any URL matches with your Wildcard `example.com/posts`, then whatever precedes or follows won't matter and it's considered a "match!"

## How Are URLs Saved?
To protect your privacy, URLs are saved just like the industry standard is for saving passwords: as cryptographic hashes.
We use the PBKDF2 algorithm with an HMAC-SHA512, a randomly generated salt, and a high number of iterations.
This is a *one-way* process, meaning it is impossible for anyone to "decrypt" the hashes.
The only way anyone can figure out the URLs is if they used brute-force and checked every single possible URL in existence using the same cryptographic hash function and random salt and then checking if the hashes are equal.
We also actually split the URL into two parts (replacing the selection with a different string) before hashing it, making even automated dictionary attempts to decipher them **extremely difficult!**

Here's a real example of how a saved URL looks:
`{hash: "", salt: **, selectionStart: 72, selectionEnd: -15, interval: 42, base: 10`

When you view your saved URLs in Options, you'll see a small part of the hash (it's really super long) followed by the interval, base, and other formats.

## How Are Wildcards Saved?
Wildcards are stored as encrypted hashes with a random IV (initialization vector); they're never saved in the "plaintext" form you originally entered them in.
But unlike the cryptographic hashed URLs, wildcard encrypted hashes can be decrypted if someone were to look at URLI's source code and then run the exact decrypt function and key it uses.
In most cases though, providing this one small layer of protection will be sufficient for most people's needs.
The wildcards will never be in clear view on your computer. For example, if someone were to search thru your extension storage space, they would only find encrypted hashes, and would need to put additional time and effort in to decrypting them.

## Where Are The Cryptographic Hashes Saved?
The cryptographic hashes are *only* saved to the local extension storage space on your device (**not** in a sync'd cloud storage space).
You can always delete them in the Options > Saved URLs section or by clicking the Reset Options button.
Also, if you uninstall the extension, all your saved data, including the hashes, are automatically deleted.

## Your Data IS YOUR Data
Many extensions do not bother at least hashing your saved URLs or even discussing this, but URLI really cares about your privacy and data!

# Shuffle URLs
Click the `red crossed-arrows` icon in the upper-right area of the Popup to turn this mode on.
You can turn on Shuffle in Normal, Auto, or Toolkit modes (Shuffle does not work when using Next Prev actions).

Think of this feature like how you would shuffle a deck of cards.
It shuffles the URLs you'll see next.
For example, say you start Auto Incrementing at page=1 with a `Times` of `9`; every page from page=2 to page=10 will be shuffled randomly and you will be guaranteed to see each page only once -- just in a random order.
Here's an example:

    page=5,4,9,10,7,2,8,3,6

Please note that the starting URL (page=1) is not included in the shuffled array; just the incremented URLs.
You can also turn on `Auto Repeat` mode at the same time and it will re-shuffle the URLs after it repeats and goes back to the starting URL. But since the starting URL (e.g. page=1) is not part of the shuffled URLs, you'll always know when it repeats and goes back to the start.

Also, you can adjust the `Shuffle Limit` in the Options to set a max upper bound in Normal Incrementing mode, which will apply in both directions.
For example, a `Shuffle Limit` of `1000` means URLI will pre-calculate and shuffle 500 incremented URLs and 500 decremented URLs (in relation to the starting URL).
In Auto or Toolkit modes, the shuffle limit value is not used since it is simply the Auto `Times` or Toolkit `Quantity` (see the above Auto example).

URLI uses the [Durstenfeld algorithm](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm) to perform the shuffling in an extremely efficient *O(n)* time.

# Bases and Custom Bases
Bases are the "types" of numbers we can increment. Think of them like different alphabets. URLI can increment all sorts of bases, even your own made-up custom ones. :)

Some common bases are:
- 2 Binary - 0s and 1s
- 8 Octal - 0-7 Was popular, but is not commonly used anymore
- 10 Decimal - 0-9 Our default number system
- 16 Hexadecimmal - 0-9 A-F Used in Hex Colors, Hashing, Cryptography
- 32 Hexatrigesimal - 0-9 A-Z The full alphanumeric alphabet (After 9, it goes to A, then every letter till Z and back to 0)
- Base 62 - 0-9 A-Z a-z Similar to Hexatrigesimal except it also contains lowercase alphabet as well
- Base 64 - Similar to Base 62 except additional characters are added like +/ Extremely popular, Hashing, Cryptography

For a good visual showing bases 2-36, please see the [Table of Bases on Wikipedia](https://en.wikipedia.org/wiki/Table_of_bases).


## Custom Bases
Change the `Base` to `Custom` and instantly define a custom alphabet to increment!
The alphabet can contain special characters, including !@#$%^&*()_+=-.
You can even use normal alphabets and just exclude certain letters.
The order of characters in the alphabet matters; also the first character is treated like "0" in our decimal number system.

Example:
Say you have defined a 5-character custom `Alphabet` of `aB!9?`. This is how it would look like when you start at `a` and increment with an interval of 1:

    a  B  !  9  ?
    Ba BB B! B9 B?
    !a !B !! !9 !?
    9a 9B 9! 99 9?
    ?a ?B ?! ?9 ??
    
Here are some common bases you can copy/paste into the `Alphabet` input:

Base 62  
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`

Base 64 (Standard Non-URL Friendly +/ Version Without = Padding)  
`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`

Base 64 (Modified URL Friendly -_ Version Without = Padding)  
`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`