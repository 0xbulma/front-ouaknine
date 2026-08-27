// The JSON-LD is the only thing on this site that Google reads and a visitor
// never sees, which is exactly why it needs asserting rather than eyeballing.
// `JsonLd` escapes `<` as `\u003c`, which is valid JSON and parses straight
// back, so no unescaping step is needed here.

export type JsonLdNode = Record<string, unknown>;

const parseScript = (container: HTMLElement, id: number) => {
	const scripts = container.querySelectorAll('script[type="application/ld+json"]');
	const script = scripts[id];
	if (!script) throw new Error(`no JSON-LD script at index ${id}`);
	return JSON.parse(script.innerHTML);
};

/** The `@graph` of the nth JSON-LD block a render emitted. */
export const graphOf = (container: HTMLElement, index = 0): JsonLdNode[] =>
	parseScript(container, index)["@graph"] ?? [];

/** The first node whose `@type` is, or includes, `type`. */
export const nodeOfType = (graph: JsonLdNode[], type: string): JsonLdNode | undefined =>
	graph.find(node => {
		const t = node["@type"];
		return Array.isArray(t) ? t.includes(type) : t === type;
	});
