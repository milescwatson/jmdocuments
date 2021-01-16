import React, {useContext} from 'react';

const BrowserContext = React.createContext({
  simpleSearch: '',
  numberOfDocuments: 500,
  selectedPage: 1,
  selectedItems: [],
  mode: "all",
  multiSelect: false,
  updateState: ()=>{}
});

export default BrowserContext
