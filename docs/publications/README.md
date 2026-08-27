# Publications: French drafts

45 French drafts, one file per piece of the programme in
`docs/publications-editorial-brief.md` section 8. Filenames carry the brief's
identifiers (`a01`, `b07`, `s14`) so a file and a line of the timetable line up.

**These are drafts, not copy.** Section 5 of the brief forbids publishing
machine-written legal text, for two reasons that both still apply: the
YMYL quality bar, and the fact that a legal error in this material is invisible
to a non-lawyer. Every file carries `status: brouillon, non validé`. Treat each
one as an outline with the law already looked up and the structure already
right, to be verified, corrected and dictated over by Alice before anything
reaches Sanity.

## What is in a file

YAML frontmatter carrying the Sanity fields of section 7, then the body in the
format of section 3: an answering first paragraph, `h4` headings named after
the thing itself, bold on the operative sentences, an `En pratique` half in
imperative voice, and a closing passage on the role of the lawyer.

`titlefr` already carries the `<Guide> - Épisode <n> : <subtitle>` shape that
`libs/publication-fields.js` parses. The subtitle, not the whole string, is what
becomes the `h1` and the title tag, so the subtitle is what carries the target
query.

## Internal links

A piece links to its practice area page and backwards to pieces already
published on its own date, plus forwards to the next episode of its guide,
which the brief requires. Nothing else links forward: the timetable publishes
these over fifteen months and a link to a piece with a future `publishedAt`
resolves to a 404 until that date passes.

## Before any of it is published

Work through the checklist in section 10 of the brief. The two boxes that
matter most here are the last two: statute references verified against the text
in force on the day of publication, and read and approved by Alice.
