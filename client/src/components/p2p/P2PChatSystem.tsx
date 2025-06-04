
import React, { useState, useEffect, useRef } from 'react';
import { UserService } from '@/lib/user-service';
import p2pService from '@/lib/p2p-service';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, Send, User } from "lucide-react";
import { toast } from "sonner";
import { collection, onSnapshot, query, where, orderBy, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  senderName?: string;
  isCurrentUser?: boolean;
}

interface P2PChatSystemProps {
  orderId: string | null;
  counterpartyName: string;
  orderStatus?: string;
  onChatRefreshToggle?: (enabled: boolean) => void;
}

const P2PChatSystem: React.FC<P2PChatSystemProps> = ({ 
  orderId, 
  counterpartyName, 
  orderStatus,
  onChatRefreshToggle
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatAutoRefresh, setChatAutoRefresh] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const currentUser = UserService.getCurrentUserId();
  const p2pService = new P2PService();

  useEffect(() => {
    if (!orderId || !chatAutoRefresh) return;
    
    setLoadingMessages(true);
    
    // Set up real-time listener for messages
    const chatMessagesRef = collection(db, 'p2p_chat_messages');
    const q = query(
      chatMessagesRef,
      where("orderId", "==", orderId),
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messages: ChatMessage[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const sender = data.sender;
        let senderName = sender === currentUser ? 'You' : counterpartyName;
        
        // If we don't have a name for the sender, try to get it
        if (senderName === '' && sender) {
          try {
            const userData = await UserService.getUserData(sender);
            senderName = userData?.fullName || 'Unknown User';
          } catch (error) {
            console.error('Error fetching sender name:', error);
            senderName = 'Unknown User';
          }
        }
        
        messages.push({
          id: doc.id,
          sender: data.sender,
          text: data.text,
          timestamp: new Date(data.timestamp),
          senderName,
          isCurrentUser: sender === currentUser
        });
      }
      
      setChatMessages(messages);
      setLoadingMessages(false);
      
      // Scroll to bottom on new message
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Error getting chat messages:", error);
      setLoadingMessages(false);
      toast.error("Failed to load chat messages");
    });
    
    return () => unsubscribe();
  }, [orderId, chatAutoRefresh, currentUser, counterpartyName]);

  // Toggle auto-refresh
  useEffect(() => {
    if (onChatRefreshToggle) {
      onChatRefreshToggle(chatAutoRefresh);
    }
  }, [chatAutoRefresh, onChatRefreshToggle]);

  // Always scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !orderId || !currentUser) return;
    
    setSendingMessage(true);
    try {
      // Send message via p2pService
      await p2pService.addChatMessage(orderId, currentUser, chatMessage);
      
      // Clear the input
      setChatMessage('');
      
      // Play a sound for sent message
      const audio = new Audio('/sounds/alert.mp3');
      audio.volume = 0.2;
      audio.play().catch(e => console.log('Error playing sound:', e));
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [date: string]: ChatMessage[] } = {};
    
    messages.forEach(msg => {
      const dateStr = msg.timestamp.toLocaleDateString();
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(msg);
    });
    
    return groups;
  };

  const renderDateSeparator = (dateStr: string) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    let displayDate = dateStr;
    if (dateStr === today) {
      displayDate = 'Today';
    } else if (dateStr === yesterday) {
      displayDate = 'Yesterday';
    }
    
    return (
      <div className="flex items-center justify-center my-3">
        <div className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
          {displayDate}
        </div>
      </div>
    );
  };

  const messageGroups = groupMessagesByDate(chatMessages);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollAreaRef}>
        <div className="space-y-2 p-2">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              <span className="ml-2 text-white/70">Loading messages...</span>
            </div>
          ) : chatMessages.length > 0 ? (
            <>
              {Object.keys(messageGroups).map(dateStr => (
                <React.Fragment key={dateStr}>
                  {renderDateSeparator(dateStr)}
                  {messageGroups[dateStr].map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div className={`flex ${message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                        <Avatar className={`h-8 w-8 ${message.isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg px-3 py-2 ${
                          message.isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card text-card-foreground'
                        }`}>
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {message.senderName}
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                          <div className="text-xs opacity-70 mt-1 text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
              <div ref={messageEndRef} />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-auto">
        <div className="flex gap-2">
          <Input 
            placeholder="Type your message..." 
            className="flex-1 bg-background/40 border-white/10 text-white placeholder:text-white/50"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !sendingMessage && sendChatMessage()}
            disabled={sendingMessage || !orderId}
          />
          <Button 
            onClick={sendChatMessage}
            className="bg-[#F2FF44] text-black hover:bg-[#E2EF34]"
            disabled={sendingMessage || !orderId || !chatMessage.trim()}
          >
            {sendingMessage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : <Send className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Dispute button */}
        {orderId && ['awaiting_release', 'pending'].includes(orderStatus || '') && (
          <Button 
            variant="outline" 
            className="w-full mt-2 bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-300"
            onClick={() => {
              toast.warning("Dispute option will be available soon", {
                description: "Our team is working on implementing the dispute resolution process."
              });
            }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Open Dispute
          </Button>
        )}
        
        {/* Auto-refresh toggle */}
        <div className="flex items-center justify-end space-x-2 text-xs text-white/60 mt-2 mb-1">
          <span>Auto-refresh</span>
          <Switch
            checked={chatAutoRefresh}
            onCheckedChange={(checked) => {
              setChatAutoRefresh(checked);
              if (onChatRefreshToggle) onChatRefreshToggle(checked);
            }}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

export default P2PChatSystem;
