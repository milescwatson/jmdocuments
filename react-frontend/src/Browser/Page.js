import React, {useState, useContext, useEffect } from 'react';
import { } from 'react-bootstrap';
import BrowserContext from './BrowserContext';
var m = require('@milescwatson/m');

var Page = function(props){
  const { browserState, setBrowserState } = useContext(BrowserContext);
  const [ documents, setDocuments ] = useState(null);

  var fetchDocuments = function(){
    m.fetch.getJSON(`get-documents-by-page/${browserState.selectedPage}`, function(error, result){
      console.log('Fetched documents');
      console.log('error,result = ', error, result);
      if(!error){
        setDocuments(result.documents);
      }
    })
  }
  useEffect(fetchDocuments, [])

  var DocumentList = function(){
    var visualDocuments = [];

    var ThumbnailDoc = function(props){
      return(
        <>
          <p>id: {props.originalFileName}</p>
          <p>originalFileName: {props.originalFileName}</p>
          <p>pageID: {props.pageID}</p>
          <p>createdDateTime: {props.createdDateTime}</p>
        </>
      )
    }

    for(var doc in documents){
      console.log('doc = ', documents[doc]);
      visualDocuments.push(
        <ThumbnailDoc
          id = {documents[doc].id}
          originalFileName = {documents[doc].originalFileName}
          pageID = {documents[doc].pageID}
          createdDateTime = {documents[doc].createdDateTime}
          s3ThumbnailKey = {documents[doc].s3ThumbnailKey}
          s3Key = {documents[doc].s3Key}
        />
      )
    }

    return(
      <React.Fragment>
        <h3>DocumentList</h3>
        {visualDocuments}
      </React.Fragment>
    )
  }


  var ShowDocumentsPerPage = function(){
    if(documents === null){
      return(
        <React.Fragment>
          <h5>Loading documents...</h5>
        </React.Fragment>
      )
    }else{
      return(
        <React.Fragment>
          <DocumentList />
        </React.Fragment>
      )
    }

  }


  return(
    <React.Fragment>
      <ShowDocumentsPerPage />
      <h5>Page Component</h5>
      <p>This is page number {browserState.selectedPage}</p>
      <p>Now lets go fetch some documents by page number</p>

    </React.Fragment>
  )
}
export default Page;
