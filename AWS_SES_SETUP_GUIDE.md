# AWS SES Setup Guide - Complete Instructions

**Project**: Catch The Ten (10S)  
**Date**: 2026-08-18  
**Region**: ap-southeast-2 (Sydney, Australia)

---

## 📋 Prerequisites

Before starting, you need:
- AWS Account with billing enabled
- Email domain or sender email address
- Terminal/console access
- AWS CLI configured (optional but helpful)
- Backend EC2 instance or deployment target ready

---

## Step 1: Access AWS SES Console

### 1.1 Log into AWS Console

1. Go to https://aws.amazon.com/
2. Click "Sign In to the Console"
3. Enter your AWS Account ID, username, and password
4. Two-factor authentication (if enabled)

### 1.2 Navigate to SES

1. In AWS Console top search bar, type "SES"
2. Click "Simple Email Service"
3. Verify you're in **ap-southeast-2 (Sydney)** region (top right corner)
   - If not, click region dropdown and select **Asia Pacific (Sydney)**

---

## Step 2: Verify Sender Email/Domain

### Option A: Verify a Single Email Address (For Testing)

**Use this if you want to start quickly with a single email**

1. In SES Console, left sidebar → **Verified identities**
2. Click "Create identity"
3. Select **Email address**
4. Enter your sender email: `no-reply@catchtheten.com` or your domain email
5. Click "Create identity"
6. **Check your email** for verification link
7. Click the verification link in the email
8. Return to SES Console → verify status shows "Verified" ✅

### Option B: Verify a Domain (For Production)

**Use this for production deployment**

#### 2B.1 Start Domain Verification

1. In SES Console, left sidebar → **Verified identities**
2. Click "Create identity"
3. Select **Domain**
4. Enter your domain: `catchtheten.com` (or your domain)
5. Select "DKIM signing" → Enable (recommended for authentication)
6. Click "Create identity"

#### 2B.2 Add DNS Records

After creating identity, SES displays 3 DNS records to add:

1. **CNAME Record for DKIM** (looks like):
   ```
   Name: token1._domainkey.catchtheten.com
   Type: CNAME
   Value: token1.dkim.amazonses.com
   ```

2. Go to your domain registrar (GoDaddy, Route53, Namecheap, etc.)
3. Add the 3 CNAME records provided by SES
4. Wait 24-48 hours for DNS propagation
5. Return to SES Console → identity status should show "Verified" ✅

**Note**: If using Route53, SES can auto-create records (click "Publish DNS records to Route53" if available)

---

## Step 3: Request Production Access (Exit Sandbox)

### 3.1 Check Current Status

1. SES Console → left sidebar → **Account dashboard**
2. Look for "SES Sending Limits"
3. If it says **"Sandbox"**, you need to request production access

### 3.2 Request Production Access

1. SES Console → left sidebar → **Account dashboard**
2. Scroll down → "Sending Limits"
3. Click "Edit your account details" OR
4. Click "Request production access"
5. Fill out the form:
   - **Use case**: Select "Transactional"
   - **Website URL**: Your website (e.g., catchtheten.com)
   - **Description**: "Sending OTP verification emails for Catch The Ten card game"
   - **Additional use case description**:
     ```
     We are sending one-time password (OTP) verification codes via email for:
     - User registration and email verification
     - Password reset/recovery flows
     - Email address changes
     - Account security verification
     
     These are transactional emails sent on-demand by users.
     Expected volume: 1,000-5,000 emails/day
     Expected recipients: Active game players
     ```
   - **Will you be sending to recipients who haven't explicitly requested your emails?**: No
   - **What type of email are you planning to send?**: Select appropriate options

6. Click "Submit Request"

**Approval typically takes**: 24 hours (sometimes instant)

#### 3.3 Check Request Status

1. SES Console → Account dashboard
2. Look for notification banner about your request
3. AWS will send approval email to your AWS account email
4. Once approved, sandbox restrictions are lifted ✅

---

## Step 4: Create IAM User for Backend (Recommended)

### 4.1 Why Create a Separate IAM User?

- Security: Limit permissions to only SES (principle of least privilege)
- Rotation: Can rotate credentials independently
- Audit: Track SES usage separately

### 4.2 Create IAM User

1. Go to **IAM Console** (search "IAM" in AWS)
2. Left sidebar → **Users**
3. Click "Create user"
4. **User name**: `ses-backend-user`
5. Click "Next"
6. **Permissions**: Click "Attach policies directly"
7. Search for and select: `AmazonSESFullAccess`
   - Or create custom policy (see Section 4.3)
8. Click "Next" → "Create user"

### 4.3 (Optional) Create Custom SES-Only Policy

For maximum security, create a policy that only allows SES sending:

1. IAM Console → **Policies** → "Create policy"
2. Click JSON tab, paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

3. Click "Next" → Name it `SES-Backend-Policy`
4. Create policy
5. Attach to `ses-backend-user`

### 4.4 Create Access Keys

