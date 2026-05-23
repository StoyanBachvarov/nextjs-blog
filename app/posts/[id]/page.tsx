import { db } from '../../../db';
import { posts, users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import DeleteButton from '../../../components/DeleteButton';
import { getUser } from '../../../lib/auth-util';
import { Suspense } from 'react';
import Loading from '../../loading';
import Link from 'next/link';

export const revalidate = 60; // ISR 60s

async function PostDetail({ id }: { id: number }) {
  const [data] = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        email: users.email
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.ownerId, users.id))
    .where(eq(posts.id, id));

  if (!data) notFound();
  
  const { post, author } = data;
  const currentUser = await getUser();

  return (
    <article className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Back to posts
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
             <h1 className="text-3xl font-extrabold text-gray-900">{post.title}</h1>
             {currentUser?.id === post.ownerId && (
               <DeleteButton id={post.id} />
             )}
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <span className="font-medium mr-2">{author?.email}</span>
            <span>&bull;</span>
            <time dateTime={new Date(post.date as Date).toISOString()} className="ml-2">
              {new Date(post.date as Date).toLocaleDateString()}
            </time>
          </div>

          <div className="prose max-w-none text-gray-700">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function PostPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const id = parseInt(params.id);
  
  if (isNaN(id)) notFound();

  return (
    <Suspense fallback={<Loading />}>
      <PostDetail id={id} />
    </Suspense>
  );
}