import { config } from 'dotenv';
config({ path: '.env' });

import { db } from './index';
import { users, posts } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');
  
  // Hash passwords
  const passwordHash1 = await bcrypt.hash('pass123', 10);
  const passwordHash2 = await bcrypt.hash('pass123', 10);

  // Insert users
  const insertedUsers = await db.insert(users).values([
    { email: 'steve@gmail.com', passwordHash: passwordHash1 },
    { email: 'maria@gmail.com', passwordHash: passwordHash2 }
  ]).returning({ id: users.id, email: users.email });

  console.log('Inserted users:', insertedUsers);

  const steveId = insertedUsers.find((u) => u.email === 'steve@gmail.com')?.id;
  const mariaId = insertedUsers.find((u) => u.email === 'maria@gmail.com')?.id;

  if (!steveId || !mariaId) {
    throw new Error('Failed to insert users');
  }

  // Insert posts
  const postData = [
    // Steve's posts (5)
    { title: 'The Future of AI', content: 'AI is evolving rapidly...', tags: ['AI', 'Tech'], ownerId: steveId },
    { title: 'Web Dev in 2026', content: 'Next.js has come a long way...', tags: ['Next.js', 'React'], ownerId: steveId },
    { title: 'Vibe Coding', content: 'Letting AI write boilerplate is great.', tags: ['Productivity'], ownerId: steveId },
    { title: 'Drizzle ORM Rocks', content: 'Type-safe SQL makes developers happy.', tags: ['Database', 'Postgres'], ownerId: steveId },
    { title: 'Serverless Databases', content: 'Neon is a game changer for serverless apps.', tags: ['Serverless', 'Neon'], ownerId: steveId },

    // Maria's posts (6)
    { title: 'Design Patterns', content: 'Applying MVC in modern web apps.', tags: ['Architecture'], ownerId: mariaId },
    { title: 'GraphQL vs REST', content: 'Which API style should you choose?', tags: ['API'], ownerId: mariaId },
    { title: 'Deploying on Vercel', content: 'Deployments in one click.', tags: ['DevOps', 'Vercel'], ownerId: mariaId },
    { title: 'React Server Components', content: 'RSC changes how we think about rendering...', tags: ['React', 'RSC'], ownerId: mariaId },
    { title: 'PostgreSQL Tips', content: 'Indexes and JSONB columns.', tags: ['Postgres', 'DB'], ownerId: mariaId },
    { title: 'Remote Work Life', content: 'How to stay productive from home.', tags: ['Lifestyle', 'Productivity'], ownerId: mariaId },
  ];

  await db.insert(posts).values(postData);
  
  console.log('Successfully seeded posts!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});