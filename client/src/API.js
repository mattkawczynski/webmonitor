import { ipcRenderer } from 'electron';
import { useNavigate } from 'react-router-dom';

const handleError = (error) => {
	console.error('API Error:', error);
	window.location.href = '/#/config'
};

const getConfig = async () => {
  const config = await ipcRenderer.invoke('get-config');
  return config || {};
};

export async function submitUrl(payload) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls`, {
		method: 'POST',
		headers: {
		  "Authorization": `Bearer ${authToken}`,  // Use Bearer token for security
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized'); // Token is invalid or missing
		}
		throw new Error('Failed to submit URL');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function deleteUrl(payload) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${payload}`, {
		method: 'DELETE',
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		  'Content-Type': 'application/json',
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to delete URL');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function listUrlsEntries() {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch URL entries');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function getUptime(id) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${id}/uptime`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch uptime');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function getStatus(id) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${id}/status`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch status');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function getIncidents(id) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${id}/incidents`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch incidents');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function getAllIncidents(id) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${id}/allincidents`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch all incidents');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function listUrlHealth(id) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${id}/health`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch health data');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function listUrlAggregatedHealth(id) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${id}/aggregatedHealth`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch aggregated health data');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }
  
  export async function listUrlAggregatedHealthLast30Days(id) {
	try {
	  const { serverUrl, authToken } = await getConfig();
	  if (!serverUrl || !authToken) {
		throw new Error('Server URL or Auth Token is missing');
	  }
  
	  const response = await fetch(`${serverUrl}/api/urls/${id}/aggregatedHealthLast30Days`, {
		headers: {
		  "Authorization": `Bearer ${authToken}`,
		},
	  });
  
	  if (!response.ok) {
		if (response.status === 401) {
		  throw new Error('Unauthorized');
		}
		throw new Error('Failed to fetch aggregated health data for the last 30 days');
	  }
  
	  return response.json();
	} catch (error) {
	  handleError(error);
	}
  }