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

## Download Incrementing (Multi-Page Downloading)
TODO

## Multi Incrementing
TODO

## Date Incrementing
TODO

## Error Skipping
This checks if the next URL will return an HTTP error code (like 404) and increments again, skipping it up to 100 times, or until it finds the next good URL. If an error is encountered, the extension icon will flash with the error code (or flash \"RED\" for redirects). Set it to 0 to disable it. Important: This will make a request to the server each time to check the status code, and setting this value too high might cause the server to issue a \"Too Many Requests\" response. A value of 10 or less should be reasonably OK. Also, Please Note: Using this with Auto or the Popup UI/1-Click Buttons requires Enhanced Mode.

### Example
You are on page=1 and increment with error skip set to 10. If the next 3 pages (page=2 thru page=4) don't exist, they'll be skipped and you'll be taken to the next valid page, page=5 automatically. If more than 10 consecutive pages don't exist, URLI will "give up" checking since error skip is set to 10, and just take you to the 11th next page. You can then manually increment again to repeat the process.

## Saving URLs
To make life easy, you can save your favorite URL patterns and Increment Decrement settings (such as selection and interval) so you don't have to go into Setup each time. It's completely optional ("opt-in"), you can check the Save checkbox if you want to save a URL Profile. You can also have the Save checkbox always pre-checked in the Options.

After you save a URL, you can use your easier "Fav" Increment Decrement Shortcut Keys whenever you visit the site.

To protect your privacy to the highest standard, URLs are saved just like the industry standard is for saving passwords: as cryptographic hashes. We use the PBKDF2 algorithm with an HMAC SHA-512, a randomly generated salt, and a high number of iterations. This is a *one-way&* process, meaning it is impossible for anyone to decrypt the hashes. The only way anyone can figure out the URLs is if they used brute-force and checked every single possible URL in existence using the same cryptographic hash function and checking if the hashes are equal.

Also, the cryptographic hashes are *only* saved to your local extension storage space on your PC (not in a sync'd cloud storage space). You can always delete them in the Options > Saved URLs section or by clicking the Reset Options button. Also, if you uninstall the extension, the hashes are also automatically removed (along with all the other extension data of course).

Important: Because we save URLs just like passwords, the URL must match exactly for it to be recognized (except for the part/number you selected to increment). For example, if you save http://www.google.com/search?term=abc&page=1 then http://www.google.com/search?term=xyz&page=1 will not be recognized because of the difference in abc and xyz.

### Creating Saved URL Wildcards
TODO May not be in final version

To mitigate this, you can also add less-restrictive URL patterns to save the interval, base, and base case. However the selection will need to use a predefined option like (page=, or last number). The pattern must match the first part of the URL however. 

## Shuffle URLs
Think of this feature like how you would shuffle a deck of cards. It shuffles the URLs you'll see next. For example, say you start AUTO at page=1 with a Times of 9; every page from page=2 to page=10 will be shuffled randomly and you will be guaranteed to see each page only once -- just in a random order. We use the Durstenfeld algorithm to perform the shuffling in O(n) time.

## TODO