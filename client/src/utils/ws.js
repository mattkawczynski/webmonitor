import React, { Component } from 'react';
import io from 'socket.io-client';
import './ws.scss';
const { ipcRenderer } = window.require('electron');

class WsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      connection: 'Pending',
      serverUrl: '',
      authToken: ''
    };
  }

  componentDidMount() {
    ipcRenderer.invoke('get-config').then((config) => {
      if (config && config.serverUrl && config.authToken) {
        this.setState(
          {
            serverUrl: config.serverUrl,
            authToken: config.authToken
          },
          () => {
            this.connectToWebSocket(); // Ensure WebSocket connection is established after state is updated
          }
        );
      } else {
        console.error('No configuration found.');
      }
    }).catch(err => {
      console.error('Error fetching configuration:', err);
    });
  }

  connectToWebSocket = () => {
    const { serverUrl, authToken } = this.state;

    if (!serverUrl || !authToken) {
      console.error('Server URL or Auth Token missing.');
      return;
    }

    this.socket = io(serverUrl, {
      extraHeaders: { Authorization: `Bearer ${authToken}` },
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
  };

  componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  render() {
    const { connection, message } = this.state;

    let icon, color;
    if (connection === 'Connected') {
      icon = 'done';
      color = 'success';
    } else if (connection === 'Disconnected') {
      icon = 'signal_disconnected';
      color = 'alert';
    } else {
      icon = 'pending';
      color = 'warning';
    }

    return (
      <div className={`connection connection--${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
        {connection}
      </div>
    );
  }
}

export default WsComponent;
