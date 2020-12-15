import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { Card, Button, Modal } from 'react-bootstrap';
import AdminEditUser from './AdminEditUser';

var m = require('@milescwatson/m');

var UserTable = function(){
  const [userList, setUserList] = useState(null);

  var fetchUserList = function(){
    m.fetch.getJSON('/list-users', function(error, result){
      if(!error){
        setUserList(result.userList);
      }
    });
  }
  useEffect(fetchUserList, []);

  if(userList !== null){
    return(
      <React.Fragment>
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Date Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {
            userList.map((user, userKey)=>{
              const userObject = userList[userKey];
              return(
                <tr key={userKey}>
                {
                Object.keys(userList[userKey]).map((value, key)=>{
                  if(value !== 'id'){
                    if(value === 'createdDateTime'){
                      return(<td key={"td_"+key}>{moment(userObject['createdDateTime']).format("MM-DD-YYYY")}</td>)
                    }
                    return(<td key={"td_"+key}>{userObject[value]}</td>);
                  }

                })
                }
                <td key={"td_"+userKey}>
                  <AdminEditUser
                    userID={userObject.id}
                    userObject={userObject}
                    refreshListCallback={fetchUserList}
                  />
                </td>
                </tr>
              )
            })
          }
        </tbody>
        </table>
        TODO: Add FTP config, password to admin settings
      </React.Fragment>
    )
  }else{
    return(
      <React.Fragment>
        <p>Loading user list...</p>
      </React.Fragment>
    )
  }

}
export default UserTable;
