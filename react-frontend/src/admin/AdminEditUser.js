import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { Card, Button, Modal, Alert } from 'react-bootstrap';
var m = require('@milescwatson/m');
function AdminEditUser(props){
  const [show, setShow] = useState(false);
  const handleClose = function(){
    setShow(false);
    setAlertActive(false);
  }
  const handleShow = () => setShow(true);
  const [currentUserObject, setCurrentUserObject] = useState(null);
  const [statusMessage, setStatusMessage] = useState({
    status: null,
    error: null,
    variant: null
  });

  const [alertActive, setAlertActive] = useState(false);

  const [userObjectForm, setUserObjectForm] = useState({
    firstname: props.userObject.firstname,
    lastname: props.userObject.lastname,
    email: props.userObject.email,
    role: props.userObject.role,
    password: ''
  });

  function getCurrentUserObject(){
    m.fetch.getJSON('/get-user-object', (error, result)=>{
      setCurrentUserObject(result);
    });
  }
  useEffect(getCurrentUserObject, []);


  function handleSubmit(){
    var toSend = {
      id: props.userID,
      email: userObjectForm.email,
      firstname: userObjectForm.firstname,
      lastname: userObjectForm.lastname,
      role: userObjectForm.role,
      password: userObjectForm.password
    }

    m.fetch.postJSON('/edit-user', JSON.stringify(toSend), function(error, result){
      if(result.error === null){
        setStatusMessage((prev)=>{
          prev.status = "Successfuly edited user"
          prev.variant = "success"
          return(prev);
        });
        setAlertActive(false);
        setAlertActive(true);
        props.refreshListCallback()
      }else{
        setStatusMessage((prev)=>{
          prev.status = result.status;
          prev.variant = "danger";
          return(prev);
        });
        setAlertActive(false);
        setAlertActive(true);
      }
    });
  }

  var handleChange = function(event, attribute){
    const value = event.target.value
    setUserObjectForm(prevState => {
      const userObjectFormCopy = {...userObjectForm};
      userObjectFormCopy[attribute] = value;
      return (userObjectFormCopy);
    });
  }

  var handleDelete = function(){
    var requestBody = {
      userID: props.userID
    }

    m.fetch.postJSON('/delete-user', JSON.stringify(requestBody), function(error, result){
      if(!error){
        setStatusMessage((prev)=>{
          prev.status = "Successfuly edited user"
          prev.variant = "success"
          return(prev);
        });
        setAlertActive(false);
        setAlertActive(true);
        setTimeout(function () {
          setShow(false)
          props.refreshListCallback()
        }, 1000);
      }else{
        setStatusMessage((prev)=>{
          prev.status = "Error editing user"
          prev.variant = "danger"
          return(prev);
        });
        setAlertActive(false);
        setAlertActive(true);
      }
    })
  }

  var roleChangeDisabled = false;
  if(currentUserObject !== null){
    roleChangeDisabled = (currentUserObject.id === props.userID) ? true : false;
  }

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        Edit User Details
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>Edit User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(alertActive !== null) ? (<Alert variant={statusMessage.variant}>{statusMessage.status}</Alert>) : ""}

          <div className="form-group">
            First Name: <input value={userObjectForm.firstname} onChange={(event)=>{handleChange(event, 'firstname')}} className="form-control" type="text" />
            Last Name: <input value={userObjectForm.lastname} onChange={(event)=>{handleChange(event, 'lastname')}} className="form-control" type="text" />
            Email: <input value={userObjectForm.email} onChange={(event)=>{handleChange(event, 'email')}} className="form-control" type="email" />
            Password: <input placeholder="Enter a new password" value={userObjectForm.password} onChange={(event)=>{handleChange(event, 'password')}} className="form-control" type="password" />
            Role: <select disabled={roleChangeDisabled} onChange={(event)=>{handleChange(event, 'role')}} value={userObjectForm.role} className="form-control" type="select"><option>user</option><option>admin</option></select>
          </div>
          { roleChangeDisabled ? '' : <Button variant="link" onClick={handleDelete}>Delete user</Button> }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
            <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminEditUser;
