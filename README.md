# erikhernal.com

Erik Hernal's portfolio, built as an engineering notebook. Each case study is a dated entry: the first number is struck through, the corrected one sits beside it in red, and the files behind it are taped in underneath.

It's a static Astro site with no client framework, no analytics and no tracking.

## Commands

Use Node 22 and pnpm 10.

```sh
pnpm install            # install dependencies
pnpm dev                # local dev server
pnpm exec astro build   # build the site into dist/
pnpm preview            # serve the built site
pnpm test               # unit tests for the check scripts and helpers
pnpm lint:copy          # copy rules over the built pages and the content files (needs a build)
pnpm check:private      # make sure nothing private ships (needs pdftotext from poppler)
pnpm check:links        # every link in dist/ resolves (needs a build and network)
```

## Where things live

- `src/content/work/` holds the four case studies, one markdown file each.
- `src/content/emails/` holds the four emails that point at them.
- `src/data/` holds the taped-in file excerpts, the Clay snapshot, the resume record, the resume figures and the client quotes.
- `src/data/receipts.json` is written by a script in a private repo and committed here. It checks the reply-to address on each email and counts the words, so the public site never holds a key. Don't edit it by hand.

## Copy rules

Every visible string follows these. `pnpm lint:copy` reads the text of every built page in `dist/`, including alt text and the meta description, plus the markdown in `src/content/`, and fails when one slips. The quoted file excerpts taped into the case pages are shown exactly as the files read, so the lint skips those blocks.

- No em or en dashes.
- No exclamation marks.
- Contractions and plain words.
- None of the words in `scripts/banned-words.json`.
- Don't invent claims, numbers, clients or quotes. Every figure on a case page comes from a file.

## The private check

`pnpm check:private` scans every file git tracks or would add, the built site in `dist/`, and the text of every PDF. It fails on phone numbers, any email address other than the public one, private hosts and addresses, hook URLs, key and secret names, and secret keys. It skips only the lockfile, images, fonts and its own files. If it can't read a PDF it fails rather than skipping it.

## Deploys

Pushes to main deploy on Vercel. CI runs the tests, the build and all three checks on every push to main and pull request.
