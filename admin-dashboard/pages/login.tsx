import { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  Container
} from '@mui/material';
import { Security, VpnKey } from '@mui/icons-material';

export default function AdminLogin() {
  const [step, setStep] = useState(0); // 0: login, 1: 2FA setup, 2: 2FA verify
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['Login', '2FA Setup', 'Verification'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: credentials.email,
          password: credentials.password,
          token: step === 2 ? token : undefined
        })
      });

      const data = await response.json();

      if (data.requires2FASetup) {
        // Need to set up 2FA
        await setup2FA();
      } else if (data.success) {
        // Login successful
        localStorage.setItem('adminToken', data.sessionToken);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        window.location.href = '/';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup-2fa',
          email: credentials.email
        })
      });

      const data = await response.json();
      setQrCode(data.qrCode);
      setSetupSecret(data.secret);
      setStep(1);
    } catch (err) {
      setError('Failed to set up 2FA');
    }
  };

  const verifySetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-setup',
          email: credentials.email,
          token: token,
          setupSecret: setupSecret
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('2FA setup completed! You can now log in.');
        setStep(2);
        // Auto-login after setup
        setTimeout(() => {
          handleLogin(new Event('submit') as any);
        }, 1000);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}>
        <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Security sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Memory Box Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Secure Admin Portal with 2FA
            </Typography>
          </Box>

          <Stepper activeStep={step} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {step === 0 && (
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                margin="normal"
                required
                placeholder="binoa@memorybox.app or einoa@memorybox.app"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          )}

          {step === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Set Up 2FA Authentication
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </Typography>
              
              {qrCode && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: '200px' }} />
                </Box>
              )}
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Manual entry key: <code>{setupSecret}</code>
              </Typography>
              
              <TextField
                fullWidth
                label="Enter 6-digit code from authenticator"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                margin="normal"
                required
                inputProps={{ maxLength: 6 }}
              />
              
              <Button
                fullWidth
                variant="contained"
                onClick={verifySetup}
                sx={{ mt: 2 }}
                disabled={loading || token.length !== 6}
              >
                {loading ? 'Verifying...' : 'Complete Setup'}
              </Button>
            </Box>
          )}

          {step === 2 && (
            <form onSubmit={handleLogin}>
              <Typography variant="h6" gutterBottom>
                Enter Authentication Code
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter the 6-digit code from your authenticator app
              </Typography>
              
              <TextField
                fullWidth
                label="6-digit authentication code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                margin="normal"
                required
                inputProps={{ maxLength: 6 }}
                autoFocus
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading || token.length !== 6}
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </Button>
            </form>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Memory Box Admin Portal - Secure Access
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
