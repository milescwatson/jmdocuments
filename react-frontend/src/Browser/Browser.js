import React, { useState, useContext, useEffect } from 'react';
import { AppToaster } from "../include/toaster";
import Query from './Query.js';
import Query2 from './Query2.js';

import FileList from './FileList';
import BrowserContext from './BrowserContext';
import './browser.css';

var dataModel = require('./dataModel');

function Browser(){
  const [browserState, setBrowserState] = useState({
    simpleSearch: '',
    mode: 'all', //all or search
    numberOfDocuments: 1,
    selectedItems: [],
    selectedPage: 1,
    multiSelect: false
  });

  const value = {browserState, setBrowserState}

  function getDocumentCount(){
    console.log('getDocumentCount');
    dataModel.getDocumentCount((error, result)=>{
      if(!error){
        setBrowserState({
          ...browserState,
          numberOfDocuments: result
        })
      }
    })
    // AppToaster.show({ message: "Toasted." });
  }

  useEffect(getDocumentCount, [])

  // var ConsumerExample = function(){
  //   const browserStateC = useContext(BrowserContext);
  //   const browserState = browserStateC.browserState;
  //
  //   return(
  //     <React.Fragment>
  //       <h3>Consumer Example</h3>
  //       <p>simpleSearch: {browserState.simpleSearch}</p>
  //     </React.Fragment>
  //   )
  // }
  // var handleToggleMultiSelect = function(event){
  //   console.log('triggered', event.target.value);
  // }

  return(
    <React.Fragment>
      <BrowserContext.Provider value={value}>
        <div>
          <Query />
          <FileList />
        </div>
      </BrowserContext.Provider>
    </React.Fragment>
  )
}

export default Browser
