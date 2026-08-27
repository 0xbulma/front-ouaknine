// libs/clientApi.ts builds a client at module scope, and createClient refuses a
// blank projectId, so the env has to exist before the import. Hence `await
// import` rather than a top-level one.
const loadClientApi = async () => {
	process.env.NEXT_PUBLIC_SANITY_ID = "test-project";
	return import("./clientApi");
};

test("no SANITY_TOKEN is its own failure, not a bad secret", async () => {
	// pages/api/draft.ts branches on this class to answer 500 rather than 401.
	// An operator who never set the token is not a caller with a wrong secret,
	// and telling them so is the difference between a fixable error and a hunt.
	const { previewClient, DraftModeNotConfigured } = await loadClientApi();

	process.env.SANITY_TOKEN = "";
	expect(() => previewClient()).toThrow(DraftModeNotConfigured);

	delete process.env.SANITY_TOKEN;
	expect(() => previewClient()).toThrow(DraftModeNotConfigured);
});

test("a token present is enough to build the client", async () => {
	const { previewClient } = await loadClientApi();

	process.env.SANITY_TOKEN = "sk-not-a-real-token";
	// Whether Sanity accepts it is Sanity's answer, not this module's: the point
	// is that it gets far enough to ask, which is what makes the 401 mean
	// "rejected" rather than "never configured".
	expect(previewClient().config().token).toBe("sk-not-a-real-token");
});

test("stega is on only for a draft read", async () => {
	const { getClient } = await loadClientApi();
	process.env.SANITY_TOKEN = "sk-not-a-real-token";

	// The published client cannot produce edit links; that is the whole reason
	// draft mode gates it. Invisible Unicode in published HTML is the failure.
	expect(getClient().config().stega.enabled).toBe(false);
	expect(getClient(true).config().stega.enabled).toBe(true);
});
