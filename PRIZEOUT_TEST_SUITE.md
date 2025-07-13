# Prizeout Integration Test Suite

This collection contains comprehensive tests for the Prizeout gift card redemption integration.

## Setup Instructions

### 1. Environment Configuration
Ensure these environment variables are set in your `.env.local`:
```bash
PRIZEOUT_PARTNER_ID=test_partner_123
PRIZEOUT_API_KEY=test_api_key_456
PRIZEOUT_SECRET=test_secret_789
PRIZEOUT_SECURITY_TOKEN=test_security_token_abc
PRIZEOUT_BASE_URL=https://sandbox.api.prizeout.com
PRIZEOUT_ENABLED=true
```

### 2. Hookdeck Configuration
Use Hookdeck to forward webhooks to your local development environment:

1. Create a Hookdeck account at https://hookdeck.io
2. Create a new destination pointing to: `http://localhost:3000/api/prizeout/webhook`
3. Use the provided Hookdeck URL as your webhook endpoint in Prizeout dashboard

### 3. Test Data
Create a test user in your Firebase with:
- `rewardCredits: 500`
- `loyaltyPoints: 200`

## Test Scenarios

### Scenario 1: Successful Gift Card Redemption
**Description**: Complete end-to-end redemption flow
**Expected Result**: Gift card received, commission logged, user balance deducted

```bash
# 1. Get user balance
GET /api/prizeout/balance?userId=test_user_123

# 2. Create redemption session
POST /api/prizeout/session
{
  "userId": "test_user_123",
  "amount": 50,
  "retailerId": "amazon"
}

# 3. Simulate webhook success
POST /api/prizeout/webhook
Headers:
  x-signature: [calculated_signature]
  x-timestamp: [current_timestamp]
Body:
{
  "sessionId": "session_abc123",
  "status": "completed",
  "transactionData": {
    "transactionId": "txn_xyz789",
    "giftCard": {
      "retailer": "Amazon",
      "faceValue": 50,
      "cardNumber": "1234-5678-9012-3456",
      "pin": "7890",
      "expiryDate": "2025-12-31"
    }
  }
}
```

### Scenario 2: Insufficient Balance
**Description**: User attempts redemption with insufficient balance
**Expected Result**: 400 error with clear message

```bash
POST /api/prizeout/session
{
  "userId": "test_user_123",
  "amount": 1000  # More than user's balance
}
```

### Scenario 3: Failed Redemption
**Description**: Prizeout redemption fails
**Expected Result**: User balance not deducted, failure logged

```bash
# Simulate webhook failure
POST /api/prizeout/webhook
{
  "sessionId": "session_failed_123",
  "status": "failed",
  "transactionData": {
    "error": "Retailer temporarily unavailable"
  }
}
```

### Scenario 4: Cancelled Redemption
**Description**: User cancels redemption in Prizeout interface
**Expected Result**: Session marked as cancelled, no balance deduction

```bash
# Simulate webhook cancellation
POST /api/prizeout/webhook
{
  "sessionId": "session_cancelled_123",
  "status": "cancelled"
}
```

### Scenario 5: Invalid Webhook Signature
**Description**: Webhook with invalid signature
**Expected Result**: 401 Unauthorized error

```bash
POST /api/prizeout/webhook
Headers:
  x-signature: invalid_signature
  x-timestamp: [current_timestamp]
```

### Scenario 6: Old Webhook Timestamp
**Description**: Webhook with timestamp older than 5 minutes
**Expected Result**: 401 Unauthorized error

```bash
POST /api/prizeout/webhook
Headers:
  x-signature: [valid_signature]
  x-timestamp: [old_timestamp]  # More than 5 minutes ago
```

## Performance Tests

### Load Testing
Test concurrent redemption sessions:
```bash
# Create 10 concurrent sessions
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/prizeout/session \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user_$i\",\"amount\":25}" &
done
```

### Database Performance
Monitor Firestore operations during high-volume testing:
- Commission ledger writes
- User balance updates
- Session status updates

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Redemption Success Rate**: Should be >95%
2. **API Response Time**: Should be <2 seconds
3. **Webhook Processing Time**: Should be <1 second
4. **Commission Accuracy**: Verify calculated amounts
5. **Balance Consistency**: Ensure proper deductions

### Alert Conditions
- Failed redemption rate >5%
- API response time >5 seconds
- Webhook signature validation failures
- Commission calculation discrepancies

## Troubleshooting

### Common Issues
1. **Signature Validation Failures**
   - Check PRIZEOUT_SECURITY_TOKEN
   - Verify timestamp is within 5-minute window
   - Ensure payload is exact JSON string used for signature

2. **Session Creation Failures**
   - Verify PRIZEOUT_API_KEY and PRIZEOUT_PARTNER_ID
   - Check user balance calculations
   - Validate request payload format

3. **Webhook Processing Errors**
   - Check Firestore permissions
   - Verify commission ledger schema
   - Monitor webhook endpoint accessibility

### Debug Tools
```bash
# Enable debug logging
export DEBUG=prizeout:*

# Test signature generation
node -e "
const crypto = require('crypto');
const payload = '{\"test\":\"data\"}';
const secret = 'test_secret';
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log('Signature:', signature);
"

# Verify webhook endpoint
curl -X POST http://localhost:3000/api/prizeout/webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: test_signature" \
  -H "x-timestamp: $(date +%s)000" \
  -d '{"test": "webhook"}'
```

## Postman Collection

Import the provided Postman collection (`prizeout-tests.postman_collection.json`) which includes:
- Pre-configured requests for all scenarios
- Environment variables for easy switching between dev/staging
- Automated tests for response validation
- Scripts for signature generation

## Staging Checklist

Before moving to production:
- [ ] All test scenarios pass
- [ ] Load testing completed successfully
- [ ] Webhook signature validation working
- [ ] Commission calculations verified
- [ ] Error handling tested
- [ ] Monitoring and alerts configured
- [ ] Documentation updated
- [ ] Security review completed

## Production Deployment

1. Update environment variables with production Prizeout credentials
2. Configure production webhook URL
3. Enable monitoring and alerting
4. Set up backup and recovery procedures
5. Plan rollback strategy
