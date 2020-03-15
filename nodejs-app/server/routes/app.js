const express = require('express');
const router = express.Router();
const Swal = require('sweetalert2');
//var admin = require("firebase-admin");
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
var current;
firebase.auth().onAuthStateChanged(user =>{
    current=user;
});

function isLoggedIn() {
        // Listen for auth state changes

        //console.log(current);
        if(current && firebase.auth().currentUser== current){
            return true;
        }
        else{
            return false;
        }
    //console.log(firebase.auth().currentUser);
}
router.get('/', (req, res) => {
    res.redirect('/login');
});
router.get('/login', (req, res) => {
    console.log(isLoggedIn());
    if(isLoggedIn()){
        res.redirect('/dashboard');
    }
    else{
        res.render('login',{
            message: ''
        }); 
    }
});

router.get('/register', (req, res) => {

    //console.log(isLoggedIn());
    if(isLoggedIn()){
        res.redirect('/dashboard');
    }
    else{
        res.render('register',{
            message: ''
        }); 
    }
});
router.post('/login', (req, res) => {
    let email= req.body.email;
    let password= req.body.password;
    firebase.auth().signInWithEmailAndPassword(email, password)  // Sign In the user
    .then(function(result) {
        //console.log(result);
        res.redirect('/dashboard');
      // result.user.tenantId should be ‘TENANT_PROJECT_ID’.
    }).catch(function(error) {
      // Handle error.
        //console.log(error);
        res.render('login',{
            message: error.message
        });
    }); 
});

router.post('/register', (req, res) => {
    let email= req.body.email;
    let password= req.body.password;
    let confirm_password= req.body.confirm_password;
    if(password===confirm_password){
    firebase.auth().createUserWithEmailAndPassword(email, password) //Create the user and Sign them In
    .then(function(result) {
        res.redirect('/dashboard');
      // result.user.tenantId should be ‘TENANT_PROJECT_ID’.
    }).catch(function(error) {
      // Handle error.
        //console.log(error);
        res.render('register',{
            message: error.message
        });
    }); 
    }
    else{
        res.render('register',{
            message: "Password doesn't match"
        });
    }
});
router.get('/reset', (req, res) => {
    res.render('reset',{
        message: ''
    });
});
router.post('/reset', (req, res) => {
    let email= req.body.email;
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Password Reset Email Sent!
        res.render('reset',{
            message:'Password Reset Email Sent!'
        });
      }).catch(function(error) {
        res.render('reset',{
            message: error.message
        });
      });
});

router.get('/dashboard', (req, res) => {
    //console.log(firebase.auth().currentUser);
    if(isLoggedIn()){
      let user= firebase.auth().currentUser;
      let userDetail=  {
            uid: user.uid,
            displayName : user.displayName,
            email : user.email,
            photoURL : user.photoURL,
            metadata: user.metadata,
        }
        firebase.database().ref('users/' + user.uid).update({
            userName : user.displayName,
            email : user.email,
            photoURL : user.photoURL
          });

        res.render('dashboard',userDetail); 
    }
    else{
        res.redirect('/login'); 
    }
});

router.get('/logout', function(req, res) {
    firebase.auth().signOut();
    res.redirect('/');
});



module.exports = router;