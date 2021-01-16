import React, {useState } from 'react';
import {Dropdown, DropdownButton, Nav, Navbar, Button, Form, FormControl} from 'react-bootstrap';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import App from './App';
import SignUp from './SignUp';
import About from './About';
import Account from './Account';
import Browser from './Browser/Browser';

var options = {
  'navColor': '#0388A6',
  'navVariant': 'dark', // light, dark
  'appTitle': 'J&M Documents'
}

var redirect = async function(){
  var response = await fetch('/login-status/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  });
  console.log('response = ', response);
  if(response.ok) {
    const responseObject = await response.json();
    if(responseObject.id !== null){
      // logged in
    }else{
      console.log('is not loggedIn');
      if(window.location.pathname !== '/' && window.location.pathname !== '/signup'){
        window.location.pathname = "/";
      }
    }
  }
}

redirect();

class UserState extends React.Component{
  constructor(props){
    super(props);
    var initialState = {
    }
    this.state = initialState;
  }

  componentDidMount = function() {
    this.checkIfLoggedIn(function(isLoggedIn, userID, userObject){
      if ( isLoggedIn ) {
        this.setState((previousState) => {
          previousState.userObject = userObject;
          previousState.userObject.userDisplayName = userObject.firstname + " " + userObject.lastname;
          previousState.loggedIn = true;
          return(previousState);
        });
      }
    }.bind(this))
  }.bind(this);

  checkIfLoggedIn = async function(callback){
    var response = await fetch('/login-status/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });

    if(response.ok) {
      const responseObject = await response.json();
      if( responseObject.id !== null ){
        // logged in
        console.log('is logged in with id: ', responseObject.id);
        callback(true, responseObject.id, responseObject)
      }
    } else {
      callback(false)
    }
  }.bind(this);

  LoginIndicator = function(){
    var visualObjects = [];

    var SignInForm = function(){
      const [siState, setState] = useState({
        signInErrorVisual: <p></p>,
        username: '',
        password: ''
      });

      var handleTextChange = function(event){
        const value = event.target.value;
        const attribute = event.target.name;
        var stateCopy = {...siState};
        stateCopy[attribute] = value;
        setState(stateCopy);
      }

      var changeMessage = function(success){
        //status = true or false
        if(success){
          var stateCopy = {...siState}
          setState({
            signInErrorVisual: <p> Login Successful</p>
          })
        } else if (!success) {
          setState({
            signInErrorVisual: <p> Incorrect Email or Password</p>
          })
        }
      }

      var handleSubmit = async function(){
        console.log('handleSubmit');
        var requestObject = {
          'username': siState.username,
          'password': siState.password
        }

        var response = await fetch('/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify(requestObject)
        });

        if (response.ok) {
          this.checkIfLoggedIn(function(isLoggedIn, loginID){
            if (isLoggedIn) {
              changeMessage(true);
              setTimeout(function () {
                window.location = "/dashboard"
              }, 500);
            } else {
              changeMessage(false)
            }
          });

        }else{
          // TODO: Change message
          changeMessage(false);
          console.log("HTTP-Error: " + response.status);
        }
      }.bind(this);

      var handleEnter = function(event){
        if(event.key === 'Enter'){
          handleSubmit();
        }
      }

      return(
        <React.Fragment>
          <DropdownButton
            alignRight
            title="Log In"
            id="dropdown-menu-align-right"
            className={this.state.loggedIn ? "" : "dropdown-menu-logged-out"}
          >
          <div onKeyPress={handleEnter}>
          <h5>Login</h5>
          {siState.signInErrorVisual}
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control autoComplete = "email" name="username" type="email" placeholder="Enter email" onChange={handleTextChange} value = {siState.username} />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control autoComplete="current-password" name="password" type="password" placeholder="Password" onChange={handleTextChange} value = {siState.password} />
              </Form.Group>
              <Button variant="primary" type="submit" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          <hr />
          </DropdownButton>
        </React.Fragment>
      );
    }.bind(this);

    if(this.state.loggedIn){
      return(
        <React.Fragment>
          <DropdownButton
            alignRight
            title={this.state.userObject.userDisplayName}
            id="dropdown-menu-align-right"
          >
            <Dropdown.Item eventKey="1" href="/account">Account Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item eventKey="4" onClick={() => {fetch('/logout'); window.location="/"; } } >Logout</Dropdown.Item>
          </DropdownButton>
        </React.Fragment>
      )
    }else{
      return(
        <SignInForm />
      )
    }

  }.bind(this)

  NavBar = function(){
      return(
        <Navbar bg="primary" variant="dark">
          <Navbar.Brand href="/">{options.appTitle}</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="/search">Search Documents</Nav.Link>
            <Nav.Link href="/saved">Favorite Documents</Nav.Link>
          </Nav>
          <this.LoginIndicator />
        </Navbar>
      )
  }.bind(this)

  render(){
    return(
      <React.Fragment>
          <Router>
            <this.NavBar />
              <Route exact path="/" component={App} />
              <Route exact path="/about" component={About} />
              <Route exact path="/signup"
                render = {(props) => <SignUp {...props} /> }
              />
              <Route exact path="/search"
                component = {Browser}
              />
              <Route exact path="/account" component={Account} />
          </Router>
      </React.Fragment>
    )
  }
}

export default UserState;
