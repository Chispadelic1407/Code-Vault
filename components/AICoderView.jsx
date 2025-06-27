import React, { memo, useCallback } from 'react';
import { Bot, Send, Loader2, User as UserIcon } from 'lucide-react';

const AICoderView = memo(({ 
  files,
  aiFileId,
  chatMessages,
  chatInput,
  isAIGenerating,
  onFileSelect,
  onChatInputChange,
  onSendMessage
}) => {
  const handleSendMessage = useCallback(() => {
    if (chatInput.trim() && aiFileId && !isAIGenerating) {
      onSendMessage();
    }
  }, [chatInput, aiFileId, isAIGenerating, onSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
        <Bot size={24} className="text-indigo-400" /> AI Assistant
      </h2>

      {/* File selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select a file to analyze:
        </label>
        <select
          value={aiFileId}
          onChange={(e) => onFileSelect(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="">Choose a file...</option>
          {files.map(file => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chat area */}
      <div className="flex-grow overflow-y-auto mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot size={48} className="mb-4 opacity-50" />
            <p className="text-center">
              Select a file and ask me anything about your code!
            </p>
            <p className="text-sm text-center mt-2 opacity-75">
              I can help with debugging, optimization, explanations, and more.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isAIGenerating && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-700 p-3 rounded-lg flex-grow">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Loader2 className="animate-spin" size={16} />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <textarea
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={aiFileId ? "Ask me about your code..." : "Please select a file first"}
          className="flex-grow p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
          rows="3"
          disabled={!aiFileId}
        />
        <button
          onClick={handleSendMessage}
          disabled={isAIGenerating || !chatInput.trim() || !aiFileId}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isAIGenerating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
});

const ChatMessage = memo(({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-cyan-600' : 'bg-indigo-600'
      }`}>
        {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`p-3 rounded-lg max-w-[80%] ${
        isUser 
          ? 'bg-cyan-600 text-white' 
          : 'bg-gray-700 text-gray-200'
      }`}>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div className={`text-xs mt-2 opacity-75 ${
          isUser ? 'text-cyan-100' : 'text-gray-400'
        }`}>
          {isUser ? 'You' : 'AI Assistant'}
        </div>
      </div>
    </div>
  );
});

AICoderView.displayName = 'AICoderView';
ChatMessage.displayName = 'ChatMessage';

export default AICoderView;
