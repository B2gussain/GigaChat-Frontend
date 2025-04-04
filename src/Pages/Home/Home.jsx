import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header';
import Navbar from "../../Components/Navbar";
import axios from 'axios';
import { FaPaperPlane, FaArrowLeft, FaTrash, FaEllipsisH, FaSearch } from 'react-icons/fa';
import io from 'socket.io-client';
import dp from '../../assets/dp.webp';

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket'],
});

// Helper function to sort contacts by most recent message
const sortContactsByLastMessage = (contactsList, lastMessagesData) => {
  return [...contactsList].sort((a, b) => {
    const lastMessageA = lastMessagesData[a._id];
    const lastMessageB = lastMessagesData[b._id];
    
    if (!lastMessageA && !lastMessageB) return a.name?.localeCompare(b.name) || 0;
    if (!lastMessageA) return 1;
    if (!lastMessageB) return -1;
    return new Date(lastMessageB.createdAt) - new Date(lastMessageA.createdAt);
  });
};

// Function to format timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="bg-[#000000] min-h-[100vh] flex flex-col">
      <div className="bg-[#0a0a0a] p-4">
        <div className="h-10 w-1/3 rounded mx-auto text-white flex items-center"></div>
      </div>
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="w-full md:w-1/3 bg-[#000000] border-r border-[#080808] p-4">
          <div className="h-[50px] bg-[#171818] rounded-[40px] animate-pulse mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-12 h-12 bg-[#171818] rounded-full mr-3 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-[#171818] rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-1/2 bg-[#171818] rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-2/3 bg-[#000000] p-4 flex flex-col">
          <div className="flex items-center p-2 border-b border-[#0c0c0c]">
            <div className="w-10 h-10 bg-[#171818] rounded-full animate-pulse mr-3"></div>
            <div className="h-6 w-1/4 bg-[#171818] rounded animate-pulse"></div>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="flex items-center">
                  <div className={`h-[25px] ${i % 2 === 0 ? 'w-[150px]' : 'w-[150px]'} bg-[#171818] rounded-lg animate-pulse`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Navbar />
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastMessages, setLastMessages] = useState({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Track window width
  const messagesContainerRef = useRef(null);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('connect_error', (err) => console.error('Socket connection error:', err));
    socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
    socket.on('test', (msg) => console.log('Test message from server:', msg));

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        const contactsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/all-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(contactsResponse.data);

        const lastMessagesData = {};
        const chattedContacts = [];
        await Promise.all(
          contactsResponse.data.map(async (contact) => {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${contact._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const messages = response.data;
            if (messages.length > 0) {
              lastMessagesData[contact._id] = messages[messages.length - 1];
              chattedContacts.push(contact);
            }
          })
        );
        setLastMessages(lastMessagesData);
        const sortedChattedContacts = sortContactsByLastMessage(chattedContacts, lastMessagesData);
        setFilteredContacts(sortedChattedContacts);

        socket.emit('join', userResponse.data._id);
      } catch (err) {
        setError('Failed to load data');
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    socket.on('friendRequestAccepted', (newContact) => {
      setContacts((prev) => {
        if (!prev.some(contact => contact._id === newContact._id)) {
          return [...prev, newContact];
        }
        return prev;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('test');
      socket.off('friendRequestAccepted');
      socket.disconnect();
    };
  }, [navigate]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    let updatedFilteredContacts;
    if (query.trim() === '') {
      updatedFilteredContacts = contacts.filter(contact => lastMessages[contact._id]);
    } else {
      updatedFilteredContacts = contacts.filter(contact =>
        (contact.name && contact.name.toLowerCase().includes(query)) ||
        (contact.phone_number && contact.phone_number.includes(query))
      );
    }
    const sortedContacts = sortContactsByLastMessage(updatedFilteredContacts, lastMessages);
    setFilteredContacts(sortedContacts);
  };

  useEffect(() => {
    if (!selectedContact || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${selectedContact._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data);

        if (response.data.length > 0) {
          const latestMessage = response.data[response.data.length - 1];
          setLastMessages((prev) => {
            const updatedLastMessages = { ...prev, [selectedContact._id]: latestMessage };
            const sortedContacts = sortContactsByLastMessage(filteredContacts, updatedLastMessages);
            setFilteredContacts(sortedContacts);
            return updatedLastMessages;
          });
        }
      } catch (err) {
        setError('Failed to load messages');
        console.error('Fetch messages error:', err);
      }
    };

    fetchMessages();

    const pollInterval = setInterval(fetchMessages, 5000);

    socket.on('receiveMessage', (message) => {
      if (
        (message.senderId === user._id && message.recipientId === selectedContact._id) ||
        (message.senderId === selectedContact._id && message.recipientId === user._id)
      ) {
        setMessages((prev) => {
          const updatedMessages = prev.map(msg => 
            msg._id === message._id ? message : msg
          );
          if (!updatedMessages.some(msg => msg._id === message._id)) {
            updatedMessages.push(message);
          }
          return updatedMessages;
        });
        setLastMessages((prev) => {
          const updatedLastMessages = { ...prev, [selectedContact._id]: message };
          const sortedContacts = sortContactsByLastMessage(filteredContacts, updatedLastMessages);
          setFilteredContacts(sortedContacts);
          return updatedLastMessages;
        });
      }
    });

    return () => {
      clearInterval(pollInterval);
      socket.off('receiveMessage');
    };
  }, [selectedContact, user, contacts, filteredContacts]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !user) return;

    const messageData = {
      senderId: user._id,
      recipientId: selectedContact._id,
      content: newMessage,
    };

    if (socket.connected) {
      socket.emit('sendMessage', messageData);
    } else {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/messages/send`, messageData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages((prev) => {
          if (prev.some(msg => msg._id === response.data._id)) return prev;
          setLastMessages((prevLast) => {
            const updatedLastMessages = { ...prevLast, [selectedContact._id]: response.data };
            const sortedContacts = sortContactsByLastMessage(filteredContacts, updatedLastMessages);
            setFilteredContacts(sortedContacts);
            return updatedLastMessages;
          });
          return [...prev, response.data];
        });
      } catch (err) {
        setError('Failed to send message via HTTP');
        console.error('HTTP send error:', err);
      }
    }
    setNewMessage('');
  };

  const toggleSelecting = () => {
    setIsSelecting(!isSelecting);
    setSelectedMessages([]);
  };

  const handleMessageSelect = (messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleDeleteMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedMessages.map(async (messageId) => {
          const response = await axios.delete(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? response.data.data : msg))
          );
        })
      );
      setSelectedMessages([]);
      setIsSelecting(false);
      setShowConfirm(false);
    } catch (err) {
      setError('Failed to delete messages');
      console.error('Delete messages error:', err);
    }
  };

  const handleBackToSidebar = () => {
    setSelectedContact(null);
    setIsSelecting(false);
    setSelectedMessages([]);
  };

  const isMutualContact = (contact) => {
    return contact.contacts && contact.contacts.includes(user?._id);
  };

  // Determine operator direction based on windowWidth
  const operatorDirection = windowWidth > 768 ? '<' : '>';

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      {window.innerWidth < 768 && !selectedContact && (
        <>
          <Header />
          <Navbar />
        </>
      )}
      {window.innerWidth >= 768 && (
        <>
          <Header />
          <Navbar />
        </>
      )}
      <div className={`${window.innerWidth < 768 && !selectedContact ? 'pt-[70px]' : 'pt-0 md:pt-[70px]'} bg-[#000000] overflow-y-hidden h-[100vh] flex flex-col`}>
        <div className="flex flex-1 flex-col md:flex-row">
          <div 
            className={`w-full md:w-1/3 bg-[#000000] text-[#d1d7db] border-r border-[#080808] ${
              selectedContact ? 'hidden md:block' : 'block'
            }`}
          >
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search users to chat..."
                  className="w-full h-[50px] bg-[#171818] text-[#d1d7db] p-3 rounded-[40px] focus:outline-none placeholder-[#8696a0]"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8696a0]" />
              </div>
            </div>
            <div 
              className="x-scroll overflow-x-hidden overflow-y-auto" 
              style={
                window.innerWidth < 768 
                  ? { height: 'calc(100vh - 130px)', paddingBottom: '80px' }
                  : { maxHeight: 'calc(100vh - 130px)', paddingBottom: '70px' }
              }
            >
              {filteredContacts.length === 0 && searchQuery === '' ? (
                <p className="text-center text-[#8696a0] mt-4">No chats yet. Search to start one.</p>
              ) : filteredContacts.length === 0 ? (
                <p className="text-center text-[#8696a0] mt-4">No users found</p>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact._id}
                    className={`p-4 flex items-center cursor-pointer hover:bg-[#161616] ${
                      selectedContact?._id === contact._id ? 'bg-[#161616]' : ''
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <img
                      src={contact.profiledp || dp}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-medium text-[#d1d7db]">
                        {isMutualContact(contact) ? contact.name : <>+91 {contact.phone_number}</>}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#8696a0] truncate max-w-[150px] md:max-w-[200px]">
                          {lastMessages[contact._id]?.deleted 
                            ? 'Message deleted' 
                            : lastMessages[contact._id]?.content || 'No messages yet'}
                        </p>
                        {lastMessages[contact._id] && !lastMessages[contact._id].deleted && (
                          <p className="text-xs text-[#8696a0] ml-2 whitespace-nowrap">
                            {formatTimestamp(lastMessages[contact._id].createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div 
            className={`w-full md:w-2/3 flex flex-col ${
              selectedContact ? 'block' : 'hidden md:block'
            }`}
          >
            {selectedContact ? (
              <>
                <div className="sticky top-0 w-full md:w-full md:static bg-[#000000] p-[8px] flex items-center border-b border-[#0c0c0c] z-10">
                  <div className="flex items-center">
                    <button 
                      className=" mr-3 text-[#d1d7db]"
                      onClick={handleBackToSidebar}
                    >
                      <FaArrowLeft />
                    </button>
                    <img
                      src={selectedContact.profiledp || dp}
                      alt={selectedContact.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <h2 className="text-[#d1d7db] font-medium">
                      {isMutualContact(selectedContact) ? selectedContact.name : <>+91 {selectedContact.phone_number}</>}
                    </h2>
                  </div>
                  <div className="flex-1"></div>
                  <button
                    onClick={toggleSelecting}
                    className="text-[#d1d7db] hover:text-[#ffffff] p-2"
                  >
                    <FaEllipsisH />
                  </button>
                </div>

                <div 
                  ref={messagesContainerRef}
                  className="x-scroll flex-1 overflow-y-auto bg-[#000000] p-4"
                  style={{
                    ...(operatorDirection === '<' ? (windowWidth < 768 ? {
                      height: 'calc(100vh - 70px)',
                      paddingTop: '60px',
                      paddingBottom: '180px',
                    } : {
                      maxHeight: 'calc(100vh - 70px)',
                      paddingTop: '60px',
                      paddingBottom: '180px'
                    }) : (windowWidth > 768 ? {
                      height: 'calc(100vh - 70px)',
                      paddingTop: '60px',
                      paddingBottom: '180px',
                    } : {
                      maxHeight: 'calc(100vh - 70px)',
                      paddingTop: '60px',
                      paddingBottom: '40px'
                    }))
                  }}
                >
                  {messages.map((msg) => (
                    <div key={msg._id}>
                      {msg.deleted ? (
                        <div className="mb-3 flex justify-center">
                          <p className="text-[#8696a0] italic">
                            Message deleted by {msg.senderId === user?._id ? 'you' : (isMutualContact(selectedContact) ? selectedContact.name : selectedContact.phone_number)}
                          </p>
                        </div>
                      ) : msg.isNotification ? (
                        <div className="mb-3 flex justify-center">
                          <p className="text-[#8696a0] italic">{msg.content}</p>
                        </div>
                      ) : (
                        <div
                          className={`mb-3 flex ${
                            msg.senderId === user?._id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`max-w-[100%] px-3 min-w-[115px] py-1 rounded-lg flex items-center ${
                                msg.senderId === user?._id
                                  ? 'bg-[#27cc6181] text-[#d1d7db]'
                                  : 'bg-[#323333] text-[#d1d7db]'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <div className="flex flex-col items-end ml-2">
                                <p className="text-[10px] text-[#8696a0]">
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            {msg.senderId === user?._id && isSelecting && (
                              <input
                                type="checkbox"
                                checked={selectedMessages.includes(msg._id)}
                                onChange={() => handleMessageSelect(msg._id)}
                                className="ml-2"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isSelecting ? (
                  <div className="fixed bottom-0 md:bottom-[60px] w-full md:w-2/3 bg-[#0a0a0a] p-4 flex justify-end items-center z-10">
                    <button
                      onClick={() => setShowConfirm(true)}
                      className={`bg-[#ff4d4f] p-2 rounded-full text-[#ffffff] hover:bg-[#ff6666] ${
                        selectedMessages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={selectedMessages.length === 0}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={handleSendMessage} 
                    className="fixed bottom-0 md:bottom-[60px] w-full md:w-2/3 bg-[#0a0a0a] p-4 flex items-center z-10"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message"
                      className="flex-1 bg-[#171818] text-[#d1d7db] p-2 rounded-lg mr-2 focus:outline-none placeholder-[#8696a0]"
                    />
                    <button
                      type="submit"
                      className="bg-[#2bfc74de] p-2 rounded-full text-[#0f0f0f] hover:bg-[#2dff76]"
                    >
                      <FaPaperPlane />
                    </button>
                  </form>
                )}

                {showConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-[#1a1a1a] p-6 rounded-lg text-[#d1d7db]">
                      <p className="mb-4">Are you sure you want to delete {selectedMessages.length} message(s)?</p>
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="bg-[#323333] px-4 py-2 rounded hover:bg-[#404040]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteMessages}
                          className="bg-[#ff4d4f] px-4 py-2 rounded hover:bg-[#ff6666]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#d1d7db]">
                <p>Search for a user to start chatting or select an existing chat</p>
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-[#ff4d4f] text-center mt-4">{error}</p>}
      </div>
    </>
  );
};

export default Home;