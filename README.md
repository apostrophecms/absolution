# absolution

<a href="http://apostrophenow.org/"><img src="https://raw.github.com/punkave/absolution/master/logos/logo-box-madefor.png" align="right" /></a>

`absolution` accepts HTML and a base URL, and returns HTML with absolute URLs. Great for generating valid RSS feeds.

`absolution` is not too picky about your HTML.

## Requirements

`absolution` is intended for use with Node. That's pretty much it. All of its npm dependencies are pure JavaScript. `absolution` is built on the excellent `htmlparser2` module.

## How to use

    npm install absolution

    var absolution = require('absolution');

    var dirty = '<a href="/foo">Foo!</a>';
    var clean = absolution(dirty, 'http://example.com');

    // clean is now:
    // <a href="http://example.com/foo">Foo!</a>

Boom!

If you want to do further processing of each absolute URL, you can also pass a decorator function:

    var clean = absolution(dirty, 'http://example.com', {
      decorator: function(url) {
        return 'http://mycoolthing.com?url=' + encodeURIComponent(url);
      }
    });

## Changelog

1.0.0: no new changes; declared stable as with the addition of the decorator option there's little left to do, and all tests are passing nicely.

0.2.0: decorator option added.

0.1.0: initial release.

## About P'unk Avenue and Apostrophe

`absolution` was created at [P'unk Avenue](http://punkave.com) for use in Apostrophe, an open-source content management system built on node.js. If you like `absolution` you should definitely [check out apostrophenow.org](http://apostrophenow.org). Also be sure to visit us on [github](http://github.com/punkave).

## Support

Feel free to open issues on [github](http://github.com/punkave/absolution).

<a href="http://punkave.com/"><img src="https://raw.github.com/punkave/absolution/master/logos/logo-box-builtby.png" /></a>

