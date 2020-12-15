import React, {useContext} from 'react';


const colors = {
  blue: "#03619c",
  yellow: "#8c8f03",
  red: "#9c0312"
};

export const BrowserState = React.createContext(colors.blue);
