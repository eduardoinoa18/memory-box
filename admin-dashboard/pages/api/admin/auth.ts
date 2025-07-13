import { NextApiRequest, NextApiResponse } from 'next';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Pre-configured admin accounts with 2FA
const ADMIN_ACCOUNTS = {
  'binoa@memorybox.app': {
    password: 'Pucca1829@',
    role: 'superAdmin',
    permissions: ['all'],
    secret: null, // Will be generated on first setup
    isSetup: false
  },
  'einoa@memorybox.app': {
    password: 'Pucca1829#',
    role: 'admin', 
    permissions: ['users', 'content', 'support'],
    secret: null,
    isSetup: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        const { action, email, password, token, setupSecret } = req.body;

        if (action === 'login') {
          return handleLogin(req, res, email, password, token);
        } else if (action === 'setup-2fa') {
          return handleSetup2FA(req, res, email);
        } else if (action === 'verify-setup') {
          return handleVerifySetup(req, res, email, token, setupSecret);
        }
        
        res.status(400).json({ error: 'Invalid action' });
        break;

      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (error: any) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogin(req: NextApiRequest, res: NextApiResponse, email: string, password: string, token?: string) {
  const admin = ADMIN_ACCOUNTS[email as keyof typeof ADMIN_ACCOUNTS];
  
  if (!admin || admin.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // If 2FA not set up yet, require setup
  if (!admin.isSetup) {
    return res.status(200).json({ 
      requires2FASetup: true,
      message: 'Please set up 2FA authentication first' 
    });
  }

  // Verify 2FA token
  if (!token) {
    return res.status(400).json({ error: '2FA token required' });
  }

  const verified = speakeasy.totp.verify({
    secret: admin.secret!,
    encoding: 'base32',
    token: token,
    window: 2
  });

  if (!verified) {
    return res.status(401).json({ error: 'Invalid 2FA token' });
  }

  // Generate session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  res.status(200).json({
    success: true,
    sessionToken,
    admin: {
      email,
      role: admin.role,
      permissions: admin.permissions
    }
  });
}

async function handleSetup2FA(req: NextApiRequest, res: NextApiResponse, email: string) {
  const admin = ADMIN_ACCOUNTS[email as keyof typeof ADMIN_ACCOUNTS];
  
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  // Generate secret for 2FA
  const secret = speakeasy.generateSecret({
    name: `Memory Box Admin (${email})`,
    issuer: 'Memory Box'
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  res.status(200).json({
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32
  });
}

async function handleVerifySetup(req: NextApiRequest, res: NextApiResponse, email: string, token: string, setupSecret: string) {
  const admin = ADMIN_ACCOUNTS[email as keyof typeof ADMIN_ACCOUNTS];
  
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  // Verify the token with the setup secret
  const verified = speakeasy.totp.verify({
    secret: setupSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });

  if (!verified) {
    return res.status(401).json({ error: 'Invalid verification token' });
  }

  // Save the secret and mark as set up
  admin.secret = setupSecret;
  admin.isSetup = true;

  res.status(200).json({
    success: true,
    message: '2FA setup completed successfully'
  });
}
