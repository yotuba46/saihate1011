"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { auth, database, setUserRoom } from '@/lib/firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

export default function Room({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [players, setPlayers] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    const roomRef = ref(database, `rooms/${params.id}`);
    const messagesRef = ref(database, `rooms/${params.id}/messages`);

    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(data.players || {});
      } else {
        // 部屋が存在しない場合、ロビーに戻る
        router.push('/lobby');
      }
    });

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, message]: [string, any]) => ({
          id,
          ...message,
        }));
        setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    });

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [router, params.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLeaveRoom = async () => {
    if (auth.currentUser) {
      try {
        const playerRef = ref(database, `rooms/${params.id}/players/${auth.currentUser.uid}`);
        await remove(playerRef);
        
        // ユーザーの現在の部屋情報をクリア
        await setUserRoom(auth.currentUser.uid, null);
        
        router.push('/lobby');
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (auth.currentUser && newMessage.trim()) {
      const messagesRef = ref(database, `rooms/${params.id}/messages`);
      const newMessageRef = push(messagesRef);
      const message = {
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        content: newMessage.trim(),
        timestamp: Date.now(),
      };
      await set(newMessageRef, message);
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">部屋: {params.id}</h1>
      <Button onClick={handleLeaveRoom} className="mb-4">部屋を退出</Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>チャット</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] mb-4" ref={scrollRef}>
                {messages.map((message) => (
                  <div key={message.id} className="mb-2">
                    <span className="font-semibold">{message.username}: </span>
                    <span>{message.content}</span>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="メッセージを入力"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>送信</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>プレイヤー一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(players).map(([id, name]) => (
                  <li key={id}>{name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}