import clientApi from "./clientApi";
import { normaliseFields } from "./expertise-list";
import type { ExpertiseDocument, ExpertiseDocumentRaw } from "./types";

const EXPERTISE_QUERY = `*[_type == "expertise" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title,
  "expertiseList": expertiseList[]->
}`;

// Normalised once, where every consumer reads the list. The shaping is in
// libs/expertise-list.ts, which is pure and therefore tested.
export const fetchExpertise = async (locale?: string): Promise<ExpertiseDocument | null> => {
	const doc = await clientApi.fetch<ExpertiseDocumentRaw | null>(EXPERTISE_QUERY, {
		locale: locale ?? "fr",
	});
	if (!doc) return null;

	return { ...doc, expertiseList: normaliseFields(doc.expertiseList) };
};
