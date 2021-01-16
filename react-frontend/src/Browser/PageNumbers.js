// import React, { useState, useContext, useEffect } from 'react';
// import {Pagination,} from 'react-bootstrap';
// import BrowserContextImport from './BrowserContext';
//
// function PageNumbers(props){
//   const [activePage, setActivePage] = useState(1)
//   const [pageNumbers, setPageNumbers] = useState([])
//   const browserContext = useContext(BrowserContextImport);
//   var setBrowserState = browserContext[1];
//
//   var updateState = function(newPage){
//     browserContext[1]((prev)=>{
//       prev.selectedPage = newPage;
//       return prev;
//     })
//   }
//
//   function handleNext(){
//     var nextPage = activePage + 1;
//     updateState(nextPage)
//     setActivePage(nextPage)
//   }
//
//   function handlePrev(){
//     var prevPage = activePage - 1;
//     updateState(prevPage)
//     setActivePage(prevPage)
//   }
//
//   var generatePageItems = function(){
//     var items = [];
//     const pageDivision = 50;
//     const numPages = props.numberOfDocuments / pageDivision;
//
//     var PageItem = function(props){
//       function handlePageChange(event){
//         if(activePage !== props.activeI){
//           updateState(props.activeI)
//           setActivePage(props.activeI)
//         }
//       }
//       return(
//         <Pagination.Item key={props.activeI} active={props.activeI === activePage} onClick={(event)=>{handlePageChange(event)}} >
//           {props.activeI}
//         </Pagination.Item>
//       )
//     }
//
//     var activeI = activePage;
//     var iter = 0;
//
//     while (activeI > 0) {
//       if(iter >= -3 || activePage < 7){
//         items[activeI] = (
//           <PageItem
//             activeI = {activeI}
//             key={iter}
//           />
//         )
//       }
//       if(iter === -4 && activePage >= 7){
//         items[activeI] = (<Pagination.Ellipsis key={iter} />)
//       }
//       if(iter === -5 && activePage >= 7){
//         items[activeI] = (<PageItem key={iter} activeI = {1} />)
//       }
//       if(iter === -6 && activePage >= 7){
//         items[activeI] = (<Pagination.Prev key={iter} onClick={handlePrev} />)
//       }
//       iter--;
//       activeI--;
//     }
//
//     activeI = activePage;
//     iter = 0;
//     while(activeI < numPages){
//       if(iter <= 3){
//         items[activeI] = (<PageItem key={iter} activeI = {activeI} />)
//       }
//       if(iter === 4 && (activePage<= numPages - 7)){
//         items[activeI] = (<Pagination.Ellipsis key={iter} />)
//       }
//       if(iter === 5 && (activePage<= numPages - 7)){
//         items[activeI] = (<PageItem key={iter} activeI = {numPages} />)
//       }
//       if(iter === 6 && (activePage<= numPages - 7)){
//         items[activeI] = (<Pagination.Next key={iter} onClick={handleNext} />)
//       }
//
//       iter++;
//       activeI++;
//     }
//
//     setPageNumbers(items)
//   }
//
//   useEffect(generatePageItems, [props.numberOfDocuments, activePage])
//
//   return(
//     <React.Fragment>
//       <Pagination>{pageNumbers}</Pagination>
//     </React.Fragment>
//   )
// }
// export default PageNumbers;
