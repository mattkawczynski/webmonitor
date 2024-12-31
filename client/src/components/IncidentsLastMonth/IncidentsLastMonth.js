import React, { useEffect, useState } from 'react';
import { listUrlAggregatedHealthLast30Days } from '../../API';
import io from 'socket.io-client';
import getConfig from '../../utils/getConfig';

const IncidentsLastMonth = ({ id }) => {
    const [config, setConfig] = useState(null);
    const [incidentsInLastMonth, setIncidentsInLastMonth] = useState([]);

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

        const fetchIncidents = async () => {
            try {
                const data = await listUrlAggregatedHealthLast30Days(id);
                if (isMounted) setIncidentsInLastMonth(data);
            } catch (error) {
                console.error('Error fetching incidents:', error);
            }
        };

        fetchIncidents();

        socket.on('update', fetchIncidents);

        return () => {
            isMounted = false;
            socket.disconnect();
        };
    }, [config, id]);

    const latestIncidentCount =
        incidentsInLastMonth.length > 0
            ? incidentsInLastMonth[incidentsInLastMonth.length - 1].incidentCount
            : 0;

    return <span>{latestIncidentCount}</span>;
};

export default IncidentsLastMonth;
