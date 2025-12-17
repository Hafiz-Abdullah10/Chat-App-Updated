import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900">
      {/* Use padding inside a full-height flex container */}
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full w-full sm:w-[85%] sm:h-[95%] grid ${
          selectedUser
            ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
            : 'md:grid-cols-2'
        }`}
      >
        {/* Pass selectedUser and setSelectedUser to children */}
        <Sidebar />

        <ChatContainer  />

        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
