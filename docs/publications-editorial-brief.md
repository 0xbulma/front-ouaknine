# Publications: editorial brief

For anyone writing for `/publications`. Read this before writing the first line.
It is written in English to match the rest of the repository documentation; the
titles, examples and required phrasings are French because the copy is.

---

## 1. Why this section exists

Search Console, twelve months to August 2026: 897 clicks against 50,788
impressions. Eighty-seven per cent of the attributable clicks are the firm's own
name. Queries pairing a field of criminal law with "paris" sat at **average
position 61** and returned five clicks in a year.

The reason is size. All ten French expertise pages together are about 1,850
words. The pages that rank on page one for these terms are an order of magnitude
larger. No technical fix moves position 61 while the site has nothing to read.

One thing on this domain has ranked on page one: the *Guide de survie en garde à
vue*, five bilingual episodes written by Alice Ouaknine. The whole guide is 4,602
French words, more than twice the entire expertise section.

Read the numbers carefully, because they carry two different lessons.

| | Clicks | Impressions | Position |
|---|---|---|---|
| French guide, all five episodes | 3 | 112 | 6.3 to 7.5 |
| English episode 1 alone | 59 | 12,791 | 6.7 |

**The format ranks.** Every episode sits on page one in both languages. That is
the part to copy: the structure in section 3, and above all the "En pratique"
half that no directory writes.

**The French titles match nothing anyone types.** Not one query in twelve months
of Search Console contains the word "guide". The French episodes rank at position
6 on searches that barely exist, because they are titled for the series
("Connaître ses droits") rather than for the question a reader asks
("Combien de temps peut durer une garde à vue ?"). The English episode won its
12,791 impressions by accident of matching a real query, `garde a vue in english`,
and that traffic converted to almost nothing, which is why section 8 tells you not
to translate for its own sake.

So: keep the format, and title every piece for the search, not for the series.
Section 6 is not optional polish; it is the half of this the guide got wrong.

---

## 2. Who is reading

Two profiles, and a piece is written for one of them, never both.

**The organisation.** A general counsel, a compliance officer, a DRH, a finance
director. Reads on a laptop, at work, scoping a problem before deciding whether
to instruct anyone. Wants method, sequence and risk. Will read 1,000 words and
judge the firm's competence from them. This is the reader for **Guide A** and for
most of the standalone articles.

**The individual under investigation.** A company director who has been summoned,
searched, or told an investigation has opened. Often reading on a phone, often at
speed, often frightened. Wants to know what is about to happen to them and what
they can do in the next hour. This is the reader for **Guide B**.

Neither is a consumer looking for a definition. Neither is a law student. Do not
write for a general audience.

---

## 3. The format, taken from the guide that worked

### Shape of a piece

```
Title, in question or object form
    One short definitional paragraph. No preamble, no "dans cet article nous
    verrons".

h4  A named point of law
    The rule.
    The nuance or the exception.
    The recent statutory position ("depuis la loi du 22 avril 2024, ...").
    Bullets only where the elements are genuinely enumerable.

h4  The next point of law
    ...

h4  En pratique :
    h4  An imperative instruction
        Two or three sentences on what to actually do, and why the obvious
        move is the wrong one.
    h4  The next instruction
        ...

h4  Le rôle de l'avocat
    (mandatory, see section 4)
```

### Rules

**Length: 500 to 1,000 words.** The existing episodes run 599, 668, 979, 1,177
and 1,179. Do not write 2,500-word monoliths; the series is the unit of depth,
not the individual piece.

**Headings are `h4`.** That is what the existing documents use and what the page
styles. Name a heading after the thing itself ("Droit de garder le silence"),
not after its function ("Deuxième point").

**Bold carries the operative sentence.** A reader who skims only the bold must
still come away with the answer. This is deliberate and it is why the guide
ranks. Do not bold for emphasis or rhythm; bold the sentence that decides
something.

**"En pratique" is half the piece.** It is the part no directory and no
competitor writes, because writing it requires having stood in the room. Voice is
imperative and direct: *"Relisez bien le procès-verbal de notification de vos
droits avant de le signer"*, *"Solliciter la visite du médecin est utile, même
pour quelqu'un en bonne santé"*. Say what people get wrong, not just what the
rule is.

**Address the reader as "vous"** in Guide B and in anything aimed at an
individual. Use the impersonal or "l'entreprise" in Guide A.

