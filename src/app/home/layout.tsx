import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: LayoutProps) {
  return (
    <div>
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}
