import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoMdNotificationsOutline } from "react-icons/io";


import { FaHome,FaUserFriends, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation(); // Get the current route

  // Function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="h-[60px] w-full bg-black fixed bottom-0 flex justify-around items-center text-white border-t border-[#2E2E2E]">
      <Link 
        to="/home" 
        className={`flex flex-col items-center transition-colors duration-200 ${
          isActive('/home') ? 'text-[#1DB954]' : 'text-white hover:text-[#1DB954]'
        }`}
        title="Home"
      >
        <FaHome className="text-xl" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link 
        to="/status" 
        className={`flex flex-col items-center transition-colors duration-200 ${
          isActive('/status') ? 'text-[#1DB954]' : 'text-white hover:text-[#1DB954]'
        }`}
        title="Status"
      >
        <FaEnvelope className="text-xl" />
        <span className="text-xs mt-1">Status</span>
      </Link>
      
      <Link 
        to="/Find" 
        className={`flex flex-col items-center transition-colors duration-200 ${
          isActive('/Find') ? 'text-[#1DB954]' : 'text-white hover:text-[#1DB954]'
        }`}
        title="Find"
      >
        <FaUserFriends className="text-xl" />
        <span className="text-xs mt-1">Find</span>
      </Link>
      
      <Link 
        to="/Notification" 
        className={`flex flex-col items-center transition-colors duration-200 ${
          isActive('/Notification') ? 'text-[#1DB954]' : 'text-white hover:text-[#1DB954]'
        }`}
        title="Notificatio"
      >
        <IoMdNotificationsOutline className="text-xl" />
        <span className="text-xs mt-1">Notification</span>
      </Link>
      <Link 
        to="/profile" 
        className={`flex flex-col items-center transition-colors duration-200 ${
          isActive('/profile') ? 'text-[#1DB954]' : 'text-white hover:text-[#1DB954]'
        }`}
        title="Profile"
      >
        <FaUser className="text-xl" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </nav>
  );
};

export default Navbar;