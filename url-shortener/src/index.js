import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCyqFRLHF2mHVKk9A_AZHEhvFFE1W40m0k",
  authDomain: "url-shortener-c511a.firebaseapp.com",
  projectId: "url-shortener-c511a",
  storageBucket: "url-shortener-c511a.appspot.com",
  messagingSenderId: "770055564373",
  appId: "1:770055564373:web:6a26ffbc3bdb46cc5738dc",
  measurementId: "G-W166HSYDN7"
};

initializeApp(firebaseConfig);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
