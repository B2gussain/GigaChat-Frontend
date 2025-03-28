import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header';
import Navbar from '../../Components/Navbar';
import { IoMdArrowRoundBack } from 'react-icons/io';
import axios from 'axios';
import dp from "../../assets/dp.webp";

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <>
      <Header />
      <div className="pt-[20px] bg-black min-h-screen flex flex-col items-center relative pb-[80px]">
        <div className="w-full max-w-4xl px-4">
          {/* Back Button Skeleton */}
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-[#171818] rounded-full animate-pulse mr-2"></div>
            <div className="w-16 h-6 bg-[#171818] rounded animate-pulse"></div>
          </div>

          {/* Desktop: Two columns, Mobile: One column */}
          <div className="md:flex md:space-x-4">
            {/* Find Friends Column */}
            <div className="md:w-1/2 w-full mb-6">
              <div className="h-6 w-32  text-white rounded text-xl font-bold   mb-4">Find Friends</div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#171818] rounded-full animate-pulse mr-3"></div>
                      <div>
                        <div className="h-5 w-24 bg-[#171818] rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-32 bg-[#171818] rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-[#171818] rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Already Friends Column */}
            <div className="md:w-1/2 w-full">
              <div className="h-6 w-32 text-xl font-bold mb-4 inline rounded text-white ">Already Friends</div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#171818] rounded-full animate-pulse mr-3"></div>
                      <div>
                        <div className="h-5 w-24 bg-[#171818] rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-32 bg-[#171818] rounded animate-pulse mb-1"></div>
                        <div className="h-4 w-20 bg-[#171818] rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-[#171818] rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
};

const Find = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserContacts, setCurrentUserContacts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const contactsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/all-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserContacts(contactsResponse.data.map(contact => contact._id));

        const sentRequestsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/sent-friend-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingRequests(sentRequestsResponse.data);

        const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/all-users-except-me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleFriendRequest = (userId, phoneNumber) => {
    setShowConfirm(true);
    setSelectedUser({ userId, phoneNumber });
  };

  const confirmFriendRequest = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/send-friend-request`,
        { phone_number: selectedUser.phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPendingRequests(prev => [...prev, selectedUser.userId]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending friend request');
    } finally {
      setShowConfirm(false);
      setSelectedUser(null);
    }
  };

  const cancelFriendRequest = () => {
    setShowConfirm(false);
    setSelectedUser(null);
  };

  // Split users into potential friends and existing friends
  const potentialFriends = users.filter(user => !currentUserContacts.includes(user._id));
  const existingFriends = users.filter(user => currentUserContacts.includes(user._id));

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Header />
      <div className="pt-[20px] bg-black min-h-screen flex flex-col items-center relative pb-[80px]">
        <div className="w-full max-w-4xl px-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-white mb-4 flex items-center"
          >
            <IoMdArrowRoundBack size={24} />
            <span className="ml-2">Back</span>
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* Desktop: Two columns, Mobile: One column */}
          <div className="md:flex md:space-x-4">
            {/* Find Friends Column (Left on desktop, full width on mobile) */}
            <div className="md:w-1/2 w-full mb-6">
              <h2 className="text-white text-xl font-bold mb-4">Find Friends</h2>
              <div className="space-y-4">
                {potentialFriends.map((user) => {
                  const isPending = pendingRequests.includes(user._id);
                  return (
                    <div 
                      key={user._id}
                      className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg"
                    >
                      <div className="flex items-center">
                        <img
                          src={user.profiledp || dp}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                          onError={(e) => { e.target.src = dp; }}
                        />
                        <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFriendRequest(user._id, user.phone_number)}
                        disabled={isPending}
                        className={`px-3 py-1 rounded-full text-sm text-white ${
                          isPending
                            ? 'bg-yellow-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {isPending ? 'Waiting for Accept' : 'Add Friend'}
                      </button>
                    </div>
                  );
                })}
                {potentialFriends.length === 0 && !loading && (
                  <p className="text-gray-400 text-center">No new friends to add</p>
                )}
              </div>
            </div>

            {/* Already Friends Column (Right on desktop, bottom on mobile) */}
            <div className="md:w-1/2 w-full">
              <h2 className="text-white text-xl font-bold mb-4">Already Friends</h2>
              <div className="space-y-4">
                {existingFriends.map((user) => (
                  <div 
                    key={user._id}
                    className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg"
                  >
                    <div className="flex items-center">
                      <img
                        src={user.profiledp || dp}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                        onError={(e) => { e.target.src = dp; }}
                      />
                      <div>
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-sm">+91 {user.phone_number}</p>
                      </div>
                    </div>
                    <span className="text-green-500 text-sm">Friends</span>
                  </div>
                ))}
                {existingFriends.length === 0 && !loading && (
                  <p className="text-gray-400 text-center">No friends yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#0f0f0f] p-6 rounded-lg shadow-lg text-white max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">Send Friend Request?</h3>
                <p className="mb-6">
                  Are you sure you want to send a friend request to{' '}
                  {users.find(u => u._id === selectedUser?.userId)?.name || 'this user'}?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={cancelFriendRequest}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmFriendRequest}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default Find;