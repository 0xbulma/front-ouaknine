import { splitAddress } from "./address";

test("the address block splits into street and displayed phone", () => {
	expect(
		splitAddress("17 rue de Douai, 75009 Paris, France\nTél. : +33 (0)1 84 16 20 35"),
	).toStrictEqual({
		street: "17 rue de Douai, 75009 Paris, France",
		phone: "+33 (0)1 84 16 20 35",
	});
	expect(
		splitAddress("17 rue de Douai, 75009 Paris, France\nTel: +33 (0)1 84 16 20 35"),
	).toStrictEqual({
		street: "17 rue de Douai, 75009 Paris, France",
		phone: "+33 (0)1 84 16 20 35",
	});
});

test("missing and single-line input", () => {
	expect(splitAddress(undefined)).toStrictEqual({ street: "", phone: "" });
	expect(splitAddress("17 rue de Douai")).toStrictEqual({
		street: "17 rue de Douai",
		phone: "",
	});
});