1. IAM Console → **Users** → Click `ses-backend-user`
2. **Security credentials** tab
3. Scroll to "Access keys" → "Create access key"
4. Select "Command Line Interface (CLI)"
5. Click "Next" → "Create access key"
6. **IMPORTANT**: Copy and save:
   - Access Key ID
   - Secret Access Key
7. Click "Done"

**⚠️ Save these credentials securely!** You won't see the secret key again.

---

## Step 5: Configure EC2 Instance or Deployment

### Option A: Using IAM Role (Recommended for EC2)

**Best practice**: Use IAM role instead of credentials

#### 5A.1 Create IAM Role for EC2

1. IAM Console → **Roles** → "Create role"
2. **Trusted entity type**: AWS service
3. **Service**: EC2
4. Click "Next"
5. Attach policy: `AmazonSESFullAccess` (or custom policy from 4.3)
6. Name: `Backend-SES-Role`
7. Create role

#### 5A.2 Attach Role to EC2 Instance

1. Go to **EC2 Console**
2. Find your backend instance
3. Right-click → **Instance Settings** → **Modify IAM role**
4. Select `Backend-SES-Role`
5. Click "Update IAM role"

**Result**: Your backend can now call SES without credentials stored on the server!

---

### Option B: Using Access Keys (For Local Testing)

**Use for development/testing, NOT production**

#### 5B.1 Store Credentials

Create `.env.backend` file (NOT committed to git):

```bash
# AWS SES Configuration
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SES_SENDER_EMAIL=no-reply@catchtheten.com
SES_SENDER_NAME=Catch The Ten
OTP_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_MAX_PER_EMAIL_PER_HOUR=5
OTP_HASH_SECRET=your-secret-key-here
```

#### 5B.2 Update Backend Config

In `src/config.py`, credentials are loaded from environment:

```python
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
```

---

## Step 6: Configure Backend Environment Variables

### 6.1 Production (EC2/Server)

SSH into your backend server and set environment variables:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Edit .env file or export variables
export AWS_REGION=ap-southeast-2
export SES_SENDER_EMAIL=no-reply@catchtheten.com
export SES_SENDER_NAME="Catch The Ten"
export OTP_TTL_MINUTES=10
export OTP_MAX_ATTEMPTS=5
export OTP_MAX_PER_EMAIL_PER_HOUR=5
export OTP_HASH_SECRET=your-jwt-secret-key

# Restart backend service
sudo systemctl restart catch-the-ten-backend
# or
docker-compose restart backend
```

### 6.2 Docker Compose

If using Docker, update `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - AWS_REGION=ap-southeast-2
      - SES_SENDER_EMAIL=no-reply@catchtheten.com
      - SES_SENDER_NAME=Catch The Ten
      - OTP_TTL_MINUTES=10
      - OTP_MAX_ATTEMPTS=5
      - OTP_MAX_PER_EMAIL_PER_HOUR=5
      - OTP_HASH_SECRET=${JWT_SECRET_KEY}
    # If using IAM role:
    # No AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY needed
```

### 6.3 Parameter Store (Recommended for Secrets)

Instead of environment variables, use AWS Systems Manager Parameter Store:

```bash
# Store credentials in Parameter Store
aws ssm put-parameter \
  --name /catch-the-ten/ses/sender-email \
  --value "no-reply@catchtheten.com" \
  --type String \
  --region ap-southeast-2

aws ssm put-parameter \
  --name /catch-the-ten/otp/hash-secret \
  --value "your-secret-key" \
  --type SecureString \
  --region ap-southeast-2
```

Backend retrieves via boto3:

```python
ssm_client = boto3.client('ssm', region_name=AWS_REGION)
ses_sender = ssm_client.get_parameter(Name='/catch-the-ten/ses/sender-email')['Parameter']['Value']
```

---

## Step 7: Test Email Delivery

### 7.1 Using AWS Console

1. SES Console → **Email sending** → **Send test email**
2. Recipient email: Your personal email
3. Subject: "Test OTP Email"
4. Body: "This is a test email from SES"
5. Click "Send"
6. **Check your inbox** for the email ✅

### 7.2 Using AWS CLI

```bash
aws ses send-email \
  --from "no-reply@catchtheten.com" \
  --to "your-email@example.com" \
  --subject "Test Email" \
  --text "This is a test" \
  --region ap-southeast-2
```

### 7.3 Using Backend Code

Test directly from your backend:

```python
import boto3
from src.email_service import send_otp_email

# Test sending an OTP email
success = send_otp_email(
    to_email="your-email@example.com",
    purpose="register_verify",
    code="123456"
)

print(f"Email sent: {success}")
```

---

## Step 8: Monitor SES Sending

### 8.1 Check Sending Statistics

1. SES Console → **Account dashboard**
2. Look for "24-hour sending quota" and "Max send rate"
3. Monitor emails sent vs. bounces/complaints

### 8.2 CloudWatch Logs

SES publishes metrics to CloudWatch:

1. Go to **CloudWatch Console**
2. **Metrics** → Search "SES"
3. View:
   - Send rate
   - Bounce rate
   - Complaint rate
   - Rejection rate

### 8.3 Set Up Alarms (Recommended)

Monitor for delivery issues:

```bash
# High bounce rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name SES-High-Bounce-Rate \
  --alarm-description "Alert if SES bounce rate > 5%" \
  --metric-name Bounce \
  --namespace AWS/SES \
  --statistic Sum \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --region ap-southeast-2
```

---

## Step 9: Test Full Email Flow (Application)

### 9.1 Test Registration with Email

1. Go to your web app: `http://localhost:3000` or production URL
2. Click "Register"
3. Fill form:
   - Username: `testuser`
   - Email: `your-email@example.com`
   - Password: `SecurePass123!`
4. Click "Register"
5. **Check your email** for OTP code ✅
6. Enter OTP code in app → Email should be verified ✅

### 9.2 Test Forgot Password

1. Go to login page
2. Click "Forgot password?"
3. Enter email: `your-email@example.com`
4. **Check email** for OTP code ✅
5. Enter code + new password → Password reset ✅

### 9.3 Test Update Email

1. Log in to your account
2. Go to Profile
3. Click "Update Email"
4. Enter new email: `newemail@example.com`
5. Click "Send Code"
6. **Check the NEW email** for OTP code ✅
7. Enter code → Email updated ✅

### 9.4 Test Update Password

1. Log in to your account
2. Go to Profile
3. Click "Change Password"
4. Click "Send Code"
5. **Check your email** for OTP code ✅
6. Enter code + new password → Password changed ✅

---

## Step 10: Production Checklist

### Before Going Live

- [ ] Domain verified in SES (not just email address)
- [ ] Production access granted (not in sandbox)
- [ ] IAM role attached to EC2 (preferred) OR credentials securely stored
- [ ] All environment variables configured
- [ ] Verified DKIM signing enabled
- [ ] SPF record added to domain DNS
- [ ] DMARC policy configured (optional but recommended)
- [ ] CloudWatch alarms set up
- [ ] Email templates tested in all languages
- [ ] Rate limiting verified (5/hour per email)
- [ ] Backend logs show successful SES calls

### Additional DNS Records (Recommended)

Add to your domain for email authentication:

**SPF Record**:
```
v=spf1 include:amazonses.com ~all
```

**DMARC Record** (optional):
```
v=DMARC1; p=quarantine; rua=mailto:admin@catchtheten.com
```

---

## Troubleshooting

### Issue: "Message Rejected: Email address not verified"

**Solution**: 
- Email address not verified in SES yet
- Go to SES Console → Verified identities
- Add the email/domain and verify it

### Issue: "Account is in Sandbox mode"

**Solution**:
- Request production access (Step 3.2)
- Wait for AWS approval
- Only verified emails can receive emails while in sandbox

### Issue: "Account sending limit exceeded"

**Solution**:
- Check CloudWatch metrics for send rate
- Request higher sending quota in SES Console
- Implement exponential backoff in application

### Issue: Emails going to spam folder

**Solution**:
- Enable DKIM signing (Step 2)
- Add SPF record
- Use proper email template formatting
- Monitor complaint rate in CloudWatch

### Issue: "AccessDenied: User is not authorized"

**Solution**:
- Verify IAM user has `AmazonSESFullAccess` policy
- Or attach custom policy from Step 4.3
- Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct

### Issue: Backend can't connect to SES

**Solution**:
```bash
# Test connectivity
aws ses send-email \
  --from "no-reply@catchtheten.com" \
  --to "test@example.com" \
  --subject "Test" \
  --text "Test" \
  --region ap-southeast-2 \
  --debug  # Shows detailed error info
```

---

## Summary of Key Values

Store these for reference:

```
Region: ap-southeast-2
Sender Email: no-reply@catchtheten.com
Sender Name: Catch The Ten
OTP Expiry: 10 minutes
Max Attempts: 5
Max Per Email/Hour: 5
IAM User: ses-backend-user (if created)
IAM Role: Backend-SES-Role (if using EC2)
```

---

## Next Steps

1. ✅ Complete Steps 1-7 above
2. ✅ Run Step 7 tests (console and CLI)
3. ✅ Configure backend environment variables
4. ✅ Deploy updated backend code
5. ✅ Run full application tests (Step 9)
6. ✅ Check production checklist
7. ✅ Monitor CloudWatch logs
8. ✅ Announce feature to users

---

## Timeline

- **Step 1-2**: 5 minutes (email verification instant)
- **Step 3**: 24 hours (production access approval)
- **Step 4-5**: 10 minutes
- **Step 6**: 5 minutes
- **Step 7**: 5 minutes (testing)
- **Step 8**: 10 minutes (monitoring setup)
- **Step 9**: 15 minutes (application testing)

**Total**: ~1-2 hours for setup, plus 24-hour wait for production access

---

## Support Links

- AWS SES Documentation: https://docs.aws.amazon.com/ses/
- AWS SES FAQ: https://aws.amazon.com/ses/faqs/
- AWS Support: https://console.aws.amazon.com/support/

---

**You're all set! Follow these steps in order and your email system will be live.** 🚀
