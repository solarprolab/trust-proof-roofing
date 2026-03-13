'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  function logout() {
    document.cookie = 'admin_auth=; max-age=0; path=/';
    router.push('/admin');
  }

  return (
    <button
      onClick={logout}
      className="text-blue-300 hover:text-white text-sm transition-colors"
    >
      Logout
    </button>
  );
}
