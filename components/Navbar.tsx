import Link from 'next/link';
import { getUser } from '../lib/auth-util';

export default async function Navbar() {
  const user = await getUser();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                NextBlog
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Hi, {user.email}</span>
                <Link href="/posts/new" className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  New Post
                </Link>
                <Link href="/logout" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}