const express = require('express');
const router = express.Router();
var admin = require("firebase-admin");

var serviceAccount = require("../../firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iotguy-dashboard.firebaseio.com"
});

var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
  
firebase.initializeApp({
    apiKey: "AIzaSyC2q4rXmLAmV2d5HKLWlUWY3MAvYLPMoso",
    authDomain: "iotguy-dashboard.firebaseapp.com",
    databaseURL: "https://iotguy-dashboard.firebaseio.com",
    projectId: "iotguy-dashboard",
    storageBucket: "iotguy-dashboard.appspot.com",
    messagingSenderId: "249564343788",
    appId: "1:249564343788:web:b7004b7c8e01eba925a4c9"
});


router.get('/', (req, res) => {
    res.redirect('/login');
});
router.get('/login', (req, res) => {

        res.render('login',{
            message: ''
        }); 
    
});

router.get('/register', (req, res) => {

    res.render('register',{
        message: ''
    });        
    

});
// router.post('/login', (req, res) => {
//     let email= req.body.email;
//     let password= req.body.password;
//     firebase.auth().signInWithEmailAndPassword(email, password)  // Sign In the user
//     .then(function(result) {
//         //console.log(result);
//         res.redirect('/dashboard');
//       // result.user.tenantId should be ‘TENANT_PROJECT_ID’.
//     }).catch(function(error) {
//       // Handle error.
//         //console.log(error);
//         res.render('login',{
//             message: error.message
//         });
//     }); 
// });
router.get('/sessionLogin', (req, res) => {
    // Get the ID token passed and the CSRF token.
    const idToken = req.query.token.toString();
    
    // Set session expiration to 3 hr.
    const expiresIn = 60 * 60* 3 * 1000;
    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    // To only allow session cookie setting on recent sign-in, auth_time in ID token
    // can be checked to ensure user was recently signed in before creating a session cookie.
    admin.auth().createSessionCookie(idToken, {expiresIn})
      .then((sessionCookie) => {
       // Set cookie policy for session cookie.
       const options = {maxAge: expiresIn, httpOnly: true};
       res.cookie('session', sessionCookie, options);

       res.redirect('/dashboard');
      })
      .catch(error => {
       res.status(401).send('UNAUTHORIZED REQUEST!');
      });
  });

router.post('/register', (req, res) => {
    let email= req.body.email;
    let password= req.body.password;
    let confirm_password= req.body.confirm_password;
    if(password===confirm_password){
        admin.auth().createUser({
            email: email,
            password: password
          })
            .then(function(userRecord) {
              // See the UserRecord reference doc for the contents of userRecord.
              console.log('Successfully created new user:', userRecord.uid);
              res.render('login',{
                message: 'Login with same credentials'
                }); 
            })
            .catch(function(error) {
              console.log('Error creating new user:', error.errorInfo.message);
                res.render('register',{
                    message: error.errorInfo.message
                });
            });
    }
    else{
        res.render('register',{
            message: "Password doesn't match"
        });
    }
});

router.get('/dashboard',(req, res) => {  //Protected route
    //console.log(firebase.auth().currentUser);
    try{
        const sessionCookie= req.cookies.session;
        //console.log(token);
        // idToken comes from the client app
        admin.auth().verifySessionCookie(
            sessionCookie, true /** checkRevoked */)
            .then((decodedClaims) => {
                //console.log(decodedClaims);

                firebase.database().ref('users/' + decodedClaims.user_id).update({
                    email : decodedClaims.email
                  });
        
                res.render('dashboard',{
                    uid: decodedClaims.user_id,
                    email: decodedClaims.email,
                    
                });
            })
            .catch(error => {
              // Session cookie is unavailable or invalid. Force user to login.
              console.log(error);
              res.redirect('/login');
            });
        
    }
    catch(err){
        return res.status(401).render('login',{  //401 Unauthorized Accesss
            message: 'Token expired or tampered'
        }); 
    }
    
});

router.get('/logout', function(req, res) {
    res.clearCookie('session');
    res.redirect('/login');
});

   


module.exports = router;