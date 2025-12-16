import { Button } from './ui/button';
import { cookies } from 'next/headers';
import { handleLogout } from '@/app/actions';

export async function Navbar() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  const refreshToken = cookieStore.get('refreshToken');
  const isLoggedIn = !!(accessToken || refreshToken);

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 flex bg-[#E57373] items-center justify-between px-6 py-4 transition-all duration-300 ease-in-out border-1 border-b border-black"
    >
      <div className="flex items-center gap-8">
        <a href="/" className="flex items-center gap-1 group">
          <span className="font-extrabold text-xl tracking-tight text-white">MyPath</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white mb-1 ml-0.5 animate-pulse"></span>
        </a>
        <div className="hidden md:flex items-center text-sm font-medium text-white/90">
          <Button variant={"link"} className="text-white underline-none">Product</Button>
          <Button variant={"link"} className="text-white underline-none">Pricing</Button>
          <Button variant={"link"} className="text-white underline-none">Community</Button>
          <Button variant={"link"} className="text-white underline-none">Blog</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <form action={handleLogout}>
            <Button type="submit" variant="default">
              Log Out
            </Button>
          </form>
        ) : (
          <>
            <Button variant={"link"} className="text-white underline-none">
              <a href="/login">Log In</a>
            </Button>
            <Button>
              <a href="/signup">Sign Up</a>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}