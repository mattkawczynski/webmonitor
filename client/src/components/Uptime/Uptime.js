import React, { useEffect, useState } from 'react';
import { getUptime } from '../../API';
import io from 'socket.io-client';
import getConfig from '../../utils/getConfig';

const Uptime = ({ id }) => {
    const [config, setConfig] = useState(null);
    const [urlUptime, setUrlUptime] = useState([]);

    useEffect(() => {
        const initializeConfig = async () => {
            try {
                const configData = await getConfig();
                setConfig(configData);
            } catch (error) {
                console.error('Error fetching configuration:', error);
            }
        };
        initializeConfig();
    }, []);

    useEffect(() => {
        if (!config) return;

        let isMounted = true;
        const socket = io(config.serverUrl, {
          extraHeaders: { Authorization: `Bearer ${config.authToken}` },
        });

        const fetchUptime = async () => {
            try {
                const uptimeData = await getUptime(id);
                if (isMounted) setUrlUptime(uptimeData);
            } catch (error) {
                console.error('Error fetching uptime:', error);
            }
        };

        fetchUptime();

        socket.on('update', fetchUptime);

        return () => {
            isMounted = false;
            socket.disconnect();
        };
    }, [config, id]);

    const latestUptime = urlUptime.length > 0 ? urlUptime[urlUptime.length - 1].uptime : null;

    return <span>{latestUptime !== null ? `${latestUptime}%` : 'Loading...'}</span>;
};

export default Uptime;
