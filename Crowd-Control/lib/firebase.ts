import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBUpzo04C1YrPwUSssVYfaguAS_0R4P1Fo',
  authDomain: 'crowdcontrol-e9f52.firebaseapp.com',
  projectId: 'crowdcontrol-e9f52',
  storageBucket: 'crowdcontrol-e9f52.firebasestorage.app',
  messagingSenderId: '340318996360',
  appId: '1:340318996360:web:134cd98a2a5323f72f1c3d',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);