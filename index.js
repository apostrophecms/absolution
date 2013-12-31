var htmlparser = require('htmlparser2');
var _ = require('lodash');
var url = require('url');

var absolution = module.exports = function(input, base, options) {
  if (!options) {
    options = absolution.defaults;
  } else {
    _.defaults(options, absolution.defaults);
  }

  var selfClosingMap = {};
  _.each(options.selfClosing, function(tag) {
    selfClosingMap[tag] = true;
  });

  var result = '';

  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs) {
      var changes = {};
      _.each(options.urlAttributes, function(attr) {
        if (_.has(attribs, attr)) {
          attribs[attr] = url.resolve(base, attribs[attr]);
          if (options.decorator) {
            attribs[attr] = options.decorator(attribs[attr]);
          }
        }
      });
      _.extend(attribs, changes);
      result += '<' + name;
      _.each(attribs, function(value, a) {
        result += ' ' + a;
        if (value.length) {
          // Values are ALREADY escaped, calling escapeHtml here
          // results in double escapes
          result += '="' + value + '"';
        }
      });
      if (_.has(selfClosingMap, name)) {
        result += " />";
      } else {
        result += ">";
      }
    },
    ontext: function(text) {
      // It is NOT actually raw text, entities are already escaped.
      // If we call escapeHtml here we wind up double-escaping.
      result += text;
    },
    onclosetag: function(name) {
      if (_.has(selfClosingMap, name)) {
        // Already output />
        return;
      }
      result += "</" + name + ">";
    }
  });
  parser.write(input);
  parser.end();
  return result;
};

absolution.defaults = {
  urlAttributes: [ 'href', 'src', 'action' ],
  selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ]
};
