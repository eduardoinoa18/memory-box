// Prizeout Integration Configuration
export const prizeoutConfig = {
  baseUrl: process.env.PRIZEOUT_BASE_URL || 'https://sandbox.api.prizeout.com',
  partnerId: process.env.PRIZEOUT_PARTNER_ID,
  apiKey: process.env.PRIZEOUT_API_KEY,
  secret: process.env.PRIZEOUT_SECRET,
  securityToken: process.env.PRIZEOUT_SECURITY_TOKEN,
  enabled: process.env.PRIZEOUT_ENABLED === 'true',
  commissionRate: parseFloat(process.env.PRIZEOUT_COMMISSION_RATE) || 0.03,
  bonusPercentage: parseInt(process.env.PRIZEOUT_BONUS_PERCENTAGE) || 25,
  
  headers: {
    'x-partner-id': process.env.PRIZEOUT_PARTNER_ID,
    'x-api-key': process.env.PRIZEOUT_API_KEY,
    'Content-Type': 'application/json'
  },

  // Endpoints
  endpoints: {
    createSession: '/v1/sessions',
    getBalance: '/v1/balance',
    getRetailers: '/v1/retailers',
    getTransactions: '/v1/transactions'
  },

  // Validation
  isConfigured() {
    return !!(this.partnerId && this.apiKey && this.secret && this.securityToken);
  },

  // Feature flags
  features: {
    giftCardRedemption: true,
    bonusRewards: true,
    retailerSelection: true,
    commissionTracking: true
  }
};

// Development/Staging overrides
if (process.env.NODE_ENV === 'development') {
  prizeoutConfig.baseUrl = 'https://sandbox.api.prizeout.com';
}

export default prizeoutConfig;
