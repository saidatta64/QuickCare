"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Send, Loader2, User, Bot, Calendar, Users, Phone, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I'm your Doctor Appointment Assistant. I can help you with:

- Book new medical appointments
- Reschedule or cancel appointments
- Find doctors and specialists
- Get guidance on which doctor to see for symptoms
- Information about healthcare services
- Prepare for medical visits

What can I help you with today?`,
  timestamp: new Date(),
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const cleanResponseText = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .trim();
};

export default function AppointmentAssistantChatbot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const quickActions = [
    { icon: Calendar, text: "Book appointment", query: "How do I book a new appointment?" },
    { icon: Phone, text: "Reschedule", query: "How do I reschedule my appointment?" },
    { icon: Users, text: "Find a doctor", query: "How do I find a doctor in my area?" },
    { icon: MapPin, text: "Find specialist", query: "I have symptoms, what specialist should I see?" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    formRef.current?.querySelector('input')?.focus();
  }, []);

  const handleQuickAction = (query: string) => {
    setInput(query);
    setShowQuickActions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setShowQuickActions(false);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from assistant');
      }

      const cleanedResponse = cleanResponseText(data.response || "I'm sorry, I couldn't process your request. Please try again.");

      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: cleanedResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again later.';
      const lowerMsg = error.message?.toLowerCase() ?? '';

      if (lowerMsg.includes('api key') || lowerMsg.includes('authentication')) {
        errorMessage = 'Authentication error. Please check your API configuration.';
      } else if (lowerMsg.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later or contact support.';
      } else if (lowerMsg.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg">
      {/* Clean Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold">Doctor Assistant</h1>
            <p className="text-xs text-blue-100">Healthcare appointments help</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 pb-24">
        {messages.map((message) => (
          <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('flex items-start space-x-2 max-w-[80%]', message.role === 'user' ? 'flex-row-reverse space-x-reverse' : '')}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow-sm'
              )}>
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                'px-4 py-2 rounded-2xl shadow-sm',
                message.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-md' 
                  : 'bg-white text-gray-800 rounded-bl-md border',
                message.isError && 'bg-red-50 border-red-200 text-red-800'
              )}>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className={cn(
                  'text-xs mt-1 opacity-70',
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white border rounded-bl-md shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Only show initially */}
      {showQuickActions && messages.length === 1 && (
        <div className="p-4 border-t bg-white dark:bg-gray-900">
          <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center justify-start space-x-2 p-3 h-auto text-left hover:bg-blue-50 hover:border-blue-200"
                disabled={isLoading}
              >
                <action.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm">{action.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box Floating at Bottom */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 p-3 border-t flex items-center space-x-2"
        style={{ zIndex: 10 }}
      >
        <Input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className={
            (isLoading || !input.trim())
              ? "bg-gray-200 dark:bg-gray-800"
              : "bg-blue-50 dark:bg-blue-900"
          }
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <Send
              className={
                "w-5 h-5 " + ((isLoading || !input.trim())
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-blue-600 dark:text-blue-400")
              }
            />
          )}
        </Button>
      </form>
    </div>
  );
}