import { readFile } from "node:fs/promises";
import applyInternationalHybrid from "../src/function/InternationalHybrid.mjs";

const sourceText = await readFile("src/function/InternationalHybrid.mjs", "utf8");
const responseText = await readFile("modules/assets/response.bundle.js", "utf8");
const egernBefore = await readFile("modules/iRingo.Maps.yaml", "utf8");

if (!sourceText.includes('mode === "CN_FULL" || settings?.UrlInfoSet?.Directions === "AutoNavi"')) {
	throw new Error("Source does not enable AutoNavi navigation for all clients");
}
for (const marker of ['settings?.UrlInfoSet?.Directions === "AutoNavi"', '"muninBaseURL"', '"alternateResourcesURL"']) {
	if (!responseText.includes(marker)) throw new Error(`Published response bundle is missing ${marker}`);
}

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

if (!result.urlInfoSet[0].directionsURL.url.includes("autonavi.com")) throw new Error("Non-Egern mainland navigation was not restored");
if (result.urlInfoSet[0].muninBaseURL.url.includes("-cn-ssl")) throw new Error("Non-Egern Look Around uses the mainland Munin endpoint");
if (result.urlInfoSet[0].alternateResourcesURL[0].url.includes("-cn-ssl")) throw new Error("Non-Egern Look Around uses mainland resources");

const egernAfter = await readFile("modules/iRingo.Maps.yaml", "utf8");
if (egernAfter !== egernBefore) throw new Error("Egern module changed during the multiclient test");

console.log("Multi-client navigation and Look Around regression tests passed");
