var assert = require("assert");
var absolution = require('../index.js');
const exp = require("constants");

describe('absolution', function() {
  it('should pass through unrelated markup unaltered', function() {
    assert.equal(absolution('<div><p>Hello <b>there</b></p></div>', 'http://example.com/child/'), '<div><p>Hello <b>there</b></p></div>');
  });
  it('should respect text nodes at top level', function() {
    assert.equal(absolution('Blah blah blah<p>Whee!</p>', 'http://example.com/child/'), 'Blah blah blah<p>Whee!</p>');
  });
  it('should respect absolute URLs', function() {
    assert.equal(absolution('<a href="http://example.com/example">Test</a>', 'http://example.com/child/'), '<a href="http://example.com/example">Test</a>');
  });
  it('should not bollux up empty tags', function() {
    assert.equal(absolution('<p><br /></p>', 'http://example.com/child/'), '<p><br /></p>');
  });
  it('should ignore unrelated URL schemes', function() {
    assert.equal(absolution('<a href="mailto:test@example.com">Test</a>', 'http://example.com/child/'), '<a href="mailto:test@example.com">Test</a>');
  });
  it('should preserve entities as such', function() {
    assert.equal(absolution('<a name="&lt;silly&gt;">&lt;Kapow!&gt;</a>'), '<a name="&lt;silly&gt;">&lt;Kapow!&gt;</a>');
  });
  // Note that quotation marks are removed in the below test because all attributes are reconstructed
  // and there is no need for quotation marks without a value
  it('should keep empty url attributes empty', function() {
    assert.equal(absolution('<link rel="stylesheet" href="" />', 'http://localhost:8000/index.html'), '<link rel="stylesheet" href />');
  });
  // Finally the cool thing!
  it('should resolve relative URLs ("file" in same "folder")', function() {
    assert.equal(absolution('<a href="grandchild.html">Test</a>', 'http://example.com/child/'), '<a href="http://example.com/child/grandchild.html">Test</a>');
  });
  it('should resolve relative URLs (../)', function() {
    assert.equal(absolution('<a href="../peer.html">Test</a>', 'http://example.com/child/'), '<a href="http://example.com/peer.html">Test</a>');
  });
  it('should not panic if ../ is overused', function() {
    assert.equal(absolution('<a href="../../../peer.html">Test</a>', 'http://example.com/child/'), '<a href="http://example.com/peer.html">Test</a>');
  });
  it('should support the decorator option', function() {
    assert.equal(absolution('<a href="../peer.html">Test</a>', 'http://example.com/child/', {
      decorator: function(url) {
        return 'http://test.com?url=' + encodeURIComponent(url);
      }
    }), '<a href="http://test.com?url=http%3A%2F%2Fexample.com%2Fpeer.html">Test</a>');
  });
  it('double quotes get single quoted', function() {
    assert.equal(absolution(`<a test='"'>quote test</a>`, 'http://example.com'), `<a test='"'>quote test</a>`);
  });
  it('single quotes get double quoted', function() {
    assert.equal(absolution(`<a test="'">quote test</a>`, 'http://example.com'), `<a test="'">quote test</a>`);
  });
  it('other entity escapes are preserved', function() {
    assert.equal(absolution(`<a test="&lt;">quote test</a>`, 'http://example.com'), `<a test="&lt;">quote test</a>`);
  });
  it('should use single quotes for data attributes that contain JSON', function() {
    const result = absolution(`<div data-test1='{"foo":"bar"}'>Test</div>`, 'http://example.com/child/');
    const expected = `<div data-test1='{"foo":"bar"}'>Test</div>`;
    assert.equal(result, expected);
  });
  it('should handle custom closing tags', function() {
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <a href="/docs/Web/SVG/Element/circle">
          <circle cx="50" cy="40" r="35"/>
        </a>
        <path d="M 10 10 H 90 V 90 H 10 L 10 10"/>
      
        <circle cx="10" cy="10" r="2" fill="red"/>
        <circle cx="90" cy="90" r="2" fill="red"/>
        <circle cx="90" cy="10" r="2" fill="red"/>
        <circle cx="10" cy="90" r="2" fill="red"/>
      </svg>
    `;

    const expected = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <a href="http://example.com/docs/Web/SVG/Element/circle">
          <circle cx="50" cy="40" r="35" />
        </a>
        <path d="M 10 10 H 90 V 90 H 10 L 10 10" />
      
        <circle cx="10" cy="10" r="2" fill="red" />
        <circle cx="90" cy="90" r="2" fill="red" />
        <circle cx="90" cy="10" r="2" fill="red" />
        <circle cx="10" cy="90" r="2" fill="red" />
      </svg>
    `;

    const result = absolution(svg, 'http://example.com', {
      selfClosing: [
        ...absolution.defaults.selfClosing,
        'path',
        'circle'
      ]
    });
    assert.equal(result, expected);
  });

  it('should handle the scrset in img', function() {
    const result = absolution(`<img src="cat.jpg" alt="cat" 
    srcset="cat-320.jpg 320w" />`, 'http://example.com/');

    const expected = `<img src="http://example.com/cat.jpg" alt="cat" srcset="http://example.com/cat-320.jpg 320w" />`

    assert.equal(result, expected);
  })

  it('shoulld handle the scrset in picture', function() {
    const picture = `
      <picture>
        <source media="(min-width:650px)" srcset="img_pink_flowers.jpg">
        <source media="(min-width:465px)" srcset="img_white_flower.jpg">
        <img src="img_orange_flowers.jpg" alt="Flowers" style="width:auto;">
      </picture>
      `;

    const expected = `
      <picture>
        <source media="(min-width:650px)" srcset="http://example.com/img_pink_flowers.jpg" />
        <source media="(min-width:465px)" srcset="http://example.com/img_white_flower.jpg" />
        <img src="http://example.com/img_orange_flowers.jpg" alt="Flowers" style="width:auto;" />
      </picture>
      `;

    const result = absolution(picture, 'http://example.com/', {
      selfClosing: [
        ...absolution.defaults.selfClosing,
        'source'
      ]
    });
    assert.equal(result, expected); 

  })

});
