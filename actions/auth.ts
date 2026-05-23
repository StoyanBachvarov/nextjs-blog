'use server';

import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '../lib/auth-util';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ActionState } from '../app/components/AuthForm';

export async function registerAction(state: ActionState, formData: FormData): Promise<ActionState> {
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
    cookieStore.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Error occurred' };
  }

  redirect('/');
}

export async function loginAction(state: ActionState, formData: FormData): Promise<ActionState> {
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
    cookieStore.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Error occurred' };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/');
}