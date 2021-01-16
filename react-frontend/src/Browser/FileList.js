import React, { useEffect, useContext } from 'react';
import SidebarPreview from './SidebarPreview';
import { Card, Button } from 'react-bootstrap';
import BrowserContext from './BrowserContext';
import Page from './Page';
import Pagination from "react-js-pagination";

// require("bootstrap/less/bootstrap.less");

var m = require('@milescwatson/m');
var pageDivisor = 50; // documents per page

function genCardHeader(mode, search){
  console.log('mode, simpleSearch', mode, search);

  if(mode === 'new'){
    return('Newest Files')
  }else if (mode === 'search') {
    return('Search results for: '+search)
  }

}

var Header = function(props){
  const { browserState, setBrowserState} = useContext(BrowserContext)
  // const browserStateC = useContext(BrowserContext);
  // const browserState = browserStateC.browserState;
  var goBack = <><p>Search Results For</p><a href="/search">Back to All Documents</a></>

  var ShowSimpleSearch = function(){
    return(
      <React.Fragment>
        {browserState.simpleSearch}
      </React.Fragment>
    )
  }

  var changeModeToAll = function(){
    setBrowserState({
      ...browserState,
      mode: 'all'
    })
  }
  var DispMode = function(){
    if(browserState.mode === 'search'){
      return(
        <>
          <Card.Header><Button onClick={changeModeToAll} variant="link">Back to All Documents</Button><b> Search Results For: <ShowSimpleSearch /></b> </Card.Header>
        </>
      )
    }else if(browserState.mode === 'all'){
      return(
        <Card.Header>All Documents</Card.Header>
      )
    }else{
      return(
        <p>Error: Could not determine Browser view mode.</p>
      )
    }
  }

  // var SelectionStatus = function(){
  //   return(
  //     {browserState.selectedItems[0] === null ? '' : 'y'}
  //   )
  // }

  return(
    <React.Fragment>
      <DispMode />
    </React.Fragment>
  )

}

var handlePageChange = function(pageNumber, browserState, setBrowserState) {
  setBrowserState({
    ...browserState,
    selectedPage: pageNumber
  });
}

var FileList = function(){
  const { browserState, setBrowserState} = useContext(BrowserContext)

  return(
    <React.Fragment>
      <Card>
        <Header browserState = {browserState} />
        <Card.Body>
          <div className="container-fluid">
            <div className="row">
              <div className="col-10">
                <h1>Recent Files</h1>
                  <Page
                  />
                  <Pagination
                    activePage = {browserState.selectedPage}
                    itemsCountPerPage = {pageDivisor}
                    totalItemsCount = {(browserState.numberOfDocuments === undefined) ? 1 :  browserState.numberOfDocuments}
                    pageRangeDisplayed = {5}
                    onChange = {(pageNumber)=>{handlePageChange(pageNumber, browserState, setBrowserState)}}
                    itemClass = "page-item"
                    linkClass = "page-link"
                  />
                <p>There are {browserState.numberOfDocuments} documents.</p>
              </div>
              <div className="col-2">
                <SidebarPreview />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </React.Fragment>
  )
}
export default FileList;
