import React, { useEffect, useState } from 'react';
import {  getUptime  } from '../../API';
import io from 'socket.io-client';
const Uptime = ({id}) => {
  const [urlUptime, setUrlUptime] = useState([]);
	useEffect(() => {
		let isMounted = true;
		const socket = io(`${process.env.API_ENDPOINT}`, {
			extraHeaders: {
				Authorization: `${process.env.AUTH_TOKEN}`,
			},
		});

		const fetchData = async () => {
      const urlUptime = await getUptime(id);
      if (isMounted) {
        setUrlUptime(urlUptime);
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
      {urlUptime.length > 0 && (
        <span>
          {urlUptime[urlUptime.length - 1].uptime}%
        </span>
      )}
    </span>
  );
 
};

export default Uptime;