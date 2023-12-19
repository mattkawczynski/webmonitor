import React, { useEffect, useState } from 'react';
import {  listUrlAggregatedHealthLast30Days  } from '../../API';
import io from 'socket.io-client';
const IncidentsLastMonth = ({id}) => {
  const [incidentsInLastMonth, setIncidentsInLastMonth] = useState([]);
	useEffect(() => {
		let isMounted = true;
		const socket = io(`${process.env.API_ENDPOINT}`, {
			extraHeaders: {
				Authorization: `${process.env.AUTH_TOKEN}`,
			},
		});

		const fetchData = async () => {
      const incidentsInLastMonth = await listUrlAggregatedHealthLast30Days(id);
      if (isMounted) {
        setIncidentsInLastMonth(incidentsInLastMonth);
      }
    };
		fetchData();

		socket.on('update', async (data) => {
      fetchData();
    });

		return () => {
      isMounted = false;
      socket.disconnect();
    };
	}, [id]);

  return (
    <span>
      {incidentsInLastMonth.length > 0 && (
        <span>
          {incidentsInLastMonth[incidentsInLastMonth.length - 1].incidentCount}
        </span>
      )}
    </span>
  );
 
};

export default IncidentsLastMonth;