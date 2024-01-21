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
  _.forEach(options.selfClosing, function(tag) {
    selfClosingMap[tag] = true;
  });

  var result = '';

  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs) {
      _.forEach(options.urlAttributes, function(attr) {
        if (_.has(attribs, attr) && attribs[attr].trim()) {
          if(attr === 'srcset') {
            let strings = _.split(attribs[attr], ",");
            
            _.forEach(strings, function(str, index) {
                str = str.trim();
                strings[index] = _.replace(str, _.split(str, " ")[0], url.resolve(base, _.split(str, " ")[0]))
            })

            strings = strings.join(", ");
            attribs[attr] = strings;

          } else {
            attribs[attr] = url.resolve(base, attribs[attr]);
          }

          if (options.decorator) {
            attribs[attr] = options.decorator(attribs[attr]);
          }
        }
      });
      result += '<' + name;
      _.forEach(attribs, function(value, a) {
        result += ' ' + a;
        if (value.length) {
          // Values are ALREADY escaped, calling escapeHtml here
          // results in double escapes
          if (value.includes('"')) {
            // Since htmlparser2 only gives us back valid attributes,
            // we can assume any value with double quotes should be a
            // single-quoted attribute
            result += "='" + value + "'";
          } else {
            result += '="' + value + '"';
          }
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
  urlAttributes: [ 'href', 'src', 'action', 'srcset' ],
  selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ]
};
