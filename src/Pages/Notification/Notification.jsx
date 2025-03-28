import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header';
import Navbar from '../../Components/Navbar';
import axios from 'axios';
import io from 'socket.io-client';
import dp from "../../assets/dp.webp";

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <>
      <Header />
      <div className="pb-[60px] min-h-[100vh] w-full pt-[80px] bg-black text-white flex flex-col justify-center items-center px-6">
        {/* Title Skeleton */}
        <div className="h-6 w-32 text-xl font-bold mb-1 text-white ">Notifications</div>

        {/* Notifications List Skeleton */}
        <div className="w-full max-w-md space-y-4 mt-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#171818] rounded-full animate-pulse mr-3"></div>
                <div>
                  <div className="h-5 w-48 bg-[#171818] rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-24 bg-[#171818] rounded animate-pulse"></div>
                </div>
              </div>
             
            </div>
          ))}
        </div>
      </div>
      <Navbar />
    </>
  );
};

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null); // null, 'accept', or 'reject'
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const socketRef = React.useRef(null);

  const fetchNotifications = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching notifications');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/');
      return;
    }

    const userId = JSON.parse(atob(token.split('.')[1])).userId;
    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: { token }
    });
    socketRef.current = socket;

    fetchNotifications(token);

    socket.on('friendRequestSent', (data) => {
      console.log('Received friendRequestSent:', data);
      fetchNotifications(token);
    });

    socket.on('friendRequest', (data) => {
      console.log('Received friendRequest:', data);
      fetchNotifications(token);
    });

    socket.on('friendRequestAccepted', (data) => {
      console.log('Received friendRequestAccepted:', data);
      fetchNotifications(token);
    });

    socket.on('friendRequestAcceptedByYou', (data) => {
      console.log('Received friendRequestAcceptedByYou:', data);
      fetchNotifications(token);
    });

    socket.on('friendRequestRejected', (data) => {
      console.log('Received friendRequestRejected:', data);
      fetchNotifications(token);
    });

    socket.on('friendRequestRejectedByYou', (data) => {
      console.log('Received friendRequestRejectedByYou:', data);
      fetchNotifications(token);
    });

    socket.on('connect', () => {
      socket.emit('join', userId);
      console.log(`Socket connected, joined room: ${userId}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const handleAccept = (notificationId) => {
    setShowConfirm('accept');
    setSelectedNotificationId(notificationId);
  };

  const handleReject = (notificationId) => {
    setShowConfirm('reject');
    setSelectedNotificationId(notificationId);
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = showConfirm === 'accept' ? 'accept-friend-request' : 'reject-friend-request';

      console.log(`Sending ${endpoint} for notification: ${selectedNotificationId}`);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/${endpoint}`,
        { notificationId: selectedNotificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchNotifications(token);
    } catch (err) {
      setError(err.response?.data?.message || `Error ${showConfirm === 'accept' ? 'accepting' : 'rejecting'} request`);
      console.error('Action error:', err);
    } finally {
      setShowConfirm(null);
      setSelectedNotificationId(null);
    }
  };

  const cancelAction = () => {
    setShowConfirm(null);
    setSelectedNotificationId(null);
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }); // e.g., "Oct 28, 2:30 PM"
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Header />
      <div className="pb-[60px] min-h-[100vh] w-full pt-[80px] bg-black text-white flex flex-col justify-center items-center px-6">
        <h2 className="text-xl font-bold mb-1">Notifications</h2>

        {error && <p className="text-red-500">{error}</p>}

        <div className="w-full max-w-md space-y-4">
          {notifications.map((notification) => {
            const currentUserId = JSON.parse(atob(localStorage.getItem("token").split('.')[1])).userId;
            const isSender = notification.sender?._id === currentUserId;
            const displayName = isSender ? notification.recipient?.name : notification.sender?.name;
            const displayDp = isSender ? notification.recipient?.profiledp : notification.sender?.profiledp;

            console.log(`Rendering notification ${notification._id}:`, {
              isSender,
              displayName,
              displayDp,
              type: notification.type,
              status: notification.status,
              createdAt: notification.createdAt,
            });

            return (
              <div 
                key={notification._id}
                className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg"
              >
                <div className="flex items-center">
                  <img
                    src={displayDp || dp}
                    alt={displayName || 'User'}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                    onError={(e) => { e.target.src = dp }}
                  />
                  <div>
                    {notification.type === 'friend_request' && notification.status === 'pending' && isSender && (
                      <>
                        <p className="text-white">Friend request sent to {displayName || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs">{formatTimestamp(notification.createdAt)}</p>
                      </>
                    )}
                    {notification.type === 'friend_request' && notification.status === 'pending' && !isSender && (
                      <>
                        <p className="text-white">{displayName || 'Unknown'} wants to be your friend</p>
                        <p className="text-gray-400 text-xs">{formatTimestamp(notification.createdAt)}</p>
                      </>
                    )}
                    {notification.type === 'friend_request' && notification.status === 'accepted' && isSender && (
                      <>
                        <p className="text-green-500">{displayName || 'Unknown'} accepted your friend request</p>
                        <p className="text-gray-400 text-xs">{formatTimestamp(notification.createdAt)}</p>
                      </>
                    )}
                    {notification.type === 'friend_request' && notification.status === 'accepted' && !isSender && (
                      <>
                        <p className="text-green-500">You accepted {displayName || 'Unknown'}’s friend request</p>
                        <p className="text-gray-400 text-xs">{formatTimestamp(notification.createdAt)}</p>
                      </>
                    )}
                    {notification.type === 'friend_request' && notification.status === 'rejected' && isSender && (
                      <>
                        <p className="text-red-500">{displayName || 'Unknown'} rejected your friend request</p>
                        <p className="text-gray-400 text-xs">{formatTimestamp(notification.createdAt)}</p>
                      </>
                    )}
                    {notification.type === 'friend_request' && notification.status === 'rejected' && !isSender && (
                      <>
                        <p className="text-red-500">You rejected {displayName || 'Unknown'}’s friend request</p>
                        <p className="text-gray-400 text-xs">{formatTimestamp(notification.createdAt)}</p>
                      </>
                    )}
                  </div>
                </div>
                {notification.type === 'friend_request' && notification.status === 'pending' && !isSender && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAccept(notification._id)}
                      className="px-3 py-1 rounded-full text-sm bg-green-500 text-white hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(notification._id)}
                      className="px-3 py-1 rounded-full text-sm bg-red-500 text-white hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && !loading && (
          <p className="text-gray-400">No new notifications</p>
        )}

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0f0f0f] p-6 rounded-lg shadow-lg text-white max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">
                {showConfirm === 'accept' ? 'Accept Friend Request?' : 'Reject Friend Request?'}
              </h3>
              <p className="mb-6">
                Are you sure you want to {showConfirm === 'accept' ? 'accept' : 'reject'} this friend request?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelAction}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 rounded text-white ${
                    showConfirm === 'accept' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {showConfirm === 'accept' ? 'Accept' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Navbar />
    </>
  );
};

export default Notification;