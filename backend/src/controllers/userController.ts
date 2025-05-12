import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import { generateToken } from "./emailTokenUtil";
import { sendEmail } from "../utils/emailService";
import { createJunoClabe } from "../services/junoService";

// Get recipient's deposit CLABE by email
export const getRecipientClabe = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  const userRepo = ormconfig.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });
  if (!user || !user.deposit_clabe) {
    res.status(404).json({ error: 'Recipient CLABE not found' });
    return;
  }
  res.json({ deposit_clabe: user.deposit_clabe });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  try {
    const userRepo = ormconfig.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const email_verification_token = generateToken(24);
    const user = userRepo.create({ email, password_hash, full_name, email_verification_token, email_verified: false });
    await userRepo.save(user);

    // Create deposit CLABE for pay-ins and save to user
    try {
      const depositClabe = await createJunoClabe();
      user.deposit_clabe = depositClabe;
      await userRepo.save(user);
    } catch (clabeErr) {
      console.error('Deposit CLABE creation failed:', clabeErr);
      // Continue registration even if CLABE creation fails
      // Optionally, you can add a field to track CLABE creation failure for retry
    }

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${email_verification_token}`;
    await sendEmail({
      to: email,
      subject: "Verifica tu correo electrónico | Kustodia",
      html: `<p>Hola,</p><p>Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>`
    });
    res.status(201).json({ message: "User registered. Verification email sent.", user: { id: user.id, email: user.email, deposit_clabe: user.deposit_clabe, payout_clabe: user.payout_clabe } });
    return;
  } catch (err) {
    console.error('Registration error:', err);
    if (err && typeof err === 'object' && 'response' in err) {
      // SendGrid error structure
      // @ts-ignore
      console.error('SendGrid response:', err.response?.body);
    }
    res.status(500).json({ error: "Registration failed", details: err instanceof Error ? err.message : err });
    return;
  }
};

// Resend verification email endpoint
export async function resendVerificationEmail(req: Request, res: Response) {
  console.log('Resend verification endpoint hit', req.body);
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  try {
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }
    if (user.email_verified) {
      res.status(400).json({ error: "El correo ya está verificado." });
      return;
    }
    // Generate new token and save
    user.email_verification_token = generateToken(24);
    await userRepo.save(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${user.email_verification_token}`;
    console.log('About to send verification email to', user.email);
    await sendEmail({
      to: user.email,
      subject: "Verifica tu correo electrónico | Kustodia",
      html: `<p>Hola,</p><p>Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>`
    });
    console.log('Verification email send attempted');
    res.json({ message: "Correo de verificación reenviado." });
    return;
  } catch (err) {
    console.error('Error sending verification email:', err);
    if (err && typeof err === 'object' && 'response' in err) {
      // SendGrid error structure
      // @ts-ignore
      console.error('SendGrid response:', err.response?.body);
    }
    res.status(500).json({ error: "No se pudo reenviar el correo.", details: err instanceof Error ? err.message : err });
    return;
  }
};


export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  try {
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      res.status(200).json({ message: "If the email exists, a reset link has been sent." }); // Don't reveal existence
      return;
    }
    const token = generateToken(24);
    user.password_reset_token = token;
    user.password_reset_expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await userRepo.save(user);
    const resetUrl = `https://your-frontend-domain.com/reset-password.html?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Restablece tu contraseña | Kustodia",
      html: `<p>Hola,</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`
    });
    res.status(200).json({ message: "If the email exists, a reset link has been sent." });
    return;
  } catch (err) {
    console.error('Error sending password reset email:', err);
    if (err && typeof err === 'object' && 'response' in err) {
      // SendGrid error structure
      // @ts-ignore
      console.error('SendGrid response:', err.response?.body);
    }
    res.status(500).json({ error: "No se pudo enviar el correo de recuperación.", details: err instanceof Error ? err.message : err });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, new_password } = req.body;
  if (!token || !new_password) {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }
  try {
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { password_reset_token: token } });
    if (!user || !user.password_reset_expires || user.password_reset_expires < new Date()) {
      res.status(400).json({ error: "El enlace de recuperación no es válido o ha expirado." });
      return;
    }
    user.password_hash = await bcrypt.hash(new_password, 10);
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    await userRepo.save(user);
    res.json({ success: true, message: "Contraseña restablecida exitosamente." });
    return;
  } catch (err) {
    res.status(500).json({ error: "No se pudo restablecer la contraseña.", details: err instanceof Error ? err.message : err });
    return;
  }
};

import { sendWelcomeEmail } from "../utils/emailService";

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ error: "Token de verificación faltante." });
    return;
  }
  try {
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { email_verification_token: token } });
    if (!user) {
      res.status(400).json({ error: "Enlace de verificación no válido o expirado." });
      return;
    }
    user.email_verified = true;
    user.email_verification_token = undefined;
    await userRepo.save(user);
    // Send welcome email
    await sendWelcomeEmail(user.email, user.full_name);
    res.json({ success: true, message: "Correo verificado exitosamente." });
    return;
  } catch (err) {
    res.status(500).json({ error: "No se pudo verificar el correo.", details: err instanceof Error ? err.message : err });
    return;
  }
};

import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  try {
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: "Credenciales inválidas, intenta nuevamente" });
      return;
    }
    if (!user.email_verified) {
      res.status(403).json({ error: "Correo no verificado. Por favor verifica tu correo.", unverified: true });
      return;
    }

    // Ensure deposit_clabe exists for authenticated users
    if (!user.deposit_clabe) {
      try {
        const depositClabe = await createJunoClabe();
        user.deposit_clabe = depositClabe;
        await userRepo.save(user);
      } catch (clabeErr) {
        console.error('Deposit CLABE creation on login failed:', clabeErr);
        // Continue login even if CLABE creation fails
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );
    res.json({ message: "Login successful", token, user: { id: user.id, email: user.email, deposit_clabe: user.deposit_clabe, payout_clabe: user.payout_clabe } });
    return;
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err });
    return;
  }
};
