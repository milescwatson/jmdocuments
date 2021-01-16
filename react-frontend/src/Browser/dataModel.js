var m = require('@milescwatson/m');

exports.getDocumentCount = function(callback){
  m.fetch.getJSON('/get-document-count', function(error, result){
    if(!error){
      callback(null, result.numberOfDocuments);
    }

  })
}

// Interactions
exports.handlePageChange = function(setState){

}
