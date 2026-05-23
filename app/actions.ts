'use server';

import { db } from '../db';
import { users, posts } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken, getUser, COOKIE_NAME, MAX_AGE } from '../lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ActionState } from './components/AuthForm';
import { revalidatePath } from 'next/cache';

export async function register(state: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Missing fields' };

  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) return { error: 'User exists' };

    const hash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({ email, passwordHash: hash }).returning();

    const token = await signToken({ id: newUser.id, email: newUser.email });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Error occurred' };
  }

  redirect('/');
}

export async function login(state: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) return { error: 'Missing fields' };
  
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return { error: 'Invalid credentials' };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { error: 'Invalid credentials' };

    const token = await signToken({ id: user.id, email: user.email });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Error occurred' };
  }

  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/');
}

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