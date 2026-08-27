import { slugify } from "./slug";
import type { ExpertiseField, ExpertiseFieldDocument } from "./types";

// The shape of the expertise list, separated from fetching it so it can be
// tested without the Sanity client.
//
// Two normalisations every consumer depends on: a GROQ dereference yields a
// null entry for a reference whose target has been deleted or only exists as a
// draft, and the CMS has no slug field, so each field carries the one derived
// from its title rather than each caller deriving it again.

export { slugify as expertiseSlug } from "./slug";

export const normaliseFields = (
	fields: (ExpertiseFieldDocument | null | undefined)[] | null | undefined,
): ExpertiseField[] =>
	(fields ?? [])
		.filter((field): field is ExpertiseFieldDocument => Boolean(field))
		.map((field) => ({ ...field, slug: slugify(field.title) }));
