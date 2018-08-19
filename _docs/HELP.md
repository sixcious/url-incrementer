# URL Incrementer User Guide

![URL Incrementer](../_assets/img/darku/128.png?raw=true "URL Incrementer")

- [Infinite Scrolling (Scroll Incrementing)](#infinite-scrolling-scroll-incrementing)
- [Auto Incrementing](#auto-incrementing)
- [Download Incrementing (Multi-Page Downloading)](#download-incrementing-multi-page-downloading)
- [The Incrementer's Toolkit](#the-incrementers-toolkit)
- [Multi Incrementing](#multi-incrementing)
- [Date Incrementing](#date-incrementing)
- [Error Skipping](#error-skipping)
- [Saving URLs](#saving-urls)
- [Shuffle URLs](#shuffle-urls)
- [Bases and Custom Bases](#bases-and-custom-bases)

<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/_assets/svg/urli.svg?sanitize=true" width="196" height="196" align="right">

## Infinite Scrolling (Scroll Incrementing)
Infinite Scrolling is the next level of incrementing! But because infinite scrolling is more complicated than the tab updating that URLI was built for, I'm working on a new extension called "Infy Scroll" that will have this functionality, so please look out for it soon!

## Auto Incrementing
TODO

Toggle on AUTO to start an auto-incrementing session.

## Download Incrementing (Multi-Page Downloading)
TODO

## The Incrementer's Toolkit
This is URLI's own special toolkit and lets you open up to 100 incremented tabs or generate a list of up to 10,000 incremented links at once. Click the Tool icon to open or close it. The toolkit works with the URL and selection you have selected.

The toolkit works with both Shuffle Mode on and Multi-Incrementing (it will do a simultaneous multi-increment on the parts selected).

## Multi Incrementing
Increment up to 3 different parts of the URL at the same time or individually. Select the part as normal and optionally adjust the interval or base, then click the *Share* icon near Selection. Repeat for each additional part, then click Accept. You'll see a new set of color-coded Increment Decrement buttons allowing you to increment just that part. The regular colored buttons will do a simultaneous increment for all the parts at once.

You can use Multi Incrementing with AUTO and the Toolkit to generate links or open tabs. In these modes, it will do a simultaneous multi-increment on all the parts you selected.

## Date Incrementing
Increment dates and times in URLs by changing the `Base` to `Date Time` and providing a date format that is based on the selection! The "smallest" part of the date you selected will then be incremented. For example, if you selected a pattern like month/day/year, then day will be incremented by the interval.

Important: Each part of the date needs to be separated by a non date-format character (like a `/` or a `-`, 2018/01/25 for example) or the format needs to contain only fixed-width date formats without any separators (e.g. "20180125").

*The following formats are variable-width and are not allowed without separators: `mmmm`, `Mmmm`, `MMMM`, `m`, `d`, `h`, `i`, `s`,`l`.*

#### Date Selection / Format Examples

Valid Examples:

| Selection  | Format     |
| ---------  | ---------- |
| 01/25/2018 | mm/dd/yyyy |
| Jan-2018   | Mmm-yyyy   |
| 18_1_25    | yy_m_dd    |
| 20180125   | yyyymmdd   |
| 12:30:05   | hh:ii:ss   |
| 1-25_12:30 | m-d_hh:ii  |

Invalid Examples:

| Selection   | Format    | Reason                                                                    |
| ----------  | --------- | ------------------------------------------------------------------------- |
| /01/25/2018 | mm/dd/yyyy | Selection has an unnecessary leading / and does not match format |
| 01-252018   | mm-ddyyyy | Mixed usage of separators and non-separators between date parts           |
| 1252018     | mddyyyy   | Uses a non fixed-width date part without separators ("m" instead of "mm") |
| Sept-2018   | Mmm-yyyy  | "Sept" not in supported short month names ("Sep" only is)                 |

#### Date Formats
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
This checks if the next URL will return an HTTP error code (like 404) and increments again, skipping it up to 100 times, or until it finds the next good URL. If an error is encountered, the extension icon will flash with the error code (or flash \"RED\" for redirects). Set it to 0 to disable it. Important: This will make a request to the server each time to check the status code, and setting this value too high might cause the server to issue a \"Too Many Requests\" response. A value of 10 or less should be reasonably OK.

You may notice a minor delay (~1 second) when incrementing with error skipping due to the time it takes to wait for a response from a server.

#### An Error-Skipping Example
You are on page=1 and increment with error skip set to 10. If the next 3 pages (page=2 thru page=4) don't exist, they'll be skipped and you'll be taken to the next valid page, page=5 automatically. If more than 10 consecutive pages don't exist, URLI will "give up" checking since error skip is set to 10, and take you to page=12. You can then manually increment again to repeat the process.

#### Important Note!
You MUST have Enhanced Mode enabled to use Error Skipping in the following situations:
1. On "Browser Error Pages" (e.g. the website didn't implement an error page, so the browser forwarded you to its own error page)
2. When using the Popup or 1-Click Buttons
3. With AUTO

Finally, a few websites may not send an error code and instead "swallow" the error code, returning HTTP Response Code 200 ("OK") while still displaying a customized error page. Error Skipping won't work on these websites.

## Saving URLs
To make life easy, you can save your favorite URLs and Increment Decrement settings (such as selection and interval) so you don't have to go into Setup each time. It's completely optional ("opt-in"), you can check the Save checkbox if you want to save a URL Profile. You can also have the Save checkbox always pre-checked in the Options.

After you save a URL, you can jump straight to using shortcuts or buttons to increment on every visit!

#### How Are URLs Saved?
To protect your privacy, URLs are saved just like the industry standard is for saving passwords: as cryptographic hashes. We use the PBKDF2 algorithm with an HMAC-SHA512, a randomly generated salt, and a high number of iterations. This is a *one-way* process, meaning it is impossible for anyone to "decrypt" the hashes. The only way anyone can figure out the URLs is if they used brute-force and checked every single possible URL in existence using the same cryptographic hash function and random salt and then checking if the hashes are equal. We also actually split the URLs into two parts (meaning we go to the trouble of calculating **two separate hashes and salts for each URL!**).

When you view your saved URLs in Options, you'll see a small part of the hash (it's really super long) followed by the interval, base, and other formats.

#### Where Are The Cryptographic Hashes Saved?
The cryptographic hashes are *only* saved to your local extension storage space on your PC (not in a sync'd cloud storage space). You can always delete them in the Options > Saved URLs section or by clicking the Reset Options button. Also, if you uninstall the extension, the hashes are also automatically removed (along with all your other saved settings). We do not save anything outside the extension storage space allotted to us.

#### Recognizing Saved URLs
Because we save URLs just like passwords, the URLs must match exactly for it to be recognized (except for the part/number you selected to increment). For example, if you save https://www.example.com/abc/page=1 then https://www.example.com/xyz/page=1 will not be recognized because of the difference in abc and xyz.

## Shuffle URLs
Click the Shuffle (crossed-arrows) icon to turn this mode on.

Think of this feature like how you would shuffle a deck of cards. It shuffles the URLs you'll see next. For example, say you start AUTO at page=1 with a Times of 9; every page from page=2 to page=10 will be shuffled randomly and you will be guaranteed to see each page only once -- just in a random order. We use the Durstenfeld algorithm to perform the shuffling in O(n) time.


## Bases and Custom Bases
Bases are the "types" of numbers we can increment. The extension supports a vast amount of bases.



The most common bases are:
- 2 Binary - 0s and 1s! :)
- 8 Octal
- 10 Decimal (Default)
- 16 Hexadecimmal - Extremely popular, Hashing, Cryptography
- 32 Hexatrigesimal
- 62
- 64 Base 64 Extremely popular, Hashing, Cryptography

For a good example showing bases 2-36, please see the Table of Bases on Wikipedia. https://en.wikipedia.org/wiki/Table_of_bases

## TODO