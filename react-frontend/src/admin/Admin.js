import React, {useState} from 'react';
import { Card } from 'react-bootstrap';
import UserTable from './UserTable';
import CreateUserModal from './AdminCreateUser';

// A component that shows up in the admin's "my account" page

function Admin(props) {
  const [userInfo, setUserInfo] = useState({});

  return(
    <>
    <h1>Admin Settings</h1>
    <Card>
      <Card.Header>Users</Card.Header>
      <Card.Title></Card.Title>
      <Card.Body>
        <CreateUserModal />
        <UserTable />
      </Card.Body>
    </Card>
    </>
  )
}

export default Admin;
