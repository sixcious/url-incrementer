# References

This is a list of important references used in developing URLI. Full credit and thanks to these folks. :)

## General

[How to handle async/await in for loops](https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795)

## Background

Dynamically making an event page's background persistent
https://stackoverflow.com/questions/37017209/how-to-create-a-persistent-background-page-on-demand-google-chrome-extension

## Cryptography

PBKDF2 Hashing
https://timtaubert.de/blog/2015/05/implementing-a-pbkdf2-based-password-storage-scheme-for-firefox-os/

Uint8Array to Base64 String
https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string

Base64 String to Uint8Array
https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string/42334410#42334410

Custom Base Encoding / Decoding (Base 62)
https://medium.com/@harpermaddox/how-to-build-a-custom-url-shortener-5e8b454c58ae

## Auto

AutoTimer with Pause / Resume
https://stackoverflow.com/a/3969760

## Download

List of all HTML Tag Attributes that can contain URLs
https://stackoverflow.com/a/2725168

Getting a Filename from a URL
https://stackoverflow.com/questions/511761/js-function-to-get-filename-from-url/2480287#comment61576914_17143667

Getting an Extension from a Filename from a URL
https://stackoverflow.com/a/42841283

List of all style properties that can contain URLs
https://stackoverflow.com/q/24730939

Regex to find URLs from inline CSS Styles
https://stackoverflow.com/a/34166861

## Saved URLs / Wildcards

Escaping regular expressions
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

## Content Scripts

Guarding against multiple content script injections
https://stackoverflow.com/questions/23208134/avoid-dynamically-injecting-the-same-script-multiple-times-when-using-chrome-tab?rq=1

## Compression

Replacing Comments via Regex
http://blog.ostermiller.org/find-comment

Replacing multiple blank lines with one blank line via Regex
https://stackoverflow.com/questions/4475042/replacing-multiple-blank-lines-with-one-blank-line-using-regex-search-and-replac

Compressing PNGs (TinyPNG)
https://tinypng.com/

## Notes

1. Avoid using Messaging (`chrome.runtime.sendMessage()` and `chrome.runtime.port.message`) for long running periods of times (e.g. crawling for hours). Doing so causes the entire Chrome browser to shut down unexpectedly    