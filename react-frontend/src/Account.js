import React, {useState, useEffect} from 'react';
import Admin from './admin/Admin';
import { Card, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

var m = require('@milescwatson/m');

function Account(props) {
  const [userInfo, setUserInfo] = useState({});

  var getUserInfo = function(){
    m.fetch.getJSON('/login-status', function(error, result){
      if(!error){
        setUserInfo(result)
      }
    });
  }
  useEffect(getUserInfo, []);

  function EditUser() {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
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

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return(
    <React.Fragment>
      <h1>Account Info</h1>
      <b></b>
        <Card>
          <Card.Header>Account Details</Card.Header>
          <Card.Body>
            <Card.Text>
              <b>Name: </b> {userInfo.firstname+" "+userInfo.lastname}
              <br />
              <b>Email:</b> {userInfo.email}
              <br />
              <b>Account type:</b> {userInfo.role}
            </Card.Text>
          </Card.Body>
        </Card>
      {
        [userInfo.role].map((val)=>{
          if(userInfo.role === 'admin'){
            return(<Admin key={1} />)
          }
        })
      }
    </React.Fragment>
  )
}

export default Account;
