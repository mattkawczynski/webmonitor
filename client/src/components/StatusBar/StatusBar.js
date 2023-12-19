import React from 'react';
import './StatusBar.scss'

function StatusBar({ uptime, date }) {

  let color;
  if (uptime == 100) {
    color = '#2fcc66';
  } else if (uptime > 99.01 && uptime <= 99.99) {
    color = '#a3c732';
  } else if (uptime > 89 && uptime <= 99) {
    color = '#96c838';
  } else if (uptime > 70 && uptime <= 89) {
    color = '#edaa16';
  } else {
    color = '#ff6b6b';
  }

  return (
    <div className="statusbar" style={{backgroundColor: color}}>
      <div className="statusbar__tooltip">{date}: <strong> {uptime}% uptime</strong></div>
    </div>
  );
}
export default StatusBar;
