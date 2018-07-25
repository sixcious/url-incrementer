# URL Incrementer User Guide

![URL Incrementer](../_assets/img/darku/128.png?raw=true "URL Incrementer")

- [Infinite Scrolling (Scroll Incrementing)](#infinite-scrolling-(scroll-incrementing))
- [Auto Incrementing] (#auto-incrementing)


<img src="https://raw.githubusercontent.com/roysix/url-incrementer/master/_assets/svg/urli.svg?sanitize=true" width="196" height="196" align="right" style="transform:rotate(90deg)">

## Infinite Scrolling (Scroll Incrementing)

TODO (Version 6.0)

Toggle on Scroll in the Setup Window and click Accept to "turn on" Infinite Scrolling for the current page!

There are two scroll modes you can select: Default and Shadow DOM. Default puts the next page in an iframe, so that the JavaScript code for that page runs "self-contained" -- most websites work fine in default mode. But you can try Shadow DOM if you notice quirks, it's faster performance than iframes and great for simple sites, but there is a chance the next page may look a little "broken." This is because the Shadow DOM can't encapsulate the JavaScript like an iframe can.

Important: If the page height is too small and you can't scroll, please click the buttons to increment or have the next page load until you see a scroll bar.

## Auto Incrementing
TODO

## Download Incrementing
TODO

## Multi Incrementing
TODO

## Saving URLs
URLI can now remember your favorite URL patterns and intervals you set so you don't have to go into Setup each time. It's completely optional ("opt-in"), you can check the Save checkbox if you want to save a URL Profile. To protect your privacy to the highest standard, URLs will be saved just like the industry standard is for saving passwords: as cryptographic hashes. We use the PBKDF2 algorithm with an HMAC SHA-512, a randomly generated salt, and a high number of iterations.

After you save a URL, you can use your easier "Fav" Increment Decrement Shortcut Keys whenever you visit the site.

Important: Because we save URLs just like passwords, the URL must match exactly for it to be recognized (except for the part/number you selected to increment).

## Shuffle URLs
Think of this feature like how you would shuffle a deck of cards. It shuffles the URLs you'll see next. For example, say you start AUTO at page=1 with a Times of 9; every page from page=2 to page=10 will be shuffled randomly and you will be guaranteed to see each page only once -- just in a random order. We use the Durstenfeld algorithm to perform the shuffling in O(n) time.

## Custom URLs
