import { readFile } from "node:fs/promises";
import applyInternationalHybrid from "../src/function/InternationalHybrid.mjs";

const sourceText = await readFile("src/function/InternationalHybrid.mjs", "utf8");
const responseText = await readFile("modules/assets/response.bundle.js", "utf8");

for (const text of [sourceText, responseText]) {
	if (!text.includes('"MUNIN_METADATA"')) {
		throw new Error("International Munin metadata selector is missing");
	}
	if (!text.includes('"muninBaseURL"') || !text.includes('"alternateResourcesURL"')) {
		throw new Error("Look Around service endpoints are not preserved");
	}
}

const globalRestore = 'copyKeys(hybridUrlInfo, internationalUrlInfo, [\n\t\t\t"muninBaseURL",\n\t\t\t"alternateResourcesURL",';
if (!sourceText.includes(globalRestore)) {
	throw new Error("Look Around endpoints are not restored for every client");
}

const navigationMerge = 'mode === "CN_FULL" || settings?.UrlInfoSet?.Directions === "AutoNavi"';
if (!responseText.includes(navigationMerge)) {
	throw new Error("Egern mainland navigation regression detected");
}

globalThis.Egern = {};
const result = applyInternationalHybrid({
	tileSet: [{ style: "MUNIN_METADATA", baseURL: "https://gspe76-ssl.ls.apple.com" }],
	urlInfoSet: [{}],
	attribution: [],
}, {
	XX: {
		tileSet: [{ style: "MUNIN_METADATA", baseURL: "https://gspe76-ssl.ls.apple.com" }],
		urlInfoSet: [{
			dispatcherURL: { url: "https://gsp-ssl.ls.apple.com" },
			directionsURL: { url: "https://directions-ssl.ls.apple.com" },
			muninBaseURL: { url: "https://gspe76-ssl.ls.apple.com" },
			alternateResourcesURL: [{ url: "https://gspe76-ssl.ls.apple.com/resources" }],
		}],
	},
	CN: {
		tileSet: [],
		urlInfoSet: [{
			dispatcherURL: { url: "https://dispatcher.is.autonavi.com" },
			directionsURL: { url: "https://direction2.is.autonavi.com" },
			muninBaseURL: { url: "https://gspe76-cn-ssl.ls.apple.com" },
			alternateResourcesURL: [{ url: "https://gspe76-cn-ssl.ls.apple.com/resources" }],
		}],
	},
}, {
	Hybrid: { Enabled: true, ServiceMode: "CN_POI" },
	UrlInfoSet: { Directions: "AutoNavi" },
});
delete globalThis.Egern;

if (!result.urlInfoSet[0].dispatcherURL.url.includes("autonavi.com")) {
	throw new Error("Mainland POI dispatcher was lost while restoring Look Around");
}
if (!result.urlInfoSet[0].directionsURL.url.includes("autonavi.com")) {
	throw new Error("Mainland navigation was lost while restoring Look Around");
}
if (result.urlInfoSet[0].muninBaseURL.url.includes("-cn-ssl")) {
	throw new Error("Egern still uses the mainland Munin endpoint");
}
if (result.urlInfoSet[0].alternateResourcesURL[0].url.includes("-cn-ssl")) {
	throw new Error("Egern still uses the mainland alternate resource list");
}

console.log("Egern Look Around regression tests passed");
