## 1.0.4 (2023-05-26)

* Add test and documentation about adding custom self-closing tags.

## 1.0.3 (2023-02-13)

* Although attributes are already escaped, we still have to output them
using quotation marks that are compatible with the escaped values, e.g.
if the escaped values contain unescaped double-quotes, then we must
single-quote the attribute, and vice versa. Note that it is not the task
of `absolution` to verify that the escapes are valid overall, only to
do no harm when transforming the document's URLs.
