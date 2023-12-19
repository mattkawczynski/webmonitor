import React, { useEffect, useState, useCallback  } from 'react';
import { listUrlsEntries, getAllIncidents } from '../../API';
import './Incidents.scss'
import io from 'socket.io-client';

const Incidents = () => {
const [urlEntries, setUrlEntries] = useState([]);
const [urlAllIncidents, setUrlAllIncidents] = useState([]);
const fetchData = useCallback(async () => {
  try {
    const entries = await listUrlsEntries();
    setUrlEntries(entries);

	const allIncidents = [];
    for (const entry of entries) {
      const incidents = await getAllIncidents(entry._id);
	  allIncidents.push(incidents);
    }
	setUrlAllIncidents(allIncidents);
  } catch (error) {
    console.error(error);
  }
}, []);

useEffect(() => {
  const socket = io(`${process.env.API_ENDPOINT}`, {
    extraHeaders: {
      Authorization: `${process.env.AUTH_TOKEN}`,
    },
  });

  socket.on('update', () => {
    fetchData();
  });

  fetchData();

  return () => {
    socket.disconnect();
  };
}, [fetchData]);

	return (
		<div className="row">
			<div className="monitoring">
				{
					urlEntries.map((entry, index) => (
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
							
							<div className="monitoring__body">
								<div className="monitoring__row">
									<div className="monitoring__card monitoring__card">
										<div className="monitoring__large-text monitoring__bottom-margin">
											Incidents
										</div>


										{urlAllIncidents[index] && urlAllIncidents[index].length > 0 ? (
											<table className="datatable">
												<thead>
												<tr>
													<th>Date</th>
													<th>Total uptime</th>
													<th>Incident count</th>
												</tr>
												</thead>
												{urlAllIncidents[index].map(incident => (
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
					))
				}
			</div>
		</div>
    );
};

export default Incidents;