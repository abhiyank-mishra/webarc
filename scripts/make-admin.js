// Script to make current user admin
// Run this once to make yourself admin

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDB2fFie-bE5BQLksnpvukzHna985WgDhE",
  authDomain: "webark-mediqueue.firebaseapp.com",
  projectId: "webark-mediqueue",
  storageBucket: "webark-mediqueue.firebasestorage.app",
  messagingSenderId: "818091665549",
  appId: "1:818091665549:web:17b43fc766181f0f779ac4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function makeCurrentUserAdmin() {
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ No user is signed in!');
    console.log('Please sign in first, then run this script again.');
    return;
  }

  try {
    await setDoc(doc(db, 'admins', user.uid), {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      order: 1
    });

    console.log('✅ Success! User is now admin:');
    console.log('   Email:', user.email);
    console.log('   UID:', user.uid);
    console.log('\nRefresh the page to see admin access!');
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  }
}

// Run the function
makeCurrentUserAdmin();
