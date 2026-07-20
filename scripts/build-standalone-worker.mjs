import { readFile, writeFile } from "node:fs/promises";

const releaseDirectory = process.argv[2];
const output = process.argv[3] ?? "dist/maps-worker.mjs";
if (!releaseDirectory) throw new Error("Usage: node build-standalone-worker.mjs <release-dir> [output]");

const argument = [
	'GeoManifest.Dynamic.Config.CountryCode="CN"',
	'UrlInfoSet.Dispatcher="AutoNavi"',
	'UrlInfoSet.Directions="AutoNavi"',
	'UrlInfoSet.RAP="Apple"',
	'UrlInfoSet.LocationShift="AUTO"',
	'TileSet.Earth="Apple"',
	'TileSet.Roads="XX"',
	'TileSet.Satellite="XX"',
	'LogLevel="WARN"',
].join("&");

function exposeBundle(source, marker, replacement) {
	const index = source.lastIndexOf(marker);
	if (index < 0) throw new Error(`Bundle marker not found: ${marker}`);
	return `${source.slice(0, index)}${replacement}`;
}

let requestBundle = await readFile(`${releaseDirectory}/request.bundle.js`, "utf8");
let responseBundle = await readFile(`${releaseDirectory}/response.bundle.js`, "utf8");

requestBundle = requestBundle.replaceAll(
	'case"gspe35-ssl.ls.apple.com":',
	'case"gspe35-ssl.ls.apple.com":case"gspe35-ssl.ls.apple.cn":',
);
responseBundle = responseBundle.replaceAll(
	'if("gspe35-ssl.ls.apple.com"===a.hostname)',
	'if(["gspe35-ssl.ls.apple.com","gspe35-ssl.ls.apple.cn"].includes(a.hostname))',
);

const satellite3D = 'case"SPUTNIK_METADATA":case"SPUTNIK_C3M":case"SPUTNIK_DSM":case"SPUTNIK_DSM_GLOBAL":case"SPUTNIK_VECTOR_BORDER":e=t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale&&t.size===e.size)||t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale)||t?.XX?.tileSet?.find(t=>t.style===e.style)||e;break;';
responseBundle = responseBundle.replace('switch(e.style){case"RASTER_SATELLITE"', `switch(e.style){${satellite3D}case"RASTER_SATELLITE"`);

const sprOriginal = 'case"VECTOR_SPR_MERCATOR":case"VECTOR_SPR_MODELS":case"VECTOR_SPR_MATERIALS":case"VECTOR_SPR_METADATA":case"SPR_ASSET_METADATA":case"VECTOR_SPR_POLAR":case"VECTOR_SPR_MODELS_OCCLUSION":M.info(`SPR style: ${e?.style}`),M.info(`SPR baseURL: ${e?.baseURL}`),M.debug(`SPR tile: ${JSON.stringify(e,null,2)}`);break;';
const sprInternational = 'case"VECTOR_SPR_MERCATOR":case"VECTOR_SPR_MODELS":case"VECTOR_SPR_MATERIALS":case"VECTOR_SPR_METADATA":case"SPR_ASSET_METADATA":case"VECTOR_SPR_POLAR":case"VECTOR_SPR_MODELS_OCCLUSION":e=t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale&&t.size===e.size)||t?.XX?.tileSet?.find(t=>t.style===e.style&&t.scale===e.scale)||t?.XX?.tileSet?.find(t=>t.style===e.style)||e;break;';
if (!responseBundle.includes(sprOriginal)) throw new Error("SPR patch marker not found");
responseBundle = responseBundle.replace(sprOriginal, sprInternational);

requestBundle = exposeBundle(
	requestBundle,
	'(async()=>{({$request,$response:V}=await ta($request))})()',
	'globalThis.__iRingoMapsRequest=ta})();',
);
responseBundle = exposeBundle(
	responseBundle,
	'(async()=>{$response=await ti($request,$response)})()',
	'globalThis.__iRingoMapsResponse=ti})();',
);

const wrapper = `
function kvAdapter(env) {
	return {
		async getItem(key) {
			const namespace = key.startsWith("@iRingo.Maps.Caches") ? env.Maps : env.PersistentStore;
			if (!namespace) return undefined;
			const value = await namespace.get(key);
			if (value == null) return undefined;
			try { return JSON.parse(value); } catch { return value; }
		},
		async setItem(key, value) {
			const namespace = key.startsWith("@iRingo.Maps.Caches") ? env.Maps : env.PersistentStore;
			if (!namespace) return false;
			await namespace.put(key, typeof value === "string" ? value : JSON.stringify(value));
			return true;
		},
	};
}

function headersObject(headers) {
	const result = Object.fromEntries(headers.entries());
	delete result.host;
	delete result["content-length"];
	return result;
}

async function requestBody(request) {
	if (request.method === "GET" || request.method === "HEAD") return undefined;
	return new Uint8Array(await request.arrayBuffer());
}

async function responseBody(response) {
	const bytes = new Uint8Array(await response.arrayBuffer());
	const type = response.headers.get("content-type")?.split(";", 1)[0] ?? "";
	if (["application/protobuf", "application/x-protobuf", "application/vnd.google.protobuf", "application/octet-stream"].includes(type)) return bytes;
	return new TextDecoder().decode(bytes);
}

export default {
	async fetch(request, env) {
		const KV = kvAdapter(env);
		const incomingURL = new URL(request.url);
		if (incomingURL.pathname === "/health") return new Response("ok", { status: 200 });
		const upstreamHost = incomingURL.pathname === "/config/defaults" ? "configuration.ls.apple.com" : "gspe35-ssl.ls.apple.com";
		incomingURL.hostname = upstreamHost;
		incomingURL.protocol = "https:";
		incomingURL.port = "";
		let proxyRequest = {
			url: incomingURL.toString(),
			method: request.method,
			headers: headersObject(request.headers),
			body: await requestBody(request),
		};
		const processed = await globalThis.__iRingoMapsRequest(proxyRequest, KV);
		proxyRequest = processed.$request;
		if (processed.$response) return new Response(processed.$response.body, processed.$response);
		const upstream = await fetch(proxyRequest.url, {
			method: proxyRequest.method,
			headers: proxyRequest.headers,
			body: proxyRequest.method === "GET" || proxyRequest.method === "HEAD" ? undefined : proxyRequest.body,
			redirect: "follow",
		});
		if (!upstream.ok || upstream.status === 204) {
			return new Response(upstream.body, { status: upstream.status, headers: upstream.headers });
		}
		let proxyResponse = {
			status: upstream.status,
			headers: Object.fromEntries(upstream.headers.entries()),
			body: await responseBody(upstream),
		};
		proxyResponse = await globalThis.__iRingoMapsResponse(proxyRequest, proxyResponse, KV);
		const responseHeaders = new Headers(proxyResponse.headers ?? {});
		responseHeaders.delete("content-length");
		responseHeaders.delete("content-encoding");
		return new Response(proxyResponse.body, { status: proxyResponse.status ?? 200, headers: responseHeaders });
	},
};
`;

const worker = `globalThis.Cloudflare = true;
function require(name) {
	if (name === "node-fetch") return globalThis.fetch;
	if (name === "fetch-cookie") return { default: fetchFunction => fetchFunction };
	return {};
}
globalThis.$argument = ${JSON.stringify(argument)};
${requestBundle}
globalThis.$argument = ${JSON.stringify(argument)};
${responseBundle}
${wrapper}`;
await writeFile(output, worker);
console.log(`Wrote ${output} (${worker.length} bytes)`);
