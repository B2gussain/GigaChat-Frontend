import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdAutoDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import Header from '../../Components/Header';
import Navbar from '../../Components/Navbar';
import dp from "../../assets/dp.webp";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <>
      <Header />
      <Navbar />
      <div className="pb-[60px] min-h-[100vh] w-full bg-black text-white flex flex-col justify-center items-center px-6">
        <div className="flex flex-col items-center gap-6">
          {/* Profile Picture Skeleton */}
          <div className="relative">
            <div className="h-32 w-32 md:h-40 md:w-40 bg-[#171818] rounded-full animate-pulse border-2 border-[#171818]"></div>
            <div className="absolute bottom-2 right-2 h-[30px] w-[30px] bg-[#171818] rounded-full animate-pulse"></div>
          </div>

          {/* User Info Skeleton */}
          <div className="w-[300px]">
            {/* Name */}
            <div className="flex items-center text-gray-400 mt-2">
              <FaRegUser className="h-[25px] w-[25px]" />
              <div className="flex flex-col ml-5 gap-0">
                <h5 className="font-bold text-white">Name</h5>
                <div className="h-6 w-32 bg-[#171818] rounded animate-pulse"></div>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-center text-gray-400 mt-2">
              <MdOutlineAlternateEmail className="h-[25px] w-[25px]" />
              <div className="flex flex-col ml-5 gap-0">
                <h5 className="font-bold text-white">Email</h5>
                <div className="h-6 w-48 bg-[#171818] rounded animate-pulse"></div>
              </div>
            </div>
            {/* Phone */}
            <div className="flex items-center text-gray-400 mt-2">
              <FaPhoneAlt className="h-[25px] w-[25px]" />
              <div className="flex flex-col ml-5 gap-0">
                <h5 className="font-bold text-white">Phone</h5>
                <div className="h-6 w-32 bg-[#171818] rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Logout Button Skeleton */}
          <div className="h-10 w-32 bg-[#171818] rounded-[20px] animate-pulse mt-6"></div>
        </div>
      </div>
    </>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [loaderColor, setLoaderColor] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data || {});
        setNewName(response.data.name || '');
      } catch (error) {
        console.error('Error fetching user:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profiledp', file);

    try {
      setImageLoading(true);
      setLoaderColor('green');
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/upload-profiledp`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setUser((prevUser) => ({
        ...prevUser,
        profiledp: response.data.profiledp
      }));
    } catch (error) {
      console.error('Error uploading profile picture:', error.response?.data || error.message);
    } finally {
      setImageLoading(false);
      setLoaderColor('');
    }
  };

  const handleRemoveProfilePic = async () => {
    try {
      setImageLoading(true);
      setLoaderColor('red');
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/profile/remove-profiledp`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser((prevUser) => ({
        ...prevUser,
        profiledp: undefined
      }));
    } catch (error) {
      console.error('Error removing profile picture:', error.response?.data || error.message);
    } finally {
      setImageLoading(false);
      setLoaderColor('');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutAlert(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
    setShowLogoutAlert(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutAlert(false);
  };

  const handleEditName = async () => {
    if (!isEditingName) {
      setIsEditingName(true); // Enter edit mode
      return;
    }

    // If already editing, save the new name
    const token = localStorage.getItem("token");
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/profile/name-update`,
        { name: newName, phone_number: user.phone_number },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setUser((prevUser) => ({
        ...prevUser,
        name: newName
      }));
      setIsEditingName(false); // Exit edit mode
      console.log('Name updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating name:', error.response?.data || error.message);
      alert('Failed to update name');
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Header />
      <Navbar />
      <div className="pb-[60px] min-h-[100vh] w-full bg-black text-white flex flex-col justify-center items-center px-6">
        <div className="flex flex-col items-center gap-6">
          {/* Profile Picture Container */}
          <div className="relative">
            <img
              src={user.profiledp || dp}
              alt="Profile"
              className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-2 border-[#f5fdf893] hover:border-[#ffffff] transition-colors duration-300 shadow-lg cursor-pointer"
              onClick={handleImageClick}
              onError={(e) => {
                e.target.src = dp;
              }}
            />
            <div 
              className={`absolute z-20 bottom-2 right-2 rounded-full h-[30px] w-[30px] flex justify-center items-center border-[0px] border-[#000000] cursor-pointer ${user.profiledp ? "bg-[red]" : "bg-[#1DB954]"}`}
              onClick={user.profiledp ? handleRemoveProfilePic : handleImageClick}
            >
              {user.profiledp ? (
                <MdAutoDelete 
                  className="text-white text-sm md:text-base h-[60%] w-[60%]"
                  style={{ backgroundColor: 'red', borderRadius: '50%', padding: '1px' }}
                />
              ) : (
                <FaPlus 
                  className="text-black text-sm md:text-base h-[60%] w-[60%]"
                  style={{ backgroundColor: '#1DB954', borderRadius: '50%', padding: '1px' }}
                />
              )}
            </div>
            {imageLoading && (
              <div 
                className={`absolute z-10 inset-0 flex items-center justify-center rounded-full border-4 border-gray-600 animate-spin ${
                  loaderColor === 'red' ? 'border-t-[red]' : 'border-t-[#1DB954]'
                }`}
              />
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="w-[300px]">
            <div className="relative flex items-center text-gray-400 mt-2">
              <FaRegUser className="h-[25px] w-[25px]" />
              <div className="flex flex-col ml-5 gap-0">
                <h5 className="font-bold text-white">Name</h5>
                {isEditingName ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-[#72747328] text-white p-1 border-none outline-none rounded"
                    autoFocus
                  />
                ) : (
                  <p>{user.name || 'User'}</p>
                )}
              </div>
              {isEditingName ? (
                <IoMdCheckmark 
                  onClick={handleEditName} 
                  className="right-6 bg-[#ffffff09] p-1 rounded-full text-gray-400 hover:text-white h-[30px] w-[30px] cursor-pointer absolute" 
                />
              ) : (
                <FaRegEdit 
                  onClick={handleEditName} 
                  className="right-6 text-gray-400 hover:text-white h-[20px] w-[20px] cursor-pointer absolute" 
                />
              )}
            </div>
            <div className="flex items-center text-gray-400 mt-2">
              <MdOutlineAlternateEmail className="h-[25px] w-[25px]" />
              <div className="flex flex-col ml-5 gap-0">
                <h5 className="font-bold text-white">Email</h5>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-400 mt-2">
              <FaPhoneAlt className="h-[25px] w-[25px]" />
              <div className="flex flex-col ml-5 gap-0">
                <h5 className="font-bold text-white">Phone</h5>
                <p>+91 {user.phone_number}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="py-2 mt-6 px-8 bg-[#0ff860] text-black font-bold rounded-[20px] hover:bg-[#1ed760] transition-all duration-300 shadow-md shadow-green-500/20"
          >
            Logout
          </button>
        </div>
        {/* Logout Confirmation Modal */}
        {showLogoutAlert && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#1a1a1a] text-white pt-6 rounded-lg shadow-lg w-80 text-center">
              <h2 className="text-lg font-medium text-[#f8f8f8bb] mb-4">Log out of your account?</h2>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={handleConfirmLogout}
                  className="text-[red] px-4 py-4 rounded-md font-bold hover:bg-[#131313] transition-colors duration-200"
                >
                  Log out
                </button>
                <button
                  onClick={handleCancelLogout}
                  className="text-[#f8f8f8bb] px-4 py-4 rounded-md font-bold hover:bg-[#131313] transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;