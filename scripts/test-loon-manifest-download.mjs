import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("src/class/GEOResourceManifest.mjs", "utf8");
const bundle = await readFile("modules/assets/request.bundle.js", "utf8");
const plugin = await readFile("modules/iRingo.Maps.plugin", "utf8");

for (const [label, contents] of [["source", source], ["bundle", bundle]]) {
	if (!contents.includes('"$loon" in globalThis') && !contents.includes('"$loon"in globalThis')) {
		throw new Error(`${label}: Loon-specific clean request guard is missing`);
	}
	if (!contents.includes('Accept: "application/octet-stream"') && !contents.includes('Accept:"application/octet-stream"')) {
		throw new Error(`${label}: binary Accept header is missing`);
	}
}

if (!source.includes('method: "GET"')) throw new Error("source: clean Loon request must use GET");
if (!source.includes('url: targetURL.toString()')) throw new Error("source: clean Loon request must use the rewritten URL");
if (!bundle.includes('url:i.toString(),method:"GET"')) throw new Error("bundle: clean rewritten Loon URL was not generated");
if (!plugin.includes("#!version = 6.3.1")) throw new Error("plugin: version was not bumped to 6.3.1");
if (!plugin.includes("request.bundle.js?v=6.3.1")) throw new Error("plugin: request cache-buster was not updated");

let capturedRequest;
await new Promise((resolve, reject) => {
	const timer = setTimeout(() => reject(new Error("bundle simulation timed out")), 3000);
	const context = {
		console: { log() {}, error() {} },
		$loon: {},
		$script: { startTime: Date.now() },
		$argument: 'GeoManifest.Dynamic.Config.CountryCode="CN"&Storage="Argument"&LogLevel="WARN"',
		$request: {
			url: "https://gspe35-ssl.ls.apple.com/geo_manifest/dynamic/config?application=geod&country_code=CN&hardware=iPhone18%2C5",
			method: "GET",
			headers: {
				":path": "/geo_manifest/dynamic/config?application=geod&country_code=CN",
				"If-None-Match": "stale-cn-etag",
				"Accept-Language": "zh-CN",
				"User-Agent": "geod/test",
			},
		},
		$persistentStore: { read() { return null; }, write() { return true; } },
		$httpClient: {
			get(request, callback) {
				capturedRequest = request;
				callback(null, { status: 200, headers: { Etag: "test" } }, new Uint8Array([1, 2, 3]));
			},
		},
		$done() { clearTimeout(timer); resolve(); },
		btoa(value) { return Buffer.from(value, "binary").toString("base64"); },
		setTimeout,
		clearTimeout,
		URL,
		URLSearchParams,
		Uint8Array,
		ArrayBuffer,
		TextEncoder,
		TextDecoder,
	};
	try {
		vm.runInNewContext(bundle, context);
	} catch (error) {
		clearTimeout(timer);
		reject(error);
	}
});

if (new URL(capturedRequest.url).searchParams.get("country_code") !== "US") {
	throw new Error(`bundle simulation: expected US download, got ${capturedRequest.url}`);
}
if (capturedRequest.headers[":path"] || capturedRequest.headers["If-None-Match"]) {
	throw new Error("bundle simulation: intercepted pseudo headers or stale ETag leaked into Loon request");
}
if (capturedRequest.method !== "GET" || capturedRequest["binary-mode"] !== true) {
	throw new Error("bundle simulation: Loon request is not an unconditional binary GET");
}

console.log("Loon GeoManifest download regression checks passed");
