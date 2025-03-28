import React, { useState, useEffect } from 'react';
import { LuMessageCircleHeart } from "react-icons/lu";
import { motion } from "framer-motion";
import { useNavigate, Link } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
        when: "beforeChildren",
        staggerChildren: 0.1 
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "tween",
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Add button animation variants
  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "tween",
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 15px rgba(29, 185, 84, 0.5)",
      transition: {
        duration: 0.3,
        yoyo: Infinity
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className='min-h-screen w-full bg-black flex flex-col justify-center items-center relative'>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col items-center gap-10"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center">
          <LuMessageCircleHeart  
            className='bg-[#1DB954] h-[200px] w-[200px] hover:bg-[#1ed760] p-6 text-[#ffffffb0] rounded-[50px] transition-colors duration-300' 
          />
          <h1 className='text-4xl font-bold text-white mt-4 tracking-tight'>
            GigaChat
          </h1>
        </motion.div>
        
        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
        >
          <Link
            to="/Login"
            className='py-3 px-10 bg-[#1DB954] rounded-full text-black font-bold text-lg
                      hover:bg-[#1ed760] transform 
                      transition-all duration-300 shadow-lg shadow-green-500/20'
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;