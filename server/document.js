/*jshint node:true */
/*global require */
'use strict';
var m = require('@milescwatson/m');
var sql = m.sql.sql;
sql.dbconfig = require('./include/dbconfig');
var pageDivision = 50;

var getDocumentCountPrivate = function(callback){
  const countDocumentsQuery = {
    sql: "SELECT COUNT(id) FROM Documents"
  }
  sql.executeQueryPool(countDocumentsQuery, (error, result)=>{
    callback(error, result)
  })
}

exports.getDocumentCount = function(request, response){
  const obj = {
    error: null
  }
  getDocumentCountPrivate((error, result)=>{
    obj.numberOfDocuments = result[0]['COUNT(id)'];
    obj.error = error;
    console.log('docCount sending ', obj);
    response.send(JSON.stringify(obj));
  })
}

exports.getDocumentsByPage = function(request, response){
  // if(request.user !== undefined){
  //   var page = request.params.pageNumber;
  //   const lowerLimitPosition = page*pageDivision;
  //
  //   const getLower = {
  //     sql: 'SELECT `id` FROM Documents ORDER BY `id` DESC LIMIT ?',
  //     values: [lowerLimitPosition]
  //   }
  //   sql.executeQueryPool(getLower, (error, result)=>{
  //     console.log('error, result', error, result);
  //     if(result[lowerLimit] === undefined){
  //       const lowerID = parseInt(result[lowerLimit-1]['id'])
  //
  //       const getPageContents = {
  //         sql: 'SELECT id FROM Documents WHERE `id`>=? ORDER BY `id` DESC LIMIT ? ',
  //         sql2: 'SELECT id,originalFileName,pageID,s3Key,s3ThumbnailKey, unstructuredOCR FROM Documents WHERE `id`>=? ORDER BY `id` DESC LIMIT ? ',
  //         values: [lowerID, pageDivision]
  //       }
  //
  //       sql.executeQueryPool(getPageContents, (error, result)=>{
  //         var finalResults = [];
  //         for (var i = 0; i < result.length; i++) {
  //           finalResults[i] = {
  //             id: result[i].id,
  //             originalFileName: result[i].originalFileName,
  //             pageID: result[i].pageID,
  //             s3Key: result[i].s3Key,
  //             s3ThumbnailKey: result[i].s3ThumbnailKey,
  //             unstructuredOCR: result[i].unstructuredOCR
  //           }
  //         }
  //         var toSend = {
  //           error: error,
  //           result: finalResults
  //         }
  //         response.send(JSON.stringify(toSend))
  //       });
  //     }else{
  //       var toSend = {
  //         error: error,
  //         result: 'page-nonexist'
  //       }
  //       response.send(JSON.stringify(toSend));
  //     }
  //   })

  if(request.user !== undefined){
  // if(true){
    const page = request.params.pageNumber;

    var getLowerLimit = {
      sql: "CALL getByPage(?,?)",
      values: [page, pageDivision]
    }
    sql.executeQueryPool(getLowerLimit, function(error, result){
      if(!error){
        var toSend = {
          idOfLowerPosition: null,
          error: null,
          documents: null
        }
        var newResultLowerLimit = null;

        try {
          var newResultLowerLimit = parseInt(JSON.parse(JSON.stringify(result[0]))[0]['idOfLowerPosition']);

          if(newResultLowerLimit === null){
            toSend.error = 'page-nonexist';
          }else{
            toSend.idOfLowerPosition = newResultLowerLimit;
            toSend.error = false;
          }
        } catch (error) {
          toSend.error = error;
        }

        const getDocumentsOfPage = {
          sql: 'SELECT id,originalFileName,pageID,s3Key,s3ThumbnailKey, unstructuredOCR, createdDateTime FROM Documents WHERE `id`>=? ORDER BY `id` ASC',
          sql2: 'SELECT id,originalFileName,pageID,s3Key,s3ThumbnailKey, unstructuredOCR FROM Documents WHERE `id`>=? ORDER BY `id` ASC',
          values: [newResultLowerLimit, pageDivision]
        }
        sql.executeQueryPool(getDocumentsOfPage, function(error, result){
          if(error){
            console.log('error: ', error);
          }
          // console.log('getDocumentsOfPage = ', result);
          // get 50 documents above the lower limit

          var docAccumulator = [];

          for(var doc in result){
            // if(doc.id (newResultLowerLimit+50) )
            if(docAccumulator.length <=50){
              docAccumulator.push(result[doc])
            }
          }

          toSend.documents = docAccumulator;
          response.send(JSON.stringify(toSend));
        });

      } else{
        var toSend = {
          error: error,
          result: 'page-nonexist'
        }
        response.send(JSON.stringify(toSend));
      }
    });

  }else{
    var toSend = {
      error: 'undefined-user',
      status: 'Not logged in'
    }
    response.send(JSON.stringify(toSend));
  }

}
