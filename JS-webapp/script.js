/**
 * Handles the sign in button press.
 */
function toggleSignIn() {
    document.getElementById('spinner').classList.add('is-active');
    let x = document.querySelectorAll(".authblock");
        for (let i = 0; i < x.length; i++) {
        x[i].style.visibility="hidden";
        }
    if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
    } else {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
        } else {
        alert(errorMessage);
        }
        console.log(error);
        document.getElementById('spinner').classList.remove('is-active');
        x = document.querySelectorAll(".authblock");
        for (let i = 0; i < x.length; i++) {
        x[i].style.visibility="visible";
        }
        document.getElementById('quickstart-sign-in').disabled = false;
        // [END_EXCLUDE]
    });
    // [END authwithemail]
    }
    document.getElementById('quickstart-sign-in').disabled = true;
}

/**
 * Handles the sign up button press.
 */
function handleSignUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
    alert('Please enter an email address.');
    return;
    }
    if (password.length < 4) {
    alert('Please enter a password.');
    return;
    }
    // Create user with email and pass.
    // [START createwithemail]
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
    } else {
        alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
    });
    // [END createwithemail]
}

function sendPasswordReset() {
    var email = document.getElementById('email').value;
    // [START sendpasswordemail]
    firebase.auth().sendPasswordResetEmail(email).then(function() {
    // Password Reset Email Sent!
    // [START_EXCLUDE]
    alert('Password Reset Email Sent!');
    // [END_EXCLUDE]
    }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/invalid-email') {
        alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
        alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
    });
    // [END sendpasswordemail];
}

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
      // [START_EXCLUDE silent]
  document.getElementById('spinner').classList.remove('is-active');
  let x = document.querySelectorAll(".authblock");
    for (let i = 0; i < x.length; i++) {
    x[i].style.visibility="visible";
    }
      // [END_EXCLUDE]
  if (user) {
        // User is signed in.
      y = document.querySelectorAll(".dashboard");
      for (let i = 0; i < y.length; i++) {
      y[i].style.visibility="visible";
      }
      var displayName = user.displayName;
      var email = user.email;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      firebase.database().ref('users/' + uid).update({
        email : user.email,
      });
        // [START_EXCLUDE]
    document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
    document.getElementById('dtext').textContent="You are signed In with "+email;
    document.getElementById('quickstart-sign-in').textContent = 'Sign out';
    document.getElementById('quickstart-sign-up').style.visibility="hidden";
    document.getElementById('email').style.visibility="hidden";
    document.getElementById('password').style.visibility="hidden";
    document.getElementById('quickstart-password-reset').style.visibility="hidden";
    document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');

    var ref = firebase.database().ref();
    var red = firebase.database().ref('users/'+uid+'/red-led');
    var green = firebase.database().ref('users/'+uid+'/green-led');
    var ldr = firebase.database().ref('users/'+uid+'/ldr');
    //Ultrasonic last 5 value DB reference
    var first = firebase.database().ref('users/'+uid+'/ultrasonic/first');
    var second = firebase.database().ref('users/'+uid+'/ultrasonic/second');
    var third = firebase.database().ref('users/'+uid+'/ultrasonic/third');
    var fourth = firebase.database().ref('users/'+uid+'/ultrasonic/fourth');
    var fifth = firebase.database().ref('users/'+uid+'/ultrasonic/fifth');
    var servo = firebase.database().ref('users/'+uid+'/servo');

    var red_check = document.getElementById("red");
    var green_check = document.getElementById("green");
    var slider = document.getElementById("slider");
    var ctx = document.getElementById('myChart').getContext('2d');
    var data={
        labels: [],
        datasets: [{
        label: 'Distance',
        fill: false,
        borderColor: '#2196f3', // Add custom color border (Line)
        backgroundColor: '#2196f3', // Add custom color background (Points and Fill)
        borderWidth: 1 // Specify bar border width
    }]
      }
  var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true, // Instruct chart js to respond nicely.
      maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
    }
  });
  let dp=[];
  let label=[];
  let i=0;
  first.on("value", function (snap) {
    //console.log(snap.val());
    label.push(new Date().toLocaleString().split(',')[1]);
      dp.push(snap.val());
      i = dp.length;
      if(i>5){
      dp.shift();
      label.shift();
      i--;
    }
    data.labels = label;
    data.datasets[0].data=dp;
    console.log(dp);
      chart.update();  
    });

  second.on("value", function (snap) {
    //console.log(snap.val());
    label.push(new Date().toLocaleString().split(',')[1]);
      dp.push(snap.val());
      i=dp.length;
      if(i>5){
      dp.shift();
      label.shift();
      i--;
    }
      data.labels = label;
      data.datasets[0].data=dp;
        chart.update();  
    });
  third.on("value", function (snap) {
    //console.log(snap.val());
    label.push(new Date().toLocaleString().split(',')[1]);
      dp.push(snap.val());
      i = dp.length;
      if(i>5){
      dp.shift();
      label.shift();
      i--;
    }

      data.labels = label;
      data.datasets[0].data=dp;
        chart.update();  
    });
  fourth.on("value", function (snap) {
    //console.log(snap.val());
    label.push(new Date().toLocaleString().split(',')[1]);
      dp.push(snap.val());
      i = dp.length;
      if(i>5){
      dp.shift();
      label.shift();
      i--;
    }

      data.labels = label;
      data.datasets[0].data=dp;
        chart.update();  
    });
  fifth.on("value", function (snap) {
    //console.log(snap.val());
    label.push(new Date().toLocaleString().split(',')[1]);
      dp.push(snap.val());
      i = dp.length;
      if(i>5){
      dp.shift();
      label.shift();
      i--;
    }

      data.labels = label;
      data.datasets[0].data=dp;
        chart.update();  	   
    });
	
    ldr.on("value", function (snap) {
      document.getElementById('canvas').setAttribute("data-value", snap.val());
    });
    servo.on("value", function (snap) {
        slider.value= snap.val();
        document.getElementById('sliderval').innerHTML=snap.val();
    });
    $(function(){                   // Jquery for checking checkbox programitacally 
        red.on("value", function (snap) {
            if(snap.val()==1){
                //console.log("RED already checked");
                $('#red').click();
            }
        });
        green.on("value", function (snap) {
            if(snap.val()==1){
                //console.log("RED already checked");
                $('#green').click();
            }
        });
        
    });
    red_check.addEventListener('change', function(event) {
      if(event.target.checked){
      console.log("RED checked");
        red.set(1);
      }else{
      red.set(0);
      }
    });
    green_check.addEventListener('change', function(event) {
      if(event.target.checked){
      console.log("GREEN checked");
        green.set(1);
      }else{
      green.set(0);
      }
    });
    slider.addEventListener('change', function(event) {
      document.getElementById("sliderval").innerHTML=event.target.value;
      var pos= parseInt(event.target.value);
      console.log(pos);
      servo.set(pos);
    });
    
        // [END_EXCLUDE]
      } else {
        // User is signed out.
        // [START_EXCLUDE]
    y = document.querySelectorAll(".dashboard");
    for (let i = 0; i < y.length; i++) {
    y[i].style.visibility="hidden";
    }
    document.getElementById('dtext').textContent="Enter an email and password below and either sign in to an existing account or sign up";
    document.getElementById('quickstart-sign-up').style.visibility="visible";
    document.getElementById('email').style.visibility="visible";
    document.getElementById('password').style.visibility="visible";
    document.getElementById('quickstart-password-reset').style.visibility="visible";
    document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
    document.getElementById('quickstart-sign-in').textContent = 'Sign in';
    document.getElementById('quickstart-account-details').textContent = 'null';
        // [END_EXCLUDE]
      }
      // [START_EXCLUDE silent]
      document.getElementById('quickstart-sign-in').disabled = false;
      // [END_EXCLUDE]
    });
    // [END authstatelistener]

    document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
    document.getElementById('quickstart-sign-up').addEventListener('click', handleSignUp, false);
    document.getElementById('quickstart-password-reset').addEventListener('click', sendPasswordReset, false);
  }


window.onload = function() {
  initApp();
  let y = document.querySelectorAll(".dashboard");
    for (let i = 0; i < y.length; i++) {
    y[i].style.visibility="hidden";
    }
};