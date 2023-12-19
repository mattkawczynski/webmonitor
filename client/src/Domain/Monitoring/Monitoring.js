import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { formatDate } from '../../utils/formatDate';
import Moment from 'react-moment';
import { listUrlsEntries } from '../../API';
import { Uptime  } from '../../components/Uptime';
import { DeleteUrl } from '../../components/DeleteUrl';
import { IncidentsLastMonth } from '../../components/IncidentsLastMonth';
import './Monitoring.scss'
import io from 'socket.io-client';

const Monitoring = () => {
	const [urlEntries, setUrlEntries] = useState([]);
	const [restRefresh, setRestRefresh] = useState(false);

	const fetchData = async () => {
		const urlEntries = await listUrlsEntries();
		setUrlEntries(urlEntries);
	};

	const handleRestRefresh = (shouldRefresh) => {
		setRestRefresh(shouldRefresh);
		if (shouldRefresh) {
			fetchData();
		}
	};
	
	useEffect(() => {
		let isMounted = true;
		const socket = io(`${process.env.API_ENDPOINT}`, {
			extraHeaders: {
				Authorization: `${process.env.AUTH_TOKEN}`,
			},
		});
		fetchData();

		socket.on('update', async (data) => {
            fetchData();
        });

		return () => {
            isMounted = false;
            socket.disconnect();
        };
	}, []);
	
    return (
		<div className="row">
			<div className="monitoring">
				{
					urlEntries.map(entry => (
						<div key={entry._id} className="monitoring__item">
							<div className="monitoring__header">
								<div className={"monitoring__status-icon monitoring__status-icon--" + (entry.urlHealth == "200" ? 'success' : 'alert')} >
								</div>
								<div className="monitoring__additional-info-container">
									<div className="monitoring__url">
										{entry.url.replace('https://','')}
									</div>
									<div className="monitoring__sub-info">
									<div className={"monitoring__status-text monitoring__status-text--" + (entry.urlHealth == "200" ? 'success' : 'alert')}>
											{
												entry.urlHealth == "200"   && 'Up'
											}
											{
												entry.urlHealth != "200"   && 'Down'
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
									<Link to={`/details/${entry._id}`}>
										<span className="material-symbols-outlined">
											insights
										</span>
										Details
									</Link>
								</div>
								<div className="monitoring__navigation-item">
									<Link to={`/incident/${entry._id}`}>
										<span className="material-symbols-outlined">
											fmd_bad
										</span>
										Incidents
									</Link>
								</div>
								<div className="monitoring__navigation-item">
									<DeleteUrl id={entry._id} handleRestRefresh={handleRestRefresh} />
								</div>
 							</div>
							<div className="monitoring__body">
								<div className="monitoring__row">
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Monitor is up for
										</div>
										<div className="monitoring__large-text">
											{formatDate(entry.createdAt)}
										</div>
									</div>
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Last checked
										</div>
										<div className="monitoring__large-text">
											<Moment fromNow>{entry.updatedAt}</Moment>
										</div>
									</div>
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Total incidents
										</div>
										<div className="monitoring__large-text">
											{entry.incidentCount}
										</div>
									</div>
									<div className="monitoring__card monitoring__card--3">
										<div className="monitoring__small-text monitoring__bottom-margin">
											Incidents in last 30 days
										</div>
										<div className="monitoring__large-text">
											<IncidentsLastMonth id={entry._id} />
										</div>
									</div>
								</div>
								<div className="monitoring__row">
									<div className="monitoring__card monitoring__card">
										<div className="monitoring__large-text monitoring__bottom-margin">
											Latest response time
										</div>
										<div className="monitoring__small-text">
											{entry.latestResponseTime} ms
										</div>
									</div>
									<div className="monitoring__card monitoring__card">
										<div className="monitoring__large-text monitoring__bottom-margin">
											Checks of the url
										</div>
										<div className="monitoring__small-text">
											{entry.hitCount}
										</div>
									</div>
									<div className="monitoring__card monitoring__card">
										<div className="monitoring__large-text monitoring__bottom-margin">
											Uptime
										</div>
										<div className="monitoring__small-text">
											<Uptime id={entry._id} />
										</div>
									</div>
								</div>
							</div>
						</div>
					))
				}
			</div>
		</div>
    );
};

export default Monitoring;