import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,setPersistence,browserSessionPersistence,browserLocalPersistence,signInWithEmailAndPassword,signOut as fbSignOut,onAuthStateChanged,updatePassword,createUserWithEmailAndPassword,reauthenticateWithCredential,EmailAuthProvider} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,setDoc,updateDoc,deleteDoc,getDoc,getDocs,query,where,orderBy,limit,arrayUnion,arrayRemove,deleteField,writeBatch} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
/* Your Firebase settings live in firebase-config.js, so updating this page never overwrites them. */
const cfg=window.FIREBASE_CONFIG||null;
const CONFIGURED=!!(cfg&&cfg.apiKey&&cfg.projectId&&!/PASTE/i.test(JSON.stringify(cfg)));
const STORAGE_ON=!!(CONFIGURED&&cfg.storageBucket&&cfg.useStorage===true);
let app=null,auth=null,db=null;
if(CONFIGURED){app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app)}
const DOM='@saints1899.example';
window.addEventListener("error",function(ev){var a=document.getElementById("app");if(a&&!a.querySelector(".db,.si")){var p=document.createElement("p");p.style.cssText="max-width:560px;margin:0 auto;padding:0 24px;font:15px system-ui;color:#b3261e";p.textContent="Error: "+ev.message;a.appendChild(p)}});
window.addEventListener('unhandledrejection',ev=>{const r=ev.reason;if(r&&(r.code||'').startsWith('auth/'))return;msg=(r&&r.message)||String(r);try{draw(1)}catch(e){}});
