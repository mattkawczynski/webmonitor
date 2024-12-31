import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import Moment from 'react-moment';
import { listUrlAggregatedHealth, getStatus, getIncidents  } from '../../API';
import { StatusBar } from '../../components/StatusBar';
import { IncidentsLastMonth } from '../../components/IncidentsLastMonth';

import io from 'socket.io-client';
import getConfig from '../../utils/getConfig';
import './Incident.scss'

const Incident = () => {
	const [config, setConfig] = useState({ serverUrl: '', authToken: '' });

	useEffect(() => {
		const fetchConfig = async () => {
			const configData = await getConfig();
			setConfig(configData);
		};
		fetchConfig();
	}, []);
	const { serverUrl, authToken } = config;

	const [urlHealth, setUrlHealth] = useState([]);
	const [urlStatuses, setUrlStatuses] = useState([]);
	const [urlIncidents, setUrlIncidents] = useState([]);
	const { _id } = useParams();

	useEffect(() => {
		let isMounted = true;
		const socket = io(`${serverUrl}`, {
			extraHeaders: { Authorization: `Bearer ${authToken}` },
		});

		const fetchData = async () => {
            const urlHealth = await listUrlAggregatedHealth(_id);
            if (isMounted) {
                setUrlHealth(urlHealth);
            }
        };
		fetchData();

		const fetchStatuses = async () => {
            const urlStatuses = await getStatus(_id);
            if (isMounted) {
                setUrlStatuses(urlStatuses);
            }
        };
		fetchStatuses();

		const fetchIncidents = async () => {
            const urlIncidents = await getIncidents(_id);
            if (isMounted) {
                setUrlIncidents(urlIncidents);
            }
        };
		fetchIncidents();

		socket.on('update', async (data) => {
            fetchData();
			fetchStatuses();
			fetchIncidents();
        });

		return () => {
            isMounted = false;
            socket.disconnect();
        };
	}, []);

	return (
		<>
			{urlHealth.url && (
				<div className="row">
					<div className="monitoring">
						<div className="monitoring__item">
							<div className="monitoring__header">
								<div className={"monitoring__status-icon monitoring__status-icon--" + (urlHealth.url.urlHealth == "200" ? 'success' : 'alert')} >
								</div>
								<div className="monitoring__additional-info-container">
									<div className="monitoring__url">
										{urlHealth.url.url.replace('https://','')}
									</div>
									<div className="monitoring__sub-info">
										<div className={"monitoring__status-text monitoring__status-text--" + (urlHealth.url.urlHealth == "200" ? 'success' : 'alert')}>
											{
												urlHealth.url.urlHealth == "200"  && 'Up'
											}
											{
												urlHealth.url.urlHealth != "200"  && 'Down'
											}
										</div>
										<div className="monitoring__dot-divider"></div>
										<div className="monitoring__refresh-rate">
											Checked every 60 seconds
										</div>
									</div>
								</div>
							</div>
							<div className="monitoring__navigation">
								<div className="monitoring__navigation-item">
									<Link to={`/monitoring`}>
										<span className="material-symbols-outlined">
											arrow_back
										</span>
										Back
									</Link>
								</div>
 							</div>
							<div className="monitoring__body">
								<div className="monitoring__row">
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Monitor is up for
										</div>
										<div className="monitoring__large-text">
											{formatDate(urlHealth.url.createdAt)}
										</div>
									</div>
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Last checked
										</div>
										<div className="monitoring__large-text">
											<Moment fromNow>{urlHealth.url.lastChecked}</Moment>
										</div>
									</div>
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Incidents
										</div>
										<div className="monitoring__large-text">
											{urlHealth.url.incidentCount}
										</div>
									</div>
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Incidents in last 30 days
										</div>
										<div className="monitoring__large-text">
											<IncidentsLastMonth id={urlHealth.url._id} />
										</div>
									</div>
								</div>
								<div className="monitoring__row">
									<div className="monitoring__card monitoring__card">
										<div className="monitoring__large-text monitoring__bottom-margin">
											Status
										</div>
										<div className="monitoring__small-text">
											{urlStatuses &&
												<div className="statusbar__container">
													{urlStatuses.map(status => (
														<StatusBar key={status._id} uptime={status.uptime} date={status._id}></StatusBar>
													))}
												</div>
											}
										</div>
									</div>
								</div>
								<div className="monitoring__row">
									<div className="monitoring__card monitoring__card">
										<div className="monitoring__large-text monitoring__bottom-margin">
											Incidents
										</div>
										
										{urlIncidents[0] && urlIncidents[0].length > 0 ? (
											<table className="datatable">
												<thead>
												<tr>
													<th>Date</th>
													<th>Total uptime</th>
													<th>Incident count</th>
												</tr>
												</thead>
												{urlIncidents[0].map(incident => (
												<tbody key={incident._id}>
													<tr>
													<td>{incident._id}</td>
													<td>{incident.uptime}</td>
													<td>{incident.incidentCount}</td>
													</tr>
												</tbody>
												))}
											</table>
										) : (
											<div className="monitoring__small-text">
												No incidents to show
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	  );
};

export default Incident;