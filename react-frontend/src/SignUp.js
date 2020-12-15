import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

var xhrRequest = require('./include/xmlHttpRequest.js')

function SignUp(props) {
  const [state, setState] = useState({
    'email': '',
    'firstname': '',
    'lastname': '',
    'password': '',
    'creationStatus': ['', ''] // [isTrue, message]
  });

  var handleTextChange = function(event){
    const value = event.target.value;
    const attribute = event.target.name;
    var stateCopy = {...state};
    stateCopy[attribute] = value;
    setState(stateCopy);
  };

  var handleSubmit = function(){
    var clientRequest = {...state};
    xhrRequest.xhrRequestJSON('/create-user','POST', clientRequest, function(error, response){
      var stateCopy;
      if(error){
        stateCopy = {...state};
      }else{
        var responseJSON = JSON.parse(response);
        if (responseJSON[0]) {
          stateCopy = {...state};
          stateCopy['creationStatus'] = [true, 'Success'];
          setState(stateCopy);

          if(props.initiateSession!==false){
            login();
            setTimeout(function () {
              window.location = "/#welcome"
            }, 2000);
          }

        } else {
          stateCopy = {...state};
          stateCopy['creationStatus'] = [false, responseJSON[1]];
          setState(stateCopy);
        }
      }
    });
  }

  var login = async function(){
    var requestObject = {
      'username': state.email,
      'password': state.password
    }

    var response = await fetch('/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(requestObject)
    });

    if (response.ok) {
      // var responseObject = await response.text();
    }else{
      console.log("HTTP-Error: " + response.status);
    }

  }


  var handleEnter = function(event){
    if(event.key === 'Enter'){
      handleSubmit();
    }
  }


  var StatusMessage = function(){
    if(state.creationStatus[0] === false){
      return(
        <div class="alert alert-danger" role="alert">
          {state.creationStatus[1]}
        </div>
      )
    }else if(state.creationStatus[0] === true){
      return(
          <div class="alert alert-success" role="alert">
            Account Creation Successful
          </div>
      )
    }else{
      return(<p></p>);
    }
  }

  // useEffect(() => {
  //   console.log('useEffect ran, creationStatus = ', state.creationStatus);
  //   if(state.creationStatus === true || state.creationStatus === false){
  //     props.changeLoginStatusCallback(state.creationStatus, function(res){
  //       //callback, after state is set
  //       setTimeout(function () {
  //
  //       }, 2000);
  //     });
  //   }
  // });

  return(
    <>
    <div className="user-account-screen" onKeyPress={handleEnter}>
    <div className="signup-form">
        <StatusMessage />
        <div className="form-group">
            <label>Email:</label>
            <input required className="form-control" type="text" name="email" value={state.email} onChange={handleTextChange} />
        </div>

        <div className="form-group">
            <label>Firstname:</label>
            <input required className="form-control" value={state.firstname} onChange={handleTextChange} type="text" name="firstname"/>
        </div>

      <div className="form-group">
        <label>Lastname:</label>
        <input required className="form-control" type="text" value={state.lastname} onChange={handleTextChange} name="lastname"/>
      </div>

      <div className="form-group">
          <label>Password:</label>
          <input required className="form-control" type="password" value={state.password} onChange={handleTextChange} name="password"/>
      </div>

      <div className="form-group">
          <button className="btn btn-primary" type="submit" onClick={handleSubmit} > Submit</button>
      </div>

    </div>

    </div>

    </>
  )
}

export default SignUp;
