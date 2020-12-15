const FtpSrv = require('ftp-srv');
const FTPCredentials = require('./FTPCredentials.json');

const ftpServer = new FtpSrv({
  url: "ftp://0.0.0.0:21",
  greeting: "docupload greeting",
  pasv_url: "0.0.0.0"
});

ftpServer.on('login', (data, resolve, reject) => {
  // console.log('connection = ', connection);
  // console.log('username = ', username);
  // console.log('password = ', password);
  if(data.password === FTPCredentials.password && data.username === FTPCredentials.username){
    options = {
      root: "/jmdocuments/server/ftp/cd-upload-target"
    }
    resolve(options);
  }else{
    console.log('FTP Error: Incorrect username/password');
    reject();
  }

});
ftpServer.on('client-error', ({connection, context, error}) => {
  console.log('client-error');
});

exports.startFTPServer = function(){
  ftpServer.listen()
  .then(() => {
    console.log('FTP Server Running');
  });
};
