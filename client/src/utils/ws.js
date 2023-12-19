import React, { Component } from 'react';
import io from 'socket.io-client';
import './ws.scss'

class WsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      connection: 'Pending'
    };

    this.socket = io(`${process.env.API_ENDPOINT}`, {
        extraHeaders: {
            Authorization: `${process.env.AUTH_TOKEN}`,
        },
    });

    this.socket.on('connect', () => {
      this.setState({
        connection: 'Connected',
    });
    });

    this.socket.on('disconnect', () => {
      this.setState({
          connection: 'Disconnected',
      });
    });

    this.socket.on('update', (data) => {
        this.setState({
            message: data,
        });
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    let icon,
        color;
    if (this.state.connection == 'Connected') {
      icon = 'done';
      color = 'success';
    } else if (this.state.connection == 'Disconnected') {
      icon = 'signal_disconnected';
      color = 'alert';
    } else {
      icon = 'pending'
      color = 'warning';
    }

    return (
      <div className={'connection connection--' + color}>
        <span className="material-symbols-outlined">
          {icon} 
        </span>
        {this.state.connection}
      </div>
    );
  }
}

export default WsComponent;