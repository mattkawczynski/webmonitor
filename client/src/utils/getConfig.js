import { ipcRenderer } from 'electron';

const getConfig = async () => {
	const config = await ipcRenderer.invoke('get-config');
	return config || {};
};

export default getConfig;