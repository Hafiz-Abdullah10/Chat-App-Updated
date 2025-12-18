import React, { useEffect, useState, useContext } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Sidebar = () => {

  const { getUsers, users , selectedUser, setSelectedUser,
    unseenMessages, setUnseenMessages  }= useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState('');

  const navigate = useNavigate();

    const filteredUsers = input ? users.filter((user) =>user.fullName.toLowerCase().includes(input.toLowerCase()))
    : users;

useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div className="bg-[#8185B2]/10 flex flex-col h-full p-5 rounded-r-xl text-white overflow-y-auto">
      
      {/* Header + Profile/Logout */}
      <div className="pb-5 shrink-0">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 hidden group-hover:block">
              <p onClick={() => navigate('/profile')} className="cursor-pointer text-sm">Edit profile</p>
              <hr className="my-2 border-gray-500" />
              <p onClick={logout} className="cursor-pointer text-sm">Logout</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-2 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)} value={input} type="text"
            className="bg-transparent outline-none text-white text-xs flex-1"
            placeholder="Search User"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No users found</p>
        )}

        {filteredUsers.map((user, index) => (
          <div
            key={index}
            onClick={() => setSelectedUser(user)}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer
              ${selectedUser?._id === user._id && 'bg-[#282142]/50' }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              className="w-[35px] rounded-full aspect-square"
            />
            <div>
              <p>{user.fullName}</p>
              <span className={`text-xs ${
                onlineUsers.includes(user._id)
                  ? 'text-green-400'
                  : 'text-neutral-400'
              }`}>
                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
              </span>
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 h-5 w-5 flex items-center justify-center rounded-full bg-violet-500/50 text-xs">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
