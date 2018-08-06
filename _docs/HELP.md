# URL Incrementer User Guide

![URL Incrementer](../_assets/img/darku/128.png?raw=true "URL Incrementer")

- [Infinite Scrolling (Scroll Incrementing)](#infinite-scrolling-scroll-incrementing)
- [Auto Incrementing](#auto-incrementing)
- [Download Incrementing (Multi-Page Downloading)](#download-incrementing-multi-page-downloading)
- [Multi Incrementing](#multi-incrementing)
- [Date Incrementing](#date-incrementing)
- [Error Skipping](#error-skipping)
- [Saving URLs](#saving-urls)
- [Shuffle URLs](#shuffle-urls)


<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/_assets/svg/urli.svg?sanitize=true" width="196" height="196" align="right" style="transform:rotate(90deg)">

## Infinite Scrolling (Scroll Incrementing)
Infinite Scrolling is the next level of incrementing! But because infinite scrolling is more complicated than the tab updating that URLI was built for, I'm working on a new extension called "Infy Scroll" that will have this functionality, so please look out for it soon!

## Auto Incrementing
TODO

Toggle on AUTO to start an auto-incrementing session.

## Download Incrementing (Multi-Page Downloading)
TODO

## Multi Incrementing
TODO

## Date Incrementing
Increment dates and times in URLs by providing a date format that is based on the selection! The "smallest" part of the date you selected will then be incremented. For example, if you selected a pattern like month/day/year, then day will be incremented by the interval.

Important: Each part of the date needs to be separated by a non date-format character (like 2018/01/25 or 2018-01-25 for example) or the format needs to be fixed-width without any separators (e.g. "201801"). 

#### Date Selection and Format Examples

Valid Examples:

| Selection  | Format     |
| ---------  | ---------- |
| 01/25/2018 | mm/dd/yyyy |
| Jan-2018   | Mmm-yyyy   |
| 18_1_25    | yy_m_dd    |
| 20180125   | yyyymmdd   |
| 12:30:05   | hh:mm:ii   |
| 1-25_12:30 | m-d_hh:mm  |

Invalid Examples:

| Selection   | Format    | Reason                                                                    |
| ----------  | --------- | ------------------------------------------------------------------------- |
| /01/25/2018 | /mm/dd/yyyy | 
| 01-252018   | mm-ddyyyy | Mixed usage of separators and non-separators between date parts           |
| 1252018     | mddyyyy   | Uses a non fixed-width date part without separators ("m" instead of "mm") |
| Sept-2018   | Mmm-yyyy  | "Sept" not in supported short month names ("Sep" only is)                 |

#### Date Formats
This is a table of all the allowable parts you can use in the format.

| Format | Component    | Presentation | Examples |
| ------ | ------------ | ------------ | -------- |
| yyyy   | Year         | 4 Digits     | 2000, 2010 |
| yy     | Year         | 2 Digits     | 00, 10 |
| mm     | Month        | 2 Digits     | 01, 12 |
| m      | Month        | 1 Digit      | 1, 12 |
| mmm    | Month        | Short Name Lowercased  | jan, dec |
| Mmm    | Month        | Short Name Capitalized | Jan, Dec |
| MMM    | Month        | Short Name Uppercased  | JAN, DEC |
| mmmm   | Month        | Long Name Lowercased   | january, december |
| Mmmm   | Month        | Long Name Capitalized  | January, December |
| MMMM   | Month        | Long Name Uppercased   | JANUARY, DECEMBER |
| dd     | Day          | 2 Digits     | 01, 31 |
| d      | Day          | 1 Digit      | 1, 31 |
| hh     | Hours        | 2 Digits     | 01, 23 |
| h      | Hours        | 1 Digit      | 1, 23 |
| ii     | Minutes      | 2 Digits     | 01, 59 |
| i      | Minutes      | 1 Digit      | 1, 59 |
| ss     | Seconds      | 2 Digits     | 01, 59 |
| s      | Seconds      | 1 Digit      | 1, 59 |
| ll     | Milliseconds | 4 Digits  | 0001, 0999 |
| l      | Milliseconds | 1 Digit   | 1, 999 |

* For the yy format (2 Digit Year) format, if the year is less than 70, we assume the 2000s (2000 - 2069). Otherwise, we assume the 1900s (1970-1999).

#### Short and Long Month Names
Only the the EN-US language is currently supported.

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

## Error Skipping
This checks if the next URL will return an HTTP error code (like 404) and increments again, skipping it up to 100 times, or until it finds the next good URL. If an error is encountered, the extension icon will flash with the error code (or flash \"RED\" for redirects). Set it to 0 to disable it. Important: This will make a request to the server each time to check the status code, and setting this value too high might cause the server to issue a \"Too Many Requests\" response. A value of 10 or less should be reasonably OK. Also, Please Note: Using this with Auto or the Popup UI/1-Click Buttons requires Enhanced Mode.

### An Error-Skipping Example
You are on page=1 and increment with error skip set to 10. If the next 3 pages (page=2 thru page=4) don't exist, they'll be skipped and you'll be taken to the next valid page, page=5 automatically. If more than 10 consecutive pages don't exist, URLI will "give up" checking since error skip is set to 10, and take you to page=12. You can then manually increment again to repeat the process.

### Important Note!
You MUST have Enhanced Mode enabled to use Error Skipping in the following situations:
1. On "Browser Error Pages" (e.g. the website didn't implement an error page, so the browser forwarded you to its own error page)
2. When using the Popup or 1-Click Buttons
3. With AUTO

Finally, a few websites may not send an error code and instead "swallow" the error code, returning HTTP Response Code 200 ("OK") while displaying a customized error page. Error Skipping won't work on these websites.

## Saving URLs
To make life easy, you can save your favorite URL patterns and Increment Decrement settings (such as selection and interval) so you don't have to go into Setup each time. It's completely optional ("opt-in"), you can check the Save checkbox if you want to save a URL Profile. You can also have the Save checkbox always pre-checked in the Options.

After you save a URL, you can use your easier "Fav" Increment Decrement Shortcut Keys whenever you visit the site.

### How Are URLs Saved?
To protect your privacy to the highest standard, URLs are saved just like the industry standard is for saving passwords: as cryptographic hashes. We use the PBKDF2 algorithm with an HMAC SHA-512, a randomly generated salt, and a high number of iterations. This is a *one-way* process, meaning it is impossible for anyone to decrypt the hashes. The only way anyone can figure out the URLs is if they used brute-force and checked every single possible URL in existence using the same cryptographic hash function and checking if the hashes are equal.

### Where Are The Cryptographic Hashes Saved?
The cryptographic hashes are *only* saved to your local extension storage space on your PC (not in a sync'd cloud storage space). You can always delete them in the Options > Saved URLs section or by clicking the Reset Options button. Also, if you uninstall the extension, the hashes are also automatically removed (along with all the other extension data of course).

### Creating Saved URL Wildcards
TODO: May not be in final version

Because we save URLs just like passwords, the URLs must match exactly for it to be recognized (except for the part/number you selected to increment). For example, if you save https://www.google.com/abc/page=1 then http://www.google.com/xyz/page=1 will not be recognized because of the difference in abc and xyz.

To mitigate this, you can also add less-restrictive URL patterns to save the interval, base, and base case. However the selection will need to use a predefined option like (page=, or last number). The pattern must match the first part of the URL however. 

## Shuffle URLs
Think of this feature like how you would shuffle a deck of cards. It shuffles the URLs you'll see next. For example, say you start AUTO at page=1 with a Times of 9; every page from page=2 to page=10 will be shuffled randomly and you will be guaranteed to see each page only once -- just in a random order. We use the Durstenfeld algorithm to perform the shuffling in O(n) time.

## TODO