import React, {useState} from 'react';
import { Modal, Button } from 'react-bootstrap';
import SignUp from '../SignUp';

function CreateUserModal() {
  // THIS IS NON-FUNCTIONAL CURRENTLY
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
    <Button variant="info" onClick={handleShow}>
      Create A User
    </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>Create A User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SignUp
            initiateSession={false}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CreateUserModal;
