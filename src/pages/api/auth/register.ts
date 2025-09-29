 import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseCreateUser, sendEmailVerificationProcedure, supabaseAssignUserRole } from '@/api/authentication';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  try {
    const { email, password, roleId } = req.body;
    if (!email || !password || !roleId) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    const { error, data } = await supabaseCreateUser(email, password);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    await sendEmailVerificationProcedure(data.id);
    const { error: roleError } = await supabaseAssignUserRole(data.id, roleId);
    if (roleError) {
      return res.status(400).json({ error: roleError.message });
    }
    return res.status(201).json({ user: data });
  } catch (err) {
    console.error('Erreur API /api/auth/register :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur', details: err instanceof Error ? err.message : err });
  }
}
