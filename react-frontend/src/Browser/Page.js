import React, {useState, useContext, useEffect } from 'react';
import { } from 'react-bootstrap';
import BrowserContext from './BrowserContext';
import Thumbnail from './Thumbnail';
import './css/thumbnail.css';

var m = require('@milescwatson/m');

var Page = function(props){
  const { browserState, setBrowserState } = useContext(BrowserContext);
  const [ documents, setDocuments ] = useState(null);
  const [ multiDocumentSelect, setMultiDocumentSelect] = useState(false);

  function handleMultiSelectToggle(){
    const multiKeys = ['MetaLeft', 'ShiftLeft', 'ControlLeft', 'MetaRight', 'ShiftRight', 'ControlRight'];
    function onUp(event){
      const key = event.code;
      if(multiKeys.includes(key)) setMultiDocumentSelect(false);
      event.stopImmediatePropagation()
    }
    function onDown(event){
      const key = event.code;
      if(multiKeys.includes(key)) setMultiDocumentSelect(true);
      event.stopImmediatePropagation()
    }

    document.addEventListener('keydown', onDown);
    document.addEventListener('keyup', onUp);

    return(
      function(){
        window.removeEventListener("keydown", onDown)
        window.removeEventListener('keyup', onUp)
      }
    )
  }

  useEffect(handleMultiSelectToggle, [])

  var fetchDocuments = function(){
    m.fetch.getJSON(`get-documents-by-page/${browserState.selectedPage}`, function(error, result){
      console.log('Fetched documents');
      if(!error){
        setDocuments(result.documents);
      }
    })
  }
  useEffect(fetchDocuments, [browserState.selectedPage])

  var handleSelection = function(id){
    if(multiDocumentSelect === true){
      var newSelectionArray = browserState.selectedItems;
      if (newSelectionArray.includes(id)) {
        delete newSelectionArray[newSelectionArray.lastIndexOf(id)];
      }else{
        newSelectionArray.push(id);
      }

      setBrowserState({
        ...browserState,
        selectedItems: newSelectionArray
      })

    }else{
      var newSelectionArray = browserState.selectedItems;
      newSelectionArray = []
      newSelectionArray[0] = id
      setBrowserState({
        ...browserState,
        selectedItems: newSelectionArray
      })
    }
  }

  var DocumentList = function(){
    var visualDocuments = [];

    for(var doc in documents){
      visualDocuments.push(
        <Thumbnail
          key = {doc}
          id = {documents[doc].id}
          originalFileName = {documents[doc].originalFileName}
          pageID = {documents[doc].pageID}
          createdDateTime = {documents[doc].createdDateTime}
          s3ThumbnailKey = {documents[doc].s3ThumbnailKey}
          s3Key = {documents[doc].s3Key}
          isSelected = {browserState.selectedItems.includes(documents[doc].id)}
          handleSelection = {handleSelection}
        />
      )
    }

    return(
      <React.Fragment>
        <div className='thumb-flex-container'>
          {visualDocuments}
        </div>
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
    </React.Fragment>
  )
}
export default Page;
