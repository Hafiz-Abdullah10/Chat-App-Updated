import React, { useEffect, useRef, useState, useContext } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utlis';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const ChatContainer = () => {
  const { messages, sendMessages, getMessages, selectedUser, setSelectedUser } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState('');

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    await sendMessages({ text: input.trim() });
    setInput('');
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessages({ image: reader.result });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-400 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} className="w-16" alt="" />
        <p className="text-lg text-white font-medium">Chat Anytime, Anywhere</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 shrink-0">
        <img src={selectedUser.profilePic || assets.avatar_icon} className="w-8 rounded-full" alt="" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          className="md:hidden w-6 cursor-pointer"
          alt=""
        />
        <img src={assets.help_icon} className="hidden md:block w-5" alt="" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages?.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
          >
            {msg.senderId !== authUser._id && (
              <img src={selectedUser.profilePic || assets.avatar_icon} className="w-7 rounded-full" alt="" />
            )}
            {msg.image ? (
              <img src={msg.image} className="max-w-[230px] rounded-lg border border-gray-700" alt="" />
            ) : (
              <p
                className={`p-2 max-w-[200px] text-sm rounded-lg wrap-break-word text-white ${
                  msg.senderId === authUser._id ? 'bg-violet-500/30 rounded-bl-none' : 'bg-gray-700/40 rounded-br-none'
                }`}
              >
                {msg.text}
              </p>
            )}
            {msg.senderId === authUser._id && (
              <img src={authUser.profilePic || assets.avatar_icon} className="w-7 rounded-full" alt="" />
            )}
            <p className="text-gray-400 text-xs mt-1">{formatMessageTime(msg.createdAt)}</p>
          </div>
        ))}
        <div ref={scrollEnd} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 flex items-center gap-3 p-3 bg-black/40">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
            placeholder="Send a message"
            className="flex-1 p-3 text-sm bg-transparent outline-none text-white placeholder-gray-400"
          />
          <input type="file" id="image" hidden accept="image/png, image/jpeg" onChange={handleSendImage} />
          <label htmlFor="image">
            <img src={assets.gallery_icon} className="w-5 mr-2 cursor-pointer" alt="" />
          </label>
        </div>
        <img src={assets.send_button} onClick={handleSendMessage} className="w-7 cursor-pointer" alt="" />
      </div>
    </div>
  );
};

export default ChatContainer;
