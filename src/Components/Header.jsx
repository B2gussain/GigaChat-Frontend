import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaPhoneAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full h-[60px] bg-[black] text-white flex items-center justify-between px-6 pt-2 shadow-md z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            GigaChat
          </h1>
        </div>
       
      </header>
    </>
  );
};

export default Header;