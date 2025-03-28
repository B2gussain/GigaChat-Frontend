import React from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Welcome from './Pages/Welcome/Welcome'
import Home from "./Pages/Home/Home"
import Profile from './Pages/Profile/Profile'
import Status from "./Pages/Status/Status"
import Find from "./Pages/Find/Find"
import Login from "./Pages/auth/Login"
import Notification from "./Pages/Notification/Notification"


import Signup from './Pages/auth/Signup'

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route  path="/"  element={<Welcome/>}  />
      <Route  path="/home"  element={<Home/>}  />
      <Route  path="/Status"  element={<Status/>}  />
      <Route  path="/Find"  element={<Find/>}  />
      <Route  path="/Login"  element={<Login/>}  />
      <Route  path="/Signup"  element={<Signup/>}  />
      <Route  path="/Notification"  element={<Notification/>}  />
     


      <Route  path="/Profile"  element={<Profile/>}  />

     




    </Routes>
    </BrowserRouter>
  )
}

export default App
