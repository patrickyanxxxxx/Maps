/* iRingo Maps diagnostic v2: records request shapes and redacts credentials. */
(() => {
	const request = globalThis.$request;
	if (!request?.url) return $done({});
	try {
		const url = new URL(request.url);
		const query = Object.fromEntries(url.searchParams);
		for (const key of ["accessKey", "authToken", "token", "signature", "sig"]) {
			if (query[key]) query[key] = "[REDACTED]";
		}
		const record = {
			at: new Date().toISOString(),
			host: url.hostname,
			path: url.pathname,
			query,
		};
		const key = "iRingo.Maps.SatelliteDiagnostics.v2";
		let records = [];
		try { records = JSON.parse(globalThis.$persistentStore?.read(key) ?? "[]"); } catch {}
		records.push(record);
		records = records.slice(-60);
		globalThis.$persistentStore?.write(JSON.stringify(records), key);
		console.log(`[iRingo Maps Satellite Diagnostic v2] ${JSON.stringify(record)}`);
	} catch (error) {
		console.log(`[iRingo Maps Satellite Diagnostic v2] error: ${error}`);
	}
	$done({});
})();
