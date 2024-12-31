import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from '../../utils/formatDate';
import Moment from 'react-moment';
import { listUrlsEntries } from '../../API';
import { Uptime } from '../../components/Uptime';
import { DeleteUrl } from '../../components/DeleteUrl';
import { IncidentsLastMonth } from '../../components/IncidentsLastMonth';
import io from 'socket.io-client';
import { ipcRenderer } from 'electron';
import './Monitoring.scss';

// Utility function for configuration fetch
const fetchConfig = async () => {
    try {
        return await ipcRenderer.invoke('get-config') || {};
    } catch (error) {
        console.error('Error fetching configuration:', error);
        return null;
    }
};

// Subcomponent: Header for each monitoring entry
const MonitoringHeader = ({ url, urlHealth }) => (
    <div className="monitoring__header">
        <div className={`monitoring__status-icon monitoring__status-icon--${urlHealth === "200" ? 'success' : 'alert'}`} />
        <div className="monitoring__additional-info-container">
            <div className="monitoring__url">{url.replace('https://', '')}</div>
            <div className="monitoring__sub-info">
                <div className={`monitoring__status-text monitoring__status-text--${urlHealth === "200" ? 'success' : 'alert'}`}>
                    {urlHealth === "200" ? 'Up' : 'Down'}
                </div>
                <div className="monitoring__dot-divider"></div>
                <div className="monitoring__refresh-rate">Checked every 60 seconds</div>
            </div>
        </div>
    </div>
);

// Subcomponent: Navigation links
const MonitoringNavigation = ({ id, handleRestRefresh }) => (
    <div className="monitoring__navigation">
        <div className="monitoring__navigation-item">
            <Link to={`/details/${id}`}>
                <span className="material-symbols-outlined">insights</span> Details
            </Link>
        </div>
        <div className="monitoring__navigation-item">
            <Link to={`/incident/${id}`}>
                <span className="material-symbols-outlined">fmd_bad</span> Incidents
            </Link>
        </div>
        <div className="monitoring__navigation-item">
            <DeleteUrl id={id} handleRestRefresh={handleRestRefresh} />
        </div>
    </div>
);

// Subcomponent: Info card
const InfoCard = ({ title, content }) => (
    <div className="monitoring__card monitoring__card--3">
        <div className="monitoring__small-text monitoring__bottom-margin">{title}</div>
        <div className="monitoring__large-text">{content}</div>
    </div>
);

const Monitoring = () => {
    const [config, setConfig] = useState(null);
    const [urlEntries, setUrlEntries] = useState([]);
    const [restRefresh, setRestRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initialize = async () => {
            const configData = await fetchConfig();
            if (configData) {
                setConfig(configData);
            } else {
                alert('Please configure the app first!');
                navigate('/config');
            }
        };
        initialize();
    }, [navigate]);

    useEffect(() => {
        if (!config) return;
		
        let isMounted = true;
        const socket = io(config.serverUrl, {
            extraHeaders: { Authorization: `Bearer ${config.authToken}` },
        });

        const fetchData = async () => {
            try {
                const data = await listUrlsEntries();
                if (isMounted) setUrlEntries(data);
            } catch (error) {
                console.error('Error fetching URL entries:', error);
            }
        };

        fetchData();

        socket.on('update', fetchData);

        return () => {
            isMounted = false;
            socket.disconnect();
        };
    }, [config]);

    const handleRestRefresh = (shouldRefresh) => {
        setRestRefresh(shouldRefresh);
        if (shouldRefresh) {
            listUrlsEntries().then(setUrlEntries);
        }
    };

    if (!config) {
        return <p>Loading configuration...</p>;
    }

    return (
        <div className="row">
            <div className="monitoring">
                {urlEntries.map((entry) => (
                    <div key={entry._id} className="monitoring__item">
                        <MonitoringHeader url={entry.url} urlHealth={entry.urlHealth} />
                        <MonitoringNavigation id={entry._id} handleRestRefresh={handleRestRefresh} />
                        <div className="monitoring__body">
                            <div className="monitoring__row">
                                <InfoCard title="Monitor is up for" content={formatDate(entry.createdAt)} />
                                <InfoCard title="Last checked" content={<Moment fromNow>{entry.updatedAt}</Moment>} />
                                <InfoCard title="Total incidents" content={entry.incidentCount} />
                                <InfoCard title="Incidents in last 30 days" content={<IncidentsLastMonth id={entry._id} />} />
                            </div>
                            <div className="monitoring__row">
                                <InfoCard title="Latest response time" content={`${entry.latestResponseTime} ms`} />
                                <InfoCard title="Number of URL checks" content={entry.hitCount} />
                                <InfoCard title="Uptime" content={<Uptime id={entry._id} />} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Monitoring;
