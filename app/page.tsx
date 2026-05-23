import { db } from '@/db';
import { posts, users } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import DeleteButton from '@/app/components/DeletePostButton';
import { Suspense } from 'react';
import Loading from './loading';

export const revalidate = 60; // ISR 60s

async function PostList() {
  const allPosts = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        email: users.email
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.ownerId, users.id))
    .orderBy(desc(posts.date));
    
  const currentUser = await getUser();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {allPosts.map(({ post, author }) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                <Link href={`/posts/${post.id}`} className="hover:text-indigo-600">
                  {post.title}
                </Link>
              </h2>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              By {author?.email} on {new Date(post.date as Date).toLocaleDateString()}
            </div>
            <p className="text-gray-600 line-clamp-3 mb-4">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <Link href={`/posts/${post.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Read more &rarr;
            </Link>
            {currentUser?.id === post.ownerId && (
              <DeleteButton id={post.id} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Latest Posts</h1>
      </div>
      <Suspense fallback={<Loading />}>
        <PostList />
      </Suspense>
    </div>
  );
}