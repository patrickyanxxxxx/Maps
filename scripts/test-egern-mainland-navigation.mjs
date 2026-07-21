import { readFile } from "node:fs/promises";

const moduleText = await readFile("modules/iRingo.Maps.yaml", "utf8");
const responseText = await readFile("modules/assets/response.bundle.js", "utf8");

const fixedArgument = 'UrlInfoSet.Directions="AutoNavi"';
const fixedCount = moduleText.split(fixedArgument).length - 1;
if (fixedCount !== 6) throw new Error(`Expected 6 fixed Egern navigation arguments, got ${fixedCount}`);
if (moduleText.includes('UrlInfoSet.Directions="{{{UrlInfoSet.Directions}}}"')) {
	throw new Error("Egern navigation is still controlled by a cached module argument");
}

const navigationMerge = 'mode === "CN_FULL" || (X === "Egern" && settings?.UrlInfoSet?.Directions === "AutoNavi")';
if (!responseText.includes(navigationMerge)) {
	throw new Error("Hybrid response merge does not restore mainland navigation for AutoNavi");
}

const pinnedResponse = "https://raw.githubusercontent.com/patrickyanxxxxx/Maps/41741c3/modules/assets/response.bundle.js";
const pinnedCount = moduleText.split(pinnedResponse).length - 1;
if (pinnedCount !== 3) throw new Error(`Expected 3 pinned Egern response scripts, got ${pinnedCount}`);

console.log("Egern mainland navigation regression tests passed");
