const HEADERS = { "Authorization": `${process.env.AUTH_TOKEN}` }

export async function submitUrl(payload) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls`, {
		method: 'POST',
		headers: {
			"Authorization": `${process.env.AUTH_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
	return response.json()
}

export async function deleteUrl(payload) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${payload}`, {
		method: 'DELETE',
		headers: {
			"Authorization": `${process.env.AUTH_TOKEN}`,
			'Content-Type': 'application/json'
		},
	});
	return response.json()
}

export async function listUrlsEntries() {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls`, {
		headers: HEADERS
	});
	return response.json()
}

export async function getUptime(id) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${id}/uptime`, {
		headers: HEADERS
	});
	return response.json()
}

export async function getStatus(id) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${id}/status`, {
		headers: HEADERS
	});
	return response.json()
}

export async function getIncidents(id) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${id}/incidents`, {
		headers: HEADERS
	});
	return response.json()
}

export async function getAllIncidents(id) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${id}/allincidents`, {
		headers: HEADERS
	});
	return response.json()
}

export async function listUrlHealth(id) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${id}/health`, {
		headers: HEADERS
	});
	return response.json()
}

export async function listUrlAggregatedHealth(id) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${id}/aggregatedHealth`, {
		headers: HEADERS
	});
	return response.json()
}

export async function listUrlAggregatedHealthLast30Days(id) {
	const response = await fetch(`${process.env.API_ENDPOINT}/api/urls/${id}/aggregatedHealthLast30Days`, {
		headers: HEADERS
	});
	return response.json()
}