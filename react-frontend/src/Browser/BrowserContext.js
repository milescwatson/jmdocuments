import React, {useContext} from 'react';

const BrowserContext = React.createContext({
  simpleSearch: '',
  numberOfDocuments: 500,
  selectedPage: 1,
  mode: "all",
  updateState: ()=>{}
});

export default BrowserContext
