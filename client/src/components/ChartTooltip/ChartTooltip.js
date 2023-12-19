import React from 'react';
import moment from 'moment';
import './ChartTooltip.scss'

function ChartTooltip({ value, dateHour }) {
  const formattedDate = moment(dateHour).format('YYYY-MM-DD HH:mm');
  return (
    <div className="tooltip">
      <div className="tooltip__label">{formattedDate} <strong> {value} ms</strong></div>
    </div>
  );
}
export default ChartTooltip;