**Cite the text.** Article number, statute, date. *"en application de l'article
62-2 du Code de procédure pénale"*. Link to Légifrance where it helps. This is
the difference between a law firm's writing and content marketing.

**Date-stamp the law.** When a rule changed recently, say when. When a piece
later goes out of date, revise it in place and update `publishedAt`; do not
publish a correction as a new piece.

---

## 4. Every piece states the role of the lawyer

**This is a house rule, not a suggestion.** Every article and every episode
carries a passage that makes explicit what an avocat does at that point in the
process.

### Why

1. **It is the only part the reader cannot get elsewhere.** Légifrance has the
   text. A directory has the definition. What an avocat actually does at that
   moment, and what it changes, exists nowhere else.
2. **It is the credibility signal.** Legal content is what Google classes as
   YMYL, where the quality bar is harshest. Writing that demonstrably comes from
   practice rather than from research is what clears it.
3. **It is how the reader works out that they need help.** Not by being told to
   call, but by understanding what a lawyer would do that they cannot.

### How

Put it in the "En pratique" section or as its own closing `h4`
("Le rôle de l'avocat", "Ce que fait l'avocat à ce stade", or named for the
specific act).

Answer, concretely:

- **What the lawyer does.** The act, the deadline, the document, the argument.
  Name it.
- **What it changes.** The procedural consequence. This is the important part.
- **When to instruct.** The trigger moment, not "le plus tôt possible".
- **What happens without one.** Factually, without dramatising.
- **Where it applies**, the cross-border or bilingual dimension: Alice is
  admitted to the Paris and California bars, which is the firm's genuine
  differentiator and is under-used across the site.

### The model

From episode 1 of the existing guide, which is exactly right:

> Il est très fortement conseillé de se prévaloir de ce droit et de demander,
> même si votre avocat n'est pas disponible ou n'entend pas se déplacer, à être
> assisté d'un avocat commis d'office. **En effet, et sauf dans certains cas
> exceptionnels, aucune audition ne peut débuter sans la présence de l'avocat dès
> lors que son intervention a été demandée.**

Note what it does: it gives a concrete procedural consequence, it corrects a
common mistake, and it never once praises the firm.

### Never

- No self-promotion, no superlatives, no "notre cabinet est reconnu pour".
- No promised or implied outcomes.
- No client facts, however anonymised. See section 5.
- No comparison with other firms or lawyers.
- Not a call-to-action paragraph. The page already links to the practice area and
  to contact. A CTA in the body reads as advertising and undoes the credibility
  the rest of the piece just built.

---

## 5. Déontologie and compliance

**Professional secrecy is absolute.** No case, no client, no fact learned in
practice, however disguised. Illustrations are hypothetical or drawn from
published decisions, and published decisions are cited as such.

**Advertising rules bind this content.** An avocat's professional communication
must be sincere, must respect professional secrecy, and must not contain
self-praise, comparison with others, or claims about results. Write to inform,
never to solicit. **Alice validates every piece before publication.** If a
passage feels like marketing, it is.

**Nothing here is legal advice, and the writing should not read as if it were
directed at a particular reader's situation.** Describe the rule and the
practice; do not instruct an individual on their own case.

**Do not generate this content with AI.** Legal content sits in the harshest
category Google assesses. Machine-written legal text on a practising lawyer's
site risks a manual action that would cost more than the whole programme is
worth, and it will be factually wrong in ways a non-lawyer cannot see. A legal
editor working from Alice's dictation is fine. A model is not.

---

## 6. SEO rules

**One target query per piece**, chosen before writing, stated in the brief for
that piece. Write for the reader; the query decides the title and the first
paragraph, nothing else.

**Title.** The searcher's words, not the profession's. "Que remettre au parquet à
l'issue d'une enquête interne" beats "De la transmission des conclusions
d'investigation". Keep it under about 60 characters where possible; the page
appends the firm name automatically.

**First paragraph** answers the title's question directly. Do not build up to it.
This is what gets lifted into a featured snippet.

**Link internally, always.** Every piece links to at least: its own practice area
page, and one or two related pieces. Guide episodes link to the neighbouring
episodes by name. The existing guide already does this in prose and it is a large
part of why it ranks. Internal links open in the same tab; the site handles that.

**Do not repeat the query.** Once in the title, once in the first paragraph, then
write normally. Repetition reads badly and does not help.

**No thin pieces.** Under 500 words, it should be a section of another piece, not
its own page.

---

## 7. Working in Sanity

Documents are of type `post`. Fill:

| Field | Notes |
|---|---|
| `contentfr.titlefr` | French title |
| `contentfr.bodyfr` | French body |
| `contenten.titleen` / `contenten.bodyen` | Only for pieces marked `*` in the list |
| `slug` | One slug, shared by both languages. Set it deliberately; if left empty it is derived from the French title |
| `series` | **Pending the studio schema change (see the timetable).** The guide name, exactly the same string on every episode of that guide |
| `episode` | **Pending the studio schema change.** Number, for ordering |
| `relatedExpertise` | Reference to the practice area. Drives the on-page link and the structured data |
| `author` | `Alice Ouaknine` on the firm's own writing. On a press mention, the outlet or the journalist: the index prints this beside the date as the byline |
| `publishedAt` | Publication date. Update it when the piece is revised |
| `filter` | `fact` for the firm's own writing, `press` for a press mention |
| `source` | Press mentions only: the URL of the original article. Filling it marks the document as a press mention whatever `filter` says, so a reference link for the firm's own writing belongs in the body, not here |

**What decides whether a piece appears in a language is whether that language's
body is filled**, nothing else. `language` is a legacy field the publications
section does not read; leave it as you find it.

**Until `series` and `episode` exist, the title carries them.** Write an episode
title as `<Guide> - Épisode <n> : <subtitle>`; that is the shape the code parses
to group a guide and to set the page heading. Use one spelling of the guide name
every time: the existing guide is stored under three ("Guide de survie en garde à
vue", "Guide de survie à la garde à vue en France", and a variant of "Episode"
without the accent), which is what the fields will fix. When they land, the same
exact-string rule applies to the field.

---

## 8. The list

45 pieces. Two guides that read as complete units, plus standalone articles the
guides link into. `*` means write it in both French and English.

### Guide A: *Conduire une enquête interne*

Audience: the organisation. Episodes 1 to 7 expand the paragraph already on
`/expertise/enquetes-internes`, which is the outline.

| | |
|---|---|
| A1 | Ouvrir une enquête interne : déclencheurs, périmètre, calendrier |
| A2 | Qui doit mener l'enquête : interne, avocat, tiers |
| A3 | Les mesures conservatoires : mise à pied, suspension d'accès, préservation des preuves |
| A4 | L'audition : cadre loyal, information préalable, assistance |
| A5 | Collecter les preuves sans les fragiliser : messagerie, postes de travail, RGPD |
| A6 | Le rapport : faits établis, faits non établis, éléments invérifiables |
| A7 | Les suites : disciplinaires, pénales, organisationnelles |
| A8 | Le signalement d'un lanceur d'alerte : ce que la loi impose |
| A9 | Harcèlement moral ou sexuel : les particularités de l'enquête |
| A10 | Que remettre au parquet, et quand |
| A11 | Secret professionnel et confidentialité du rapport |
| A12* | L'enquête transfrontalière : standards américains et droit français |

### Guide B: *Guide de survie du dirigeant mis en cause*

Audience: the individual. Same register as the garde à vue guide: someone in
trouble who needs to know what happens next.

| | |
|---|---|
| B1 | La convocation : audition libre, garde à vue, témoin assisté, mise en examen |
| B2 | La perquisition dans l'entreprise : les premières heures |
| B3 | Vos droits en audition libre |
| B4 | Le droit de garder le silence quand on dirige une entreprise |
| B5 | Saisies et confiscations : protéger la trésorerie et les actifs |
| B6 | Personne physique, personne morale : qui est poursuivi, et pour quoi |
| B7 | La délégation de pouvoirs : ce qui vous protège, ce qui ne vous protège pas |
| B8 | Comprendre la qualification : le panorama des infractions d'affaires |
| B9 | L'instruction : mise en examen, contrôle judiciaire, expertises |
| B10 | AMF ou PNF : qui vous poursuit, et selon quelle procédure |
| B11 | La CJIP : ce que l'entreprise négocie, ce que le dirigeant ne peut pas |
| B12 | Jusqu'à quand peut-on être poursuivi : la prescription |
| B13 | Le procès correctionnel : déroulement et peines encourues |

### Articles

Named legal objects, explained in depth. The guides link into these.

| | |
|---|---|
| S1 | Sapin II, article 17 : les huit piliers du dispositif anticorruption |
| S2 | Le contrôle de l'AFA : ce qui est vérifié, comment s'y préparer |
| S3 | La cartographie des risques de corruption |
| S4 | Le Parquet National Financier : compétence, saisine, organisation |
| S5 | La procédure de sanction devant l'AMF |
| S6 | L'abus de biens sociaux : éléments constitutifs, prescription, sanctions |
| S7 | L'abus de confiance en entreprise |
| S8 | Corruption et trafic d'influence : les textes et leur portée |
| S9 | La prise illégale d'intérêts |
| S10 | Le blanchiment : l'infraction autonome |
| S11 | Escroquerie, faux et usage de faux en entreprise |
| S12 | Le délit d'initié et le manquement d'initié |
| S13 | La fraude au président et le faux ordre de virement |
| S14 | Le détournement d'actifs : typologies et détection |
| S15 | Discrimination et agissements sexistes : conduire l'enquête |
| S16 | Fuite de données et usage abusif des outils de l'entreprise |
| S17 | La responsabilité pénale de la personne morale (article 121-2) |
| S18* | La loi de blocage face au discovery américain |
| S19* | Entreprise française visée par le DOJ : premiers réflexes |
| S20* | FCPA et droit français : le risque de double poursuite |

### On the English versions

Only four pieces are written in both languages, and they are the four where
English search intent is real and commercially useful. The garde à vue guide was
translated in full and the English half brought 12,791 impressions of dictionary
traffic from outside France that converted to nothing. Do not translate for the
sake of it.

---

## 9. Timetable

Three pieces a month. **Each guide ships complete before the next begins**: a
guide whose episodes trickle out over ten months never reads as finished, and its
internal linking stays weak until it is.

| Month | Pieces | |
|---|---|---|
| Sept 2026 | *(no writing)* | Section ships. Sanity fields added, index renamed, sitemap resubmitted |
| Oct 2026 | A1, A2, A3 | |
| Nov 2026 | A4, A5, A6 | |
| Dec 2026 | A7, A8, A9 | |
| Jan 2027 | A10, A11, A12* | **Guide A complete** |
| Feb 2027 | B1, B2, B3 | |
| Mar 2027 | B4, B5, B6 | |
| Apr 2027 | B7, B8, B9 | |
| May 2027 | B10, B11, B12 | |
| Jun 2027 | B13, S1, S2 | **Guide B complete** |
| Jul 2027 | S3, S4, S5 | |
| Aug 2027 | S6, S7, S8 | |
| Sept 2027 | S9, S10, S11 | |
| Oct 2027 | S12, S13, S14 | |
| Nov 2027 | S15, S16, S17 | |
| Dec 2027 | S18*, S19*, S20* | **Complete: 45 pieces** |

About 36,000 words over fifteen months, roughly 2,400 a month. At two pieces a
month instead the same programme runs to mid-2028; the ordering does not change,
the guides simply complete in month 6 and month 13.

### What to expect

Nothing for the first three months. Guide A should begin showing positions around
month five or six. The compounding only becomes visible once a guide is complete
and cross-linked.

These are low-volume terms. At maturity the realistic figure is a few hundred
clicks a month, not thousands. Every one of them is a general counsel or a
director with a problem, which for this practice is the right trade. The second
return is harder to measure and probably larger: a firm that has published twelve
serious pieces on internal investigations wins the beauty parade against one that
has not, regardless of search.

---

## 10. Before a piece is published

- [ ] One target query, and the title uses the searcher's words
- [ ] First paragraph answers the title directly
- [ ] 500 to 1,000 words
- [ ] `h4` headings, named after the thing itself
- [ ] Bold carries the operative sentences; skimming the bold gives the answer
- [ ] An "En pratique" section in imperative voice
- [ ] **A passage on the role of the lawyer, concrete and non-promotional**
- [ ] Statute and article numbers cited; recent changes dated
- [ ] Links to its practice area page and to at least one related piece
- [ ] Guide episodes link to their neighbours by name
- [ ] No client facts, no outcome claims, no self-praise, no comparison
- [ ] Sanity fields filled, `series` string copied exactly
- [ ] Read and approved by Alice

---

## Related

- `CLAUDE.md` at the repository root: the design system these pages render in
- `/expertise/enquetes-internes` and `/expertise/droit-penal-des-affaires`: the
  two practice areas this programme supports
- The five existing episodes of the *Guide de survie en garde à vue*, which are
  the worked example of everything above
