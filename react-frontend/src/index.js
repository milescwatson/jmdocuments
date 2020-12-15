import React from 'react';
import ReactDOM from 'react-dom';
import UserState from './UserState';
import './include/css/bootstrap.scss';
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';

ReactDOM.render(
  <React.StrictMode>
    <UserState />
  </React.StrictMode>,
  document.getElementById('root')
);
