'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SupportThread } from '@/lib/types';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function SupportPage() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const data = await api.get<SupportThread[]>('/admin/support/threads');
        setThreads(data);
      } catch (error) {
        console.error('Failed to fetch threads:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  }, []);

  const sendMessage = async () => {
    if (!selectedThread || !message.trim()) return;
    
    try {
      await api.post(`/admin/support/threads/${selectedThread.id}/messages`, { text: message });
      setMessage('');
      // Refresh thread
      const updated = await api.get<SupportThread>(`/admin/support/threads/${selectedThread.id}`);
      setSelectedThread(updated);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="BRANCH_DIRECTOR">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Support</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <Card className="lg:col-span-1 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Support Threads</h3>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full p-4 text-left border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-accent-blue/10 dark:bg-accent-blue/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{thread.user.name || thread.user.email}</span>
                    {thread.isOpen ? (
                      <span className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-xs rounded-full">Open</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Closed</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {thread.messages[thread.messages.length - 1]?.text || 'No messages'}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2 flex flex-col">
            {selectedThread ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedThread.user.name || selectedThread.user.email}
                    </h3>
                    <p className="text-sm text-gray-500">Thread #{selectedThread.id.slice(0, 8)}</p>
                  </div>
                  {selectedThread.isOpen && (
                    <Button variant="secondary" size="sm">
                      <CheckCircle size={16} className="mr-2" />
                      Close Thread
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedThread.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          msg.isFromUser
                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                            : 'bg-accent-blue text-white'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.isFromUser ? 'text-gray-500' : 'text-blue-200'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedThread.isOpen && (
                  <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage}>
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Select a thread to view messages</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
