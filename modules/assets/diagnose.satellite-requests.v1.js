/* iRingo Maps diagnostic: records satellite / 3D request shapes without rewriting them. */
(() => {
	const request = globalThis.$request;
	if (!request?.url) return $done({});
	try {
		const url = new URL(request.url);
		const query = Object.fromEntries(url.searchParams);
		const record = {
			at: new Date().toISOString(),
			host: url.hostname,
			path: url.pathname,
			query,
		};
		const key = "iRingo.Maps.SatelliteDiagnostics.v1";
		let records = [];
		try { records = JSON.parse(globalThis.$persistentStore?.read(key) ?? "[]"); } catch {}
		records.push(record);
		records = records.slice(-40);
		globalThis.$persistentStore?.write(JSON.stringify(records), key);
		console.log(`[iRingo Maps Satellite Diagnostic] ${JSON.stringify(record)}`);
	} catch (error) {
		console.log(`[iRingo Maps Satellite Diagnostic] error: ${error}`);
	}
	$done({});
})();
