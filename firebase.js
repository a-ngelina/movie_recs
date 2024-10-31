
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, getDoc, setDoc, doc, updateDoc, arrayUnion, arrayRemove, increment } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
export { userUID, addMovie, removeMovie, hasMovie, getDataFromDatabase, getDataLength };
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth();
const loginPopup = document.getElementById("loginPopup");
const loginWithGoogle = document.getElementById("loginWithGoogle");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const loginActionButton = document.getElementById("loginActionButton");
const signupActionButton = document.getElementById("signupActionButton");
const emailInputLogin = document.getElementById("emailInputLogin");
const passwordInputLogin = document.getElementById("passwordInputLogin");
const emailInputSignup = document.getElementById("emailInputSignup");
const passwordInputSignup = document.getElementById("passwordInputSignup");

let emailLogin = "", emailSignup = "", passwordLogin = "", passwordSignup = "";
emailInputLogin.addEventListener("input", () => {
  emailLogin = emailInputLogin.value;
})
emailInputSignup.addEventListener("input", () => {
  emailSignup = emailInputSignup.value;
})
passwordInputLogin.addEventListener("input", () => {
  passwordLogin = passwordInputLogin.value;
})
passwordInputSignup.addEventListener("input", () => {
  passwordSignup = passwordInputSignup.value;
})

let userUID = null;
setPersistence(auth, browserLocalPersistence);

const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  if (user) {
    userUID = user.uid;
    loginButton.style.display = "none";
    logoutButton.style.display = "inline-block";
  }
  else {
    userUID = null;
    loginButton.style.display = "inline-block";
    logoutButton.style.display = "none";
  }
})

function createDocuments() {
  for (const col of ["watched", "favourite", "saved"].values()) {
    getDoc(doc(db, col, userUID))
    .then((snapshot) => {
      if (snapshot.exists()) {
      }
      else {
        setDoc(doc(db, col, userUID), {movies: [], length : 0})
        .then(() => {

        })
        .catch((error) => {
          console.log(error);
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
}

loginWithGoogle.addEventListener("click", (e) => {
  e.preventDefault();
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    userUID = user.reloadUserInfo.localId;
    loginPopup.style.display = "none";
    loginButton.style.display = "none";
    logoutButton.style.display = "inline-block";

    createDocuments();
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    console.log(error.message);
    /*
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...*/
  });
});



signupActionButton.addEventListener("click", (e) => {
  e.preventDefault();
  createUserWithEmailAndPassword(auth, emailSignup, passwordSignup)
  .then((userCredential) => {
    userUID = userCredential.user.uid;
    loginPopup.style.display = "none";
    loginButton.style.display = "none";
    logoutButton.style.display = "inline-block";
    createDocuments();
  })
  .catch((error) => {
    console.log(error.message);
  })
});

loginActionButton.addEventListener("click", (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(auth, emailLogin, passwordLogin)
  .then((userCredential) => {
    userUID = userCredential.user.uid;
    loginPopup.style.display = "none";
    loginButton.style.display = "none";
    logoutButton.style.display = "inline-block";
    createDocuments();
  })
  .catch((error) => {
    console.log(error.message);
  })
})

async function hasMovie(col, content) {
  try {
    if (!userUID) return 0;
    const docRef = doc(db, col, userUID);
    const snapshot = await getDoc(docRef);
    return snapshot.data().movies.includes(content);
  }
  catch(error) {
    console.log(error);
    return 0;
  }
}

function addMovie(col, content) {
  const docRef = doc(db, col, userUID);
  updateDoc(docRef, {
    movies: arrayUnion(content),
    length: increment(1)
  })
  .then(() => {})
  .catch((error) => {
    console.log(error);
  });
}

function removeMovie(col, content) {
  const docRef = doc(db, col, userUID);
  updateDoc(docRef, {
    movies: arrayRemove(content),
    length: increment(-1)
  })
  .then(() => {})
  .catch((error) => {
    console.log(error);
  });
}

async function getDataFromDatabase(page) {
  if (!userUID) return [];
  const docRef = doc(db, page, userUID);
  const snapshot = await getDoc(docRef);
  return snapshot.data().movies;
}

async function getDataLength(page) {
  if (!userUID) return 0;
  const docRef = doc(db, page, userUID);
  const snapshot = await getDoc(docRef);
  return snapshot.data().length;
}

logoutButton.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut()
  .then(() => {
    logoutButton.style.display = "none";
    loginButton.style.display = "inline-block";
    userUID = null;
  }).catch((error) => {
    console.log(error);
  });
});