---
title: EICAR - check that anti-virus software is active
date: 2022-02-12
tags: javascript
---


The EICAR Test Virus is a short text file developed by the
[European Institute for Computer Anti-Virus Research (EICAR)](http://www.eicar.org)
for testing anitvirus software. It is a valid DOS program and produces sensible
results when run (it prints EICAR-STANDARD-ANTIVIRUS-TEST-FILE!).

Although it is entirely safe, all correctly functioning virus scanners should flag
any file that contains EICAR as malicious.


## Programmatic Checks

A small difficulty when including the EICAR virus in a program or script is that
the script itself, once written to disk, can then be deleted or quarantined by
the very virus scanner that you are trying to check.  So it is is necessary to
store the EICAR text in encoded form and decode on the fly as required.


For example, with [ROT13](https://en.wikipedia.org/wiki/ROT13) encoding, the virus text looks like:

```bash
    K5B!C%@NC[4\CMK54(C^)7PP)7}$RVPNE-FGNAQNEQ-NAGVIVEHF-GRFG-SVYR!$U+U*
```

And you could decode this with bash say, as follows:

```bash

    $ echo 'K5B!C%@NC[4\CMK54(C^)7PP)7}$RVPNE-FGNAQNEQ-NAGVIVEHF-GRFG-SVYR!$U+U*' | tr '[A-Za-z]' '[N-ZA-Mn-za-m]' > EICAR.txt

```


## Example: file upload

To test uploading malicious files to a web server with curl, read the decoded file from stdin rather than disk:


```bash

    $ EICAR=$(echo 'K5B!C%@NC[4\CMK54(C^)7PP)7}$RVPNE-FGNAQNEQ-NAGVIVEHF-GRFG-SVYR!$U+U*' | tr '[A-Za-z]' '[N-ZA-Mn-za-m]')
    $ echo -n "$EICAR" | curl -s -i -X POST -F "somefield=@-;filename=image.png" http://<SOME URL>

```

The key here is ``somefield=@-``, which causes curl to read from stdin. ``somefield`` is just the name
of the form field expected by the web server.
