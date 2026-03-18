'use client';

import { usePathname } from 'next/navigation';
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      <HeaderWrapper />
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
