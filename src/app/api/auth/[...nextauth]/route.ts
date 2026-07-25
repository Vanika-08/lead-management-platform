import { handlers } from '@/auth';

// Exposes /api/auth/* (session, signin, signout, callback) per Auth.js.
export const { GET, POST } = handlers;
