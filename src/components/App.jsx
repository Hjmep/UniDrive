import React, { Component } from 'react';
import User from './User';
import Header from './Header';
import { config } from '../config';

const SCOPE = 'profile email openid https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';
const discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const API_KEY = config.web.api_key;
const CLIENT_ID = config.web.client_id;
let ready = false;
let userId = 1;

class App extends Component {
  constructor() {
    super();
    this.state = {
      userList: [],
    };
  }

  componentDidMount() {
    const script = document.createElement('script');
    script.onload = this.handleClientLoad;
    script.src = 'https://apis.google.com/js/api.js';
    document.body.appendChild(script);
  }

  handleClientLoad = () => {
    window.gapi.load('client:auth');
  }

  /**
   * Signs a new user into Google, and then begins the process of storing all of their information
   * Returns an idToken, an AccessToken, and a Code, all unique to the user in a Response object
   */
  authorizeUser = () => {
    window.gapi.load('client:auth', () => {
      window.gapi.auth2.authorize({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPE,
        responseType: 'id_token permission code',
        prompt: 'select_account',
        discoveryDocs: [discoveryUrl, 'https:googleapis.com/discovery/v1/apis/profile/v1/rest'],
      }, (response) => {
        if (response.error) {
          console.log(response.error);
          console.log('authorization error');
          return;
        }
        const accessToken = response.access_token;
        const idToken = response.id_token;
        const { code } = response;
        this.signInFunction(accessToken, idToken, code);
      });
    });
  }

  /**
   * Handles user sign in by storing all the information gained from the
   * authrizeUser() function above
   * @param {Object} accessToken the accessToken granted to the user by gapi.client.authorize()
   * @param {Object} idToken the accessToken granted to the user by gapi.client.authorize()
    * @param {Object} code the code granted to the user by gapi.client.authorize()
   */
  signInFunction = (accessToken, idToken, code) => {
    ready = false;
    const userInfo = this.parseIDToken(idToken);
    const { email } = userInfo;
    this.addUser(accessToken, idToken, code);
    const { userList } = this.state;
    const newUserIndex = userList.length - 1;
    this.updateFiles(newUserIndex, accessToken, idToken, email);
  }

  /**
   *  Handles user sign out.
   *  Removes the specified user from the userList array, then updates the State
   * @param {number} id attribute of the specific User tp be removed in the UserList array
   */
  signOutFunction = (id) => {
    if (ready) {
      if (window.confirm('Are you sure you want to remove this account?')) {
        this.setState((prevState) => {
          const newUserList = prevState.userList.filter((user) => user.id !== id);
          return {
            userList: newUserList,
          };
        });
      }
    }
  }

  /**
   * Adds a new user to the list
   * @param {Object} accessToken the accessToken granted to the user by gapi.client.authorize()
   * @param {Object} idToken the accessToken granted to the user by gapi.client.authorize()
    * @param {Object} code the code granted to the user by gapi.client.authorize()
   */
  addUser = (accessToken, idToken, code) => {
    this.setState((prevState) => ({
      userList: [...prevState.userList, {
        id: userId,
        accessToken,
        idToken,
        code,
        files: [],
      }],
    }));
    userId += 1;
  }

  /**
   * Gets the files and stores them for the user at the given index
   * @param {Number} index index of the user in the userList to update
   * @param {Object} files the file object to store
   */
  updateFiles = (index, accessToken, idToken, email) => {
    window.gapi.client.load('drive', 'v3').then(() => {
      console.log(window.gapi.client);
      window.gapi.auth2.authorize({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPE,
        prompt: 'none',
        login_hint: email,
        discoveryDocs: [discoveryUrl],
      }, (response) => {
        if (response.error) {
          console.log(response.error);
          console.log('authorization error');
          return;
        }
        this.setfiles(index, window.gapi.client.drive.files);
      });
    });
  }

  /**
   * Stores the files for the given user
   * @param {Number} index the index of the user to store the files
   * @param {Object} files file object
   */
  setfiles = (index, files) => {
    files.list({
      fields: 'files(id, name, mimeType, starred, iconLink, shared, webViewLink)',
    }).then((response) => {
      console.log(response);
      this.setState((prevState) => {
        const newUserList = prevState.userList;
        newUserList[index].files = response.result.files;
        ready = true;
        return {
          userList: newUserList,
        };
      });
    },
    (err) => { console.error('Execute error', err); });

  }

  /**
   * Decrypts the JSON string idToken in order to access the encrytped user information held within
   * @param {Object} token the idToken of the user
   */
  parseIDToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  /**
   * TODO: Work in progress
   * @param {*} userId
   * @param {*} fileId
   */
  copyFile = (userId, fileId) => {
    const index = this.getAccountIndex(userId);
    const { userList } = this.state;

    const { accessToken, idToken } = userList[index];
    const email = this.parseIDToken(idToken).email;

    console.log(`copying: ${fileId}`);
    window.gapi.client.load('drive', 'v3').then(() => {
      console.log(window.gapi.client);
      window.gapi.auth2.authorize({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPE,
        prompt: 'none',
        login_hint: email,
        discoveryDocs: [discoveryUrl],
      }, (response) => {
        console.log(response);
        if (response.error) {
          console.log(response.error);
          console.log('authorization error');
        }
        // todo: add stuff here to do the copying
        window.gapi.client.drive.files.copy({
          fileId: fileId
        }).then((response) => {
          this.refreshFunction(userList[index].id);
        });
      });
    });
  }

  /**
   * Refreshes all the files being displayed within an account
   * @param {Number} id the unique id granted to the user when placed within the userList
   */
  refreshFunction = (id) => {
    const index = this.getAccountIndex(id);

    const { userList } = this.state;

    const { idToken } = userList[index];
    const { accessToken } = userList[index];
    const userInfo = this.parseIDToken(userList[index].idToken);
    const { email } = userInfo;
    this.updateFiles(index, accessToken, idToken, email);
    console.log(`refreshed account: ${email}`);
  }

  getAccountIndex = (id) => {
    const { userList } = this.state;
    for (let i = 0; i < userList.length; i++) {
      if (userList[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Refreshes all of the accounts currently within the userList
   */
  refreshAllFunction = () => {
    const { userList } = this.state;
    for (let i = 0; i < userList.length; i++) {
      const { idToken } = userList[i];
      const { accessToken } = userList[i];
      const userInfo = this.parseIDToken(userList[i].idToken);
      const { email } = userInfo;
      this.updateFiles(i, accessToken, idToken, email);
    }
    console.log('refreshed all accounts');
  }

  render() {
    const { userList } = this.state;
    return (
      <div className="App">
        <Header />
        <span>
          <button type="button" id="signin-btn" onClick={() => this.authorizeUser()}>Add an Account</button>
          <button type="button" id="refreshAll-btn" onClick={() => this.refreshAllFunction()}>Refresh all Accounts</button>
        </span>
        {userList.map((user) => (
          <User
            infoData={this.parseIDToken(user.idToken)}
            fileList={user.files}
            userId={user.id}
            removeFunc={this.signOutFunction}
            refreshFunc={this.refreshFunction}
            copyFunc={this.copyFile}
          />
        ))}
      </div>
    );
  }
}

export default App;
