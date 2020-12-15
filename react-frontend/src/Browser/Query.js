import React, {useState, useEffect, useContext } from 'react';
import BrowserContext from './BrowserContext';
import { InputGroup, FormControl, Card, Button } from 'react-bootstrap';

var Query = function(){
  const { browserState, setBrowserState} = useContext(BrowserContext)

  // Search handlers
  var handleSearch = function(event){
    const val = event.target.value;
    setBrowserState({
      ...browserState,
      simpleSearch: val
    })

  }

  var handleEnter = function(event){
    if(event.key === 'Enter'){
      handleSubmit();
    }
  }

  var handleSubmit = function(){
    if(browserState.simpleSearch.length > 0 && browserState.mode !== 'search'){
      setBrowserState({
        ...browserState,
        mode: 'search'
      })
    }
    // BrowserContextMain.updateState((prev)=>{
    //   return(
    //     {...prev,
    //       mode: 'search'
    //     })
    // })
  }

  return(
    <React.Fragment>
      <React.Fragment>
        <h2>Query</h2>
        <Card>
          <Card.Header>Query Documents</Card.Header>
          <Card.Body>
            <Card.Text>
              Search for documents
            </Card.Text>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Search Term"
                value = {browserState.simpleSearch}
                onChange = {handleSearch}
                onKeyPress = {handleEnter}
              />
            <Button variant="primary" onClick={handleSubmit}>Search</Button>
            </InputGroup>
          </Card.Body>
        </Card>
      </React.Fragment>
    </React.Fragment>
  )
}

export default Query;
