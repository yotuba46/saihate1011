import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-8">最果ての迷宮</h1>
      <div className="space-y-4">
        <Link href="/login">
          <Button className="w-full">ログイン</Button>
        </Link>
        <Link href="/register">
          <Button className="w-full" variant="outline">新規登録</Button>
        </Link>
      </div>
    </div>
  );
}