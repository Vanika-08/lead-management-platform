/**
 * Idempotent demo seed: 1 ADMIN, 1 MEMBER, and a spread of sample leads
 * across statuses/tags/sources with realistic assignment, notes and activity.
 *
 * Run with: npm run seed
 * Loads env from .env(.local) via tsx --env-file, or export vars manually.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { Lead } from '@/models/Lead';
import { Note } from '@/models/Note';
import { ActivityLog } from '@/models/ActivityLog';
import type { LeadStatus, LeadTag, LeadSource } from '@/types';

async function hash(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

async function main(): Promise<void> {
  await connectToDatabase();
  console.warn('Connected. Clearing existing collections...');

  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Note.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Ava Admin',
    email: (process.env.SEED_ADMIN_EMAIL ?? 'admin@digitalheroes.test').toLowerCase(),
    passwordHash: await hash(process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345'),
    role: 'ADMIN',
  });

  const member = await User.create({
    name: 'Max Member',
    email: (process.env.SEED_MEMBER_EMAIL ?? 'member@digitalheroes.test').toLowerCase(),
    passwordHash: await hash(process.env.SEED_MEMBER_PASSWORD ?? 'Member@12345'),
    role: 'MEMBER',
  });

  type Seed = {
    name: string;
    email: string;
    company: string;
    phone: string;
    status: LeadStatus;
    tag: LeadTag | null;
    source: LeadSource;
    assigned: boolean;
    fromWebsite: boolean;
  };

  const seeds: Seed[] = [
    { name: 'Priya Nair', email: 'priya@acme.io', company: 'Acme', phone: '+1 415 555 0100', status: 'New', tag: 'Hot', source: 'Website', assigned: false, fromWebsite: true },
    { name: 'John Doe', email: 'john@globex.com', company: 'Globex', phone: '+1 212 555 0142', status: 'Contacted', tag: 'Warm', source: 'Website', assigned: true, fromWebsite: true },
    { name: 'Lena Ortiz', email: 'lena@initech.co', company: 'Initech', phone: '+44 20 7946 0958', status: 'Qualified', tag: 'Hot', source: 'Referral', assigned: true, fromWebsite: false },
    { name: 'Sam Cole', email: 'sam@umbrella.dev', company: 'Umbrella', phone: '+1 650 555 0198', status: 'Proposal Sent', tag: 'Warm', source: 'Manual', assigned: true, fromWebsite: false },
    { name: 'Rita Kapoor', email: 'rita@hooli.com', company: 'Hooli', phone: '+91 80 4123 5566', status: 'Won', tag: 'Hot', source: 'Referral', assigned: true, fromWebsite: false },
    { name: 'Tom Blake', email: 'tom@piedpiper.com', company: 'Pied Piper', phone: '+1 408 555 0170', status: 'Lost', tag: 'Cold', source: 'Import', assigned: false, fromWebsite: false },
    { name: 'Nadia Rahman', email: 'nadia@stark.io', company: 'Stark', phone: '+971 4 555 0123', status: 'New', tag: 'Cold', source: 'Website', assigned: false, fromWebsite: true },
    { name: 'Ivan Petrov', email: 'ivan@wayne.co', company: 'Wayne', phone: '+1 312 555 0155', status: 'Contacted', tag: 'Warm', source: 'Manual', assigned: true, fromWebsite: false },
  ];

  for (const s of seeds) {
    const lead = await Lead.create({
      name: s.name,
      email: s.email,
      company: s.company,
      phone: s.phone,
      message: 'Interested in a demo.',
      status: s.status,
      tag: s.tag,
      source: s.source,
      assignedTo: s.assigned ? member._id : null,
      createdBy: s.fromWebsite ? null : admin._id,
      updatedBy: s.status === 'New' ? null : admin._id,
    });

    await ActivityLog.create({
      leadId: lead._id,
      actorId: s.fromWebsite ? null : admin._id,
      type: 'LEAD_CREATED',
    });

    if (s.status !== 'New') {
      await ActivityLog.create({
        leadId: lead._id,
        actorId: admin._id,
        type: 'STATUS_CHANGED',
        from: 'New',
        to: s.status,
      });
    }

    if (s.assigned) {
      await Note.create({
        leadId: lead._id,
        authorId: member._id,
        body: `Reached out to ${s.name}. Awaiting reply.`,
      });
      await ActivityLog.create({ leadId: lead._id, actorId: member._id, type: 'NOTE_ADDED' });
    }
  }

  console.warn(
    `Seed complete: ${await User.countDocuments()} users, ${await Lead.countDocuments()} leads.`,
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
