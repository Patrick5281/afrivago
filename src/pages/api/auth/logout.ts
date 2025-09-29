import type { NextApiRequest, NextApiResponse } from 'next';
 
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
  res.status(200).json({ message: 'Déconnecté' });
} 