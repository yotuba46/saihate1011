"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoutButton } from '@/components/logout-button';
import { auth, database, setUserRoom, getUserRoom } from '@/lib/firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';

interface Room {
  id: string;
  name: string;
  playerCount: number;
  players: { [key: string]: string };
}

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

export default function Lobby() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    const checkUserRoom = async () => {
      const currentRoomId = await getUserRoom(auth.currentUser!.uid);
      if (currentRoomId) {
        router.push(`/room/${currentRoomId}`);
      }
    };

    checkUserRoom();

    const roomsRef = ref(database, 'rooms');
    const unsubscribeRooms = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList = Object.entries(data).map(([id, room]: [string, any]) => ({
          id,
          name: room.name,
          playerCount: Object.keys(room.players || {}).length,
          players: room.players || {},
        }));
        setRooms(roomList);
      } else {
        setRooms([]);
      }
    });

    const messagesRef = ref(database, 'lobby-messages');
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
      unsubscribeRooms();
      unsubscribeMessages();
    };
  }, [router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCreateRoom = async () => {
    if (auth.currentUser && newRoomName.trim()) {
      const roomsRef = ref(database, 'rooms');
      const newRoomRef = push(roomsRef);
      const newRoom = {
        name: newRoomName.trim(),
        players: {
          [auth.currentUser.uid]: auth.currentUser.displayName || 'Anonymous'
        }
      };
      await set(newRoomRef, newRoom);
      await setUserRoom(auth.currentUser.uid, newRoomRef.key);
      router.push(`/room/${newRoomRef.key}`);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (auth.currentUser) {
      try {
        const roomRef = ref(database, `rooms/${roomId}/players/${auth.currentUser.uid}`);
        await set(roomRef, auth.currentUser.displayName || 'Anonymous');
        await setUserRoom(auth.currentUser.uid, roomId);
        router.push(`/room/${roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (auth.currentUser && newMessage.trim()) {
      const messagesRef = ref(database, 'lobby-messages');
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
      <h1 className="text-2xl font-bold mb-4">ロビー</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="新しい部屋名"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <Button onClick={handleCreateRoom}>部屋を作成</Button>
        </div>
        <LogoutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">部屋一覧</h2>
          <div className="grid grid-cols-1 gap-4">
            {rooms.map((room) => (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>プレイヤー数: {room.playerCount}</p>
                  <Button onClick={() => handleJoinRoom(room.id)}>参加</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">全体チャット</h2>
          <Card>
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
      </div>
    </div>
  );
}