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
    numberOfDocuments: 500,
    selectedPage: 1
  });

  const value = {browserState, setBrowserState}

  function getDocumentCount(){
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

  var ConsumerExample = function(){
    const browserStateC = useContext(BrowserContext);
    const browserState = browserStateC.browserState;

    console.log('browserState (ConsumerExample) = ', browserState);
    return(
      <React.Fragment>
        <h3>Consumer Example</h3>
        <p>simpleSearch: {browserState.simpleSearch}</p>
      </React.Fragment>
    )
  }

  return(
    <React.Fragment>
      <BrowserContext.Provider value={value}>
        <ConsumerExample />
        <Query />
        <FileList />
      </BrowserContext.Provider>
    </React.Fragment>
  )
}

export default Browser
