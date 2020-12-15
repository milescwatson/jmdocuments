import React, {useState, useEffect, useContext } from 'react';
import BrowserContext from './BrowserContext';
import { InputGroup, FormControl, Card, Button } from 'react-bootstrap';

var Query2 = function(){
  const [search, setSearch] = useState('');
  const BrowserContextMain = useContext(BrowserContext);

  var handleEnter = function(event){
    if(event.key === 'Enter'){
      handleSubmit();
    }
  }
  var handleSubmit = function(){
    // BrowserContextMain.updateState((prev)=>{
    //   return(
    //     {...prev,
    //       mode: 'search'
    //     })
    // })
  }

  var ConsumerExample = function(){
    const { browserState, setBrowserState} = useContext(BrowserContext)
    return(
      <React.Fragment>
        <h3>Consumer Example</h3>
        <p>{browserState.simpleSearch}</p>
      </React.Fragment>
    )
  }

  return(
    <React.Fragment>
      <ConsumerExample />
    </React.Fragment>
  )
}

export default Query2;
