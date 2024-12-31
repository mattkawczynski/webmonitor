import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

const Config = () => {
  const [serverUrl, setServerUrl] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    ipcRenderer.invoke('get-config').then((config) => {
      if (config) {
        setServerUrl(config.serverUrl);
        setAuthToken(config.authToken);
      }
    });
  }, []);

  const saveConfig = () => {
    if (!serverUrl || !authToken) {
      alert('Server URL and Authorization token are required.');
      return;
    }

    ipcRenderer.send('save-config', { serverUrl, authToken });
    alert('Configuration saved successfully!');
  };

  return (
    <div className="row">
      <div className="monitoring__header">
        <div className="monitoring__url">Settings</div>
      </div>
      <div className="monitoring__body">
        <div className="monitoring__row">
          <div className="monitoring__card">
            <div className="form form--normalize">
              <div className="input-container">
                <input
                  className="form__input"
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="http://example.com:port"
                />
                <label className="form__label">
                  Server URL:
                </label>
              </div>
              <div className="input-container">
                <input
                  className="form__input"
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Enter your token"
                />
                <label className="form__label">
                  Authorization token:
                </label>
              </div>
              <div className="submit">
                <button onClick={saveConfig}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;