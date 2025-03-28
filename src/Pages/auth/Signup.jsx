import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { LuMessageCircleHeart } from "react-icons/lu";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(''); // Clear previous errors
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        name,
        email,
        phone_number: phoneNumber,
        password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-black min-h-[100vh] flex items-center justify-center px-4">
      <form 
        onSubmit={handleSubmit}
        className="bg-[black] flex flex-col p-8 rounded-xl w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <LuMessageCircleHeart className="bg-[#1DB954] p-1 rounded-[15px] text-[#121212] h-[60px] w-[60px] object-contain" />
        </div>
        <h2 className="text-3xl font-bold text-[#1DB954] mb-8 text-center tracking-tight">
          Sign Up for GigaChat
        </h2>

        {/* Name Input */}
        <div className="mb-5">
          <label 
            className="block text-[#1DB954] mb-2 font-medium" 
            htmlFor="name"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 rounded-lg bg-[#1a1a1a3a] text-white border border-[#2E2E2E] focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all duration-300"
            required
            disabled={isLoading} // Disable input during loading
          />
        </div>

        {/* Email Input */}
        <div className="mb-5">
          <label 
            className="block text-[#1DB954] mb-2 font-medium" 
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 rounded-lg bg-[#1a1a1a3a] text-white border border-[#2E2E2E] focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>

        {/* Phone Number Input */}
        <div className="mb-5">
          <label 
            className="block text-[#1DB954] mb-2 font-medium" 
            htmlFor="phoneNumber"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full p-3 rounded-lg bg-[#1a1a1a3a] text-white border border-[#2E2E2E] focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6 relative">
          <label 
            className="block text-[#1DB954] mb-2 font-medium" 
            htmlFor="password"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full p-3 rounded-lg bg-[#1a1a1a3a] text-white border border-[#2E2E2E] focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all duration-300"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-[58%] transform -translate-y-1/2 text-[#1DB954] hover:text-[#1ed760] transition-colors duration-200"
            disabled={isLoading}
          >
            {showPassword ? <AiOutlineEye className='relative top-2' size={22} /> : <AiOutlineEyeInvisible className='relative top-2' size={22} />}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-[#ff4444] text-sm mb-5 text-center font-medium bg-[#2E2E2E]/50 p-2 rounded">
            {error}
          </p>
        )}

        {/* Signup Button with Loader */}
        <button
          type="submit"
          className={`bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full hover:bg-[#1ed760] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-500/30 mb-6 flex items-center justify-center ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h-8z"
                />
              </svg>
              Signing Up...
            </span>
          ) : (
            'Sign Up'
          )}
        </button>

        {/* Login Link */}
        <p className="text-gray-400 text-center text-sm">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-[#1DB954] hover:text-[#1ed760] font-semibold transition-colors duration-300"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;