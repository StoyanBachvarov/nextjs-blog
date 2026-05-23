'use server';

import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '../lib/auth-util';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) throw new Error('Missing fields');

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) throw new Error('User exists');

  const hash = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({ email, passwordHash: hash }).returning();

  const token = await signToken({ id: newUser.id, email: newUser.email });
  const cookieStore = await cookies();
  cookieStore.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  redirect('/');
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) throw new Error('Missing fields');
  
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = await signToken({ id: user.id, email: user.email });
  const cookieStore = await cookies();
  cookieStore.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/');
}