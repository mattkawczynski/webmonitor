import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import Moment from 'react-moment';
import moment from 'moment';
import { listUrlAggregatedHealth, getStatus  } from '../../API';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartTooltip } from '../../components/ChartTooltip';
import { StatusBar } from '../../components/StatusBar';
import { IncidentsLastMonth } from '../../components/IncidentsLastMonth';

import io from 'socket.io-client';
import './Details.scss'

const Details = () => {
	const [urlHealth, setUrlHealth] = useState([]);
	const [urlStatuses, setUrlStatuses] = useState([]);
	const { _id } = useParams();

	useEffect(() => {
		let isMounted = true;
		const socket = io(`${process.env.API_ENDPOINT}`, {
			extraHeaders: {
				Authorization: `${process.env.AUTH_TOKEN}`,
			},
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

		socket.on('update', async (data) => {
            fetchData();
			fetchStatuses;
        });

		return () => {
            isMounted = false;
            socket.disconnect();
        };
	}, []);
	
	const CustomTooltip = ({ active, payload, label, dateHour }) => {
		if (active && payload && payload.length) {
		  return (
			<ChartTooltip value={payload[0].value} dateHour={payload[0].payload.dateHour} />
		  );
		}
		return null;
	};

	const renderLineChart = (
		<ResponsiveContainer width="100%" height={400}>
		<LineChart  data={urlHealth.aggregatedHealth} >
		<CartesianGrid strokeDasharray="1 3" stroke="#3d4358" />
			<Line type="monotone" dataKey="avgResponseTime" stroke="#1c5e76" strokeWidth={3}/>
			<YAxis width={30}/>
			<XAxis dataKey="dateHour" tickFormatter={(tick) => moment(tick).format("YYYY-MM-DD HH:mm")}/>
			<Tooltip content={<CustomTooltip />} />
		</LineChart>
		</ResponsiveContainer>
	);

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
											Response time
										</div>
										{renderLineChart}
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

export default Details;