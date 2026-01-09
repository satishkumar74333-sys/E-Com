import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai"; // Icon for the "X" button
import { useNavigate } from "react-router-dom";

const LoginPrompt = ({ show, setShow }) => {
  const navigator = useNavigate();
  if (!show) return null; // If hidden, don't render the component

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
      {/* Background Overlay */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center p-8 rounded-lg shadow-xl w-[90%] max-w-md transform transition-all duration-500 ease-out scale-95 hover:scale-100">
        <button
          className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2 hover:bg-red-600 transition duration-300"
          onClick={() => setShow(false)} // Hide the component on click
          aria-label="Close"
        >
          <AiOutlineClose size={20} />
        </button>
        <p className="font-semibold text-xl leading-relaxed tracking-wide">
          Please log in to enjoy more features and personalized content!
        </p>
        <div className="mt-4">
          <button
            onClick={() => (setShow(false), navigator("/Login"))} // Close the prompt
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition duration-300"
          >
            Go Login
          </button>
        </div>
      </div>

      {/* Ensure no background interaction */}
      <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
    </div>
  );
};

export default LoginPrompt;
