import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../Components/Header';
import Navbar from '../../Components/Navbar';
import { FaPlus } from 'react-icons/fa';
import dp from '../../assets/dp.webp';

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <>
      <Header />
      <Navbar />
      <div className="pt-[80px] px-8 text-white bg-black min-h-[100vh] pb-20 flex flex-col">
        {/* Title Placeholder */}
        <h1 className="h-6 w-1/4 text-[18px]   rounded  mb-4">Status</h1>

        {/* My Status Section Skeleton */}
        <div className="flex items-center mb-6 justify-between">
          <div className="flex items-center">
            <div className="relative">
              <div className="h-[50px] w-[50px] bg-[#171818] rounded-full animate-pulse border-2 border-gray-600"></div>
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-[#171818] rounded-full animate-pulse"></div>
            </div>
            <div className="ml-6 flex flex-col">
              <div className="h-5 w-24 bg-[#171818] rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-[#171818] rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 w-8 bg-[#171818] rounded-full animate-pulse"></div>
        </div>

        {/* Recent Updates Section Skeleton */}
        <h2 className="text-[16px] text-[#ffffff80] mb-3">Recent updates</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="h-[50px] w-[50px] bg-[#171818] rounded-full animate-pulse border-2 border-[#171818]"></div>
              <div className="ml-6 flex flex-col">
                <div className="h-5 w-28 bg-[#171818] rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-[#171818] rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const Status = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', profiledp: '' });
  const [userStatuses, setUserStatuses] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [isFetching, setIsFetching] = useState(false); // For initial data fetch
  const [isUploading, setIsUploading] = useState(false); // For status upload
  const [fullScreenIndex, setFullScreenIndex] = useState(null);
  const [fullScreenUserId, setFullScreenUserId] = useState(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsFetching(true);
        const statusResponse = await axios.get(`${import.meta.env.VITE_API_URL}/status/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserStatuses(statusResponse.data.userStatuses || []);

        const contactsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/all-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const contactIds = contactsResponse.data.map(contact => contact._id);
        
        const filteredStatuses = (statusResponse.data.otherStatuses || []).filter(status => 
          contactIds.includes(status.user._id)
        );
        setAllStatuses(filteredStatuses);

        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({
          name: userResponse.data.name || 'User',
          profiledp: userResponse.data.profiledp
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate('/login');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (fullScreenIndex !== null && fullScreenUserId !== null) {
      const statusesToShow = fullScreenUserId === 'self' ? userStatuses : allStatuses.filter(status => status.user._id === fullScreenUserId);
      if (statusesToShow.length > 0) {
        timerRef.current = setTimeout(() => {
          const nextIndex = fullScreenIndex - 1;
          if (nextIndex >= 0) {
            setFullScreenIndex(nextIndex);
          } else {
            setFullScreenIndex(null);
            setFullScreenUserId(null);
          }
        }, 3000);

        return () => clearTimeout(timerRef.current);
      }
    }
  }, [fullScreenIndex, fullScreenUserId, userStatuses, allStatuses]);

  const handleStatusUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('statusMedia', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/status/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setUserStatuses(prev => [response.data.status, ...prev]);
      if (fullScreenIndex !== null) {
        setFullScreenIndex(0);
      }
    } catch (error) {
      console.error('Error uploading status:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    if (userStatuses.length > 0) {
      setFullScreenUserId('self');
      setFullScreenIndex(userStatuses.length - 1);
    } else {
      fileInputRef.current.click();
    }
  };

  const handleAddAnotherStatus = () => {
    fileInputRef.current.click();
  };

  const closeFullScreen = () => {
    clearTimeout(timerRef.current);
    setFullScreenIndex(null);
    setFullScreenUserId(null);
  };

  const uniqueUsers = Object.values(allStatuses.reduce((acc, status) => {
    if (!acc[status.user._id]) {
      acc[status.user._id] = status;
    }
    return acc;
  }, {}));

  const handleOtherUserStatusClick = (userId) => {
    const userStatuses = allStatuses.filter(status => status.user._id === userId);
    if (userStatuses.length > 0) {
      setFullScreenUserId(userId);
      setFullScreenIndex(userStatuses.length - 1);
    }
  };

  if (isFetching) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Header />
      <Navbar />
      <div className="pt-[80px] px-8 text-white bg-black min-h-[100vh] pb-20 flex flex-col">
        <h1 className="text-[18px] mb-4">Status</h1>
        
        <div className="flex items-center mb-6 justify-between">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={userStatuses.length > 0 ? userStatuses[0].mediaUrl : (user.profiledp || dp)}
                alt="My status"
                className="h-[50px] w-[50px] rounded-full object-cover border-2 border-gray-600 cursor-pointer"
                onClick={handleImageClick}
              />
              {isUploading && (
                <div className="absolute inset-0 border-2 border-t-[#29fd7bd0] border-gray-600 rounded-full animate-spin" />
              )}
              {userStatuses.length === 0 && !isUploading && (
                <div 
                  className="absolute bottom-0 right-0 bg-[#00af9c] rounded-full p-1 cursor-pointer"
                  onClick={handleImageClick}
                >
                  <FaPlus className="text-white text-xs" />
                </div>
              )}
            </div>
            <div className="ml-6 flex flex-col text-white">
              <h3 className="font-medium">My status</h3>
              <p className="text-[#ffffff80] text-sm">
                {userStatuses.length > 0 ? `${userStatuses.length} status${userStatuses.length > 1 ? 'es' : ''} uploaded` : 'Tap to add status update'}
              </p>
            </div>
          </div>
          <div 
            className="bg-[#7274732d] rounded-full p-2 cursor-pointer"
            onClick={handleAddAnotherStatus}
          >
            <FaPlus className="text-white text-sm" />
          </div>
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleStatusUpload}
            className="hidden"
          />
        </div>

        {uniqueUsers.length > 0 && (
          <>
            <h2 className="text-[16px] text-[#ffffff80] mb-3">Recent updates</h2>
            {uniqueUsers.map((status) => (
              <div 
                key={status._id} 
                className="flex items-center mb-4 cursor-pointer" 
                onClick={() => handleOtherUserStatusClick(status.user._id)}
              >
                <img
                  src={status.user.profiledp || dp}
                  alt={status.user.name}
                  className="h-[50px] w-[50px] rounded-full object-cover border-2 border-[#00af9c]"
                />
                <div className="ml-6 flex flex-col text-white">
                  <h3 className="font-medium">{status.user.name}</h3>
                  <p className="text-[#ffffff80] text-sm">
                    {new Date(status.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {fullScreenIndex !== null && fullScreenUserId !== null && (
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
          onClick={closeFullScreen}
        >
          <div className="relative w-full h-full flex flex-col">
            {(() => {
              const statusesToShow = fullScreenUserId === 'self' 
                ? userStatuses 
                : allStatuses.filter(status => status.user._id === fullScreenUserId);
              const selectedUser = fullScreenUserId === 'self' 
                ? user 
                : statusesToShow[0].user;

              return (
                <>
                  <div className="w-full flex gap-1 px-4 pt-2">
                    {[...statusesToShow].reverse().map((_, index) => {
                      const reversedIndex = statusesToShow.length - 1 - index;
                      return (
                        <div
                          key={index}
                          className="h-[2px] flex-1 rounded-full bg-[#ffffff3a] relative overflow-hidden"
                        >
                          <div
                            className={`absolute inset-0 bg-[#ffffff75] ${
                              reversedIndex > fullScreenIndex ? 'w-0' : reversedIndex === fullScreenIndex ? 'animate-progress' : 'w-full'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center px-4 py-2">
                    <img
                      src={selectedUser.profiledp || dp}
                      alt={selectedUser.name || 'User'}
                      className="h-[40px] w-[40px] rounded-full object-cover border-2 border-white mr-3"
                    />
                    <span className="text-white font-medium">{selectedUser.name || 'User'}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    {statusesToShow[fullScreenIndex].mediaUrl.includes('video') ? (
                      <video
                        src={statusesToShow[fullScreenIndex].mediaUrl}
                        autoPlay
                        controls
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <img
                        src={statusesToShow[fullScreenIndex].mediaUrl}
                        alt="Full screen status"
                        className="max-w-full h-[90vh] object-contain"
                      />
                    )}
                  </div>
                  <button
                    className="absolute top-4 right-4 text-white text-2xl"
                    onClick={closeFullScreen}
                  >
                    ✕
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};

export default Status;