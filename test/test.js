var assert = require("assert");
describe('absolution', function() {
  var absolution;
  it('should be successfully initialized', function() {
    absolution = require('../index.js');
  });
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
});

