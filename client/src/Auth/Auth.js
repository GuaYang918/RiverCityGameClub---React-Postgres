import auth0 from "auth0-js";
import { AUTH_CONFIG } from "./auth0-variables";
import history from "../history";
import axios from "axios";
import { API_URL } from "../constants";

export default class Auth {
  userProfile;
  requestedScopes = "openid profile read:messages write:messages";

  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience: AUTH_CONFIG.apiUrl,
    responseType: "token id_token",
    scope: this.requestedScopes
  });
  // my keolazy1 adminId. consider using an array for steve and employees
  adminId = "google-oauth2|113651650652944605346";

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.userHasScopes = this.userHasScopes.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.getUniqueId = this.getUniqueId.bind(this);
    this.checkGrav = this.checkGrav.bind(this);
    // this.matchEmail = this.matchEmail.bind(this);
    this.getUser = this.getUser.bind(this);
  }
  checkGrav(str) {
    let containsGrav = /grav/.test(str);
    // console.log(containsGrav);
    return containsGrav;
  }

  // matchEmail(string, arr) {
  //   console.log(string);
  //   const usersArray = arr;
  //   for (let i = 0; i < usersArray.length; i++) {
  //     let userEmail = usersArray[i].email;
  //     let re = new RegExp(string, "gi");
  //     // console.log(userEmail.match(re));
  //     if (userEmail.match(re)) {
  //       console.log("YAY! found an email match with " + usersArray[i].email);
  //       // set variable form instead of setState
  //       const userId = usersArray[i].id;
  //       return userId;
  //     } else {
  //       console.log("Sorry, no matches");
  //     }
  //   }
  // }

  getUser(input) {
    console.log("getUser being called");
    const id = input;
    axios
      .get(`${API_URL}/user/${id}`)
      .then(response => {
        console.log(response.data); // returns (1) user object that matches auth.
        // set variable form instead of setState
        const user = response.data;
        return user;
      })
      .catch(error => console.log(error));
  }

  getUniqueId() {
    if (!this.userProfile) {
      this.getProfile((err, profile) => {
        console.log(profile.sub);
        const uniqueId = profile.sub;
        console.log(uniqueId);
        return uniqueId;
      });
    } else {
      console.log("No userProfile");
      const uniqueId = this.userProfile.sub;
      console.log(uniqueId);
      return uniqueId;
    }
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        history.replace("/home");
      } else if (err) {
        history.replace("/home");
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    // If there is a value on the `scope` param from the authResult,
    // use it to set scopes in the session for the user. Otherwise
    // use the scopes as requested. If no scopes were requested,
    // set it to nothing
    const scopes = authResult.scope || this.requestedScopes || "";

    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
    localStorage.setItem("scopes", JSON.stringify(scopes));
    // navigate to the home route
    history.replace("/home");
  }

  getAccessToken() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No access token found");
    }
    return accessToken;
  }

  getProfile(cb) {
    let accessToken = this.getAccessToken();
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        this.userProfile = profile;
      }
      cb(err, profile);
    });
  }

  // Make Post auth0 user to database function here.
  postNewUser(userProfile) {
    console.log(userProfile);
    // if(!userProfile) {
    //   this.getProfile( (err, profile) => {
    //     this.setState({ profile })
    //   })
    // } else {
    //   this.setState({ profile: userProfile })
    // }
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("scopes");
    this.userProfile = null;
    // navigate to the home route
    history.replace("/home");
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return new Date().getTime() < expiresAt;
  }

  userHasScopes(scopes) {
    const grantedScopes = (
      JSON.parse(localStorage.getItem("scopes")) || ""
    ).split(" ");
    return scopes.every(scope => grantedScopes.includes(scope));
  }


}

// variable only Profile.js

// componentWillMount() {
//   const { userProfile, getProfile, checkGrav, matchEmail, getUser, userId, users } = this.props.auth;
//   // Imported from line 6
//   console.log(this.props.auth);
//   const defaultPicture = logo;

//   if (!userProfile) {

//     axios.get(`${API_URL}/user`)
//     .then(response => {
//       console.log(response);
//       const users = response.data;
//       this.state.users = users;
//     });

//     getProfile((err, profile) => {
//       if (this.checkGrav(profile.picture) === true) {
//         profile.picture = defaultPicture;
//         // set variable form instead of setState
//         const newProfile = profile;
//         console.log(newProfile)
//         const emailString = profile.name
//         console.log(emailString) // prints nathan.keolasy@gmail.com
//         const userId = this.matchEmail(emailString, users);
//         console.log(userId);
//         const user = this.getUser(userId)

//         this.setState({profile: profile, users: users, emailString: emailString, userId: userId, user: {}})
//         console.log(this.state)
//       }
//       // google signins return usernames as "profile.nickname" (keolazy1).
//       else if (checkGrav(profile.picture) === false) {
//         console.log("This must be a gmail account... ");
//         // this.setState({ profile, emailString: profile.nickname });
//         // set variable form instead of setState
//         const newProfile = profile;
//         const emailString = profile.nickname;
//         const userId = this.matchEmail(emailString);
//         const user = this.getUser(userId);
//         this.setState({profile: profile, users: users, emailString: emailString, userId: userId, user: {}})
//       } else {
//         console.log("if and else if, didn't happen....");
//         // set variable form instead of setState
//         const profile = profile
//       }
//     });
//   } else {
//     // this.setState({ profile: userProfile });
//     // set variable form instead of setState
//     const profile = userProfile
//     // this.setState({ profile: userProfile })
//   }

// }

// checkGrav(str) {
//   let containsGrav = /grav/.test(str);
//   // console.log(containsGrav);
//   return containsGrav;
// }

// matchEmail(string) {
//   console.log(string);
//   const usersArray = this.state.users;
//   for (let i = 0; i < usersArray.length; i++) {
//     let userEmail = usersArray[i].email;
//     let re = new RegExp(string, "gi");
//     // console.log(userEmail.match(re));
//     if (userEmail.match(re)) {
//       console.log("YAY! found an email match with " + usersArray[i].email);
//       // set variable form instead of setState
//       const userId = usersArray[i].id;
//       return userId
//     } else {
//       console.log("Sorry, no matches");
//     }
//   }
// }

// getUser(input) {
//   console.log("getUser being called");
//   const id = input;
//   axios
//     .get(`${API_URL}/user/${id}`)
//     .then(response => {
//       console.log(response.data); // returns (1) user object that matches auth.
//       // set variable form instead of setState
//       const user = response.data;
//       return user;
//     })
//     .catch(error => console.log(error));
// }
