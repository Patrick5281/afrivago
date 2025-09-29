// src/api/authentication.tsx
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from "@/lib/db";
import { getSupabaseErrorMessage } from "@/utils/getSupabaseErrorMessage";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Remplace supabaseCreateUser
export const supabaseCreateUser = async (email: string, password: string) => {
  try {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return {
        error: {
          code: 'user-already-exists',
          message: 'Un utilisateur avec cet email existe déjà',
        },
      };
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users (email, password, created_at, email_verified) 
       VALUES ($1, $2, NOW(), false) 
       RETURNING id, email, created_at, email_verified`,
      [email, hashedPassword]
    );

    const user = result.rows[0];
    return { data: user };
    
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    const errorMessage = getSupabaseErrorMessage("createUserWithEmailAndPassword", error.code);
    return {
      error: {
        code: error.code || 'create-user-failed',
        message: errorMessage || error.message,
      },
    };
  }
};

// Remplace supabaseSignInUser
export const supabaseSignInUser = async (email: string, password: string) => {
  try {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    // Récupérer l'utilisateur avec tous les champs nécessaires
    const result = await pool.query(
      `SELECT id, email, password, email_verified, creation_date, uid, name, surname, onboardingiscompleted, photourl
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return {
        error: {
          code: 'user-not-found',
          message: 'Aucun utilisateur trouvé avec cet email',
        },
      };
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        error: {
          code: 'invalid-password',
          message: 'Mot de passe incorrect',
        },
      };
    }

    // Construction de l'objet userDocument
    const userDocument = {
      uid: user.uid,
      email: user.email,
      creation_date: user.creation_date,
      onboardingiscompleted: user.onboardingiscompleted,
      name: user.name,
      surname: user.surname,
      photourl: user.photourl,
    };
    // Construction de l'objet utilisateur à retourner
    const userToReturn = {
      id: user.id,
      email: user.email,
      creation_date: user.creation_date,
      lastActive: Date.now(),
      userDocument,
    };
    return { data: userToReturn };
    
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    const errorMessage = getSupabaseErrorMessage("signInWithEmailAndPassword", error.code);
    return {
      error: {
        code: error.code || 'sign-in-failed',
        message: errorMessage || error.message,
      },
    };
  }
};

// Remplace supabaseLogOutUser
export const supabaseLogOutUser = async () => {
  try {
    return { data: true };
  } catch (error: any) {
    const errorMessage = getSupabaseErrorMessage("signOut", error.code);
    return {
      error: {
        code: error.code || 'logout-failed',
        message: errorMessage || error.message,
      },
    };
  }
};

// Remplace sendEmailToResetPassword
export const sendEmailToResetPassword = async (email: string) => {
  try {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    // Vérifier si l'utilisateur existe
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return {
        error: {
          code: 'user-not-found',
          message: 'Aucun utilisateur trouvé avec cet email',
        },
      };
    }

    const userId = result.rows[0].id;

    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
      { userId, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Sauvegarder le token en base
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
      [resetToken, userId]
    );

    // TODO: Intégrer votre service d'email ici
    console.log(`🔗 Lien de réinitialisation: ${process.env.NEXT_PUBLIC_APP_URL}/connexion/reset-password?token=${resetToken}`);
    
    return { data: true };
  } catch (error: any) {
    const errorMessage = getSupabaseErrorMessage("sendPasswordResetEmail", error.code);
    return {
      error: {
        code: error.code || 'reset-email-failed',
        message: errorMessage || error.message,
      },
    };
  }
};

// Remplace sendEmailVerificationProcedure
export const sendEmailVerificationProcedure = async (userId: string) => {
  try {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    // Récupérer l'utilisateur
    const result = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return {
        error: {
          code: 'user-not-found',
          message: 'Aucun utilisateur trouvé',
        },
      };
    }
    
    const email = result.rows[0].email;

    // Générer un token de vérification
    const verificationToken = jwt.sign(
      { userId, type: 'email-verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Sauvegarder le token
    await pool.query(
      'UPDATE users SET verification_token = $1 WHERE id = $2',
      [verificationToken, userId]
    );

    // TODO: Envoyer l'email de vérification
    console.log(`📧 Lien de vérification: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`);
    
    return { data: true };
  } catch (error: any) {
    const errorMessage = getSupabaseErrorMessage("sendEmailVerification", error.code);
    return {
      error: {
        code: error.code || 'verification-email-failed',
        message: errorMessage || error.message,
      },
    };
  }
};

// Remplace resetPassword
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    
    if (decoded.type !== 'password-reset') {
      return {
        error: {
          code: 'invalid-token',
          message: 'Token invalide',
        },
      };
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    // Mettre à jour le mot de passe
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, decoded.userId]
    );
    
    return { data: true };
  } catch (error: any) {
    const errorMessage = getSupabaseErrorMessage("resetPassword", error.code);
    return {
      error: {
        code: error.code || 'reset-password-failed',
        message: errorMessage || error.message,
      },
    };
  }
};

// Remplace updateUserIdentificationData
export const updateUserIdentificationData = async (uid: string, data: any) => {
  try {
    const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [uid, ...Object.values(data)];
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const result = await pool.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING id`,
      values
    );

    if (result.rows.length === 0) {
      return {
        error: {
          code: 'user-not-found',
          message: 'Utilisateur non trouvé',
        },
      };
    }

    return { data: true };
  } catch (error: any) {
    return {
      error: {
        code: error.code || 'update-failed',
        message: error.message || 'Erreur lors de la mise à jour de l\'utilisateur',
      },
    };
  }
};

// Remplace supabaseFetchRoles
export const supabaseFetchRoles = async () => {
  try {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    console.log("🔍 Récupération des rôles disponibles...");
    const { rows } = await pool.query(
      'SELECT * FROM roles ORDER BY nom'
    );
    console.log("✅ Rôles récupérés avec succès:", rows);
    return { data: rows, error: null };
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des rôles:", error);
    return { data: null, error };
  }
};

// Remplace supabaseAssignUserRole
 export const supabaseAssignUserRole = async (userId: string, roleId: string) => {
  try {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    console.log("➕ Association d'un rôle à l'utilisateur...");
    const result = await pool.query(
      `INSERT INTO user_roles (user_id, role_id, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING *`,
      [userId, roleId]
    );
    console.log("✅ Rôle associé avec succès:", result.rows[0]);
    return { data: result.rows[0], error: null };
  } catch (error: any) {
    console.error("❌ Erreur lors de l'association du rôle:", error);
    return { data: null, error };
  }
};