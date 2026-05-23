'use server';

import { db } from '../db';
import { posts } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '../lib/auth-util';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPostAction(formData: FormData) {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsStr = formData.get('tags') as string;
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

  if (!title || !content) throw new Error('Missing fields');

  await db.insert(posts).values({
    title,
    content,
    tags,
    ownerId: user.id as number
  });

  revalidatePath('/');
  revalidatePath('/posts');
  redirect('/');
}

export async function deletePostAction(id: number) {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');

  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) throw new Error('Post not found');
  if (post.ownerId !== user.id) throw new Error('Unauthorized');

  await db.delete(posts).where(eq(posts.id, id));

  revalidatePath('/');
  revalidatePath('/posts');
  redirect('/');
}