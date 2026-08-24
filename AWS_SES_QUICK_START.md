# AWS SES Quick Start - 5 Minute Overview

## 📚 What You Have

Three comprehensive guides have been created for AWS SES setup:

1. **AWS_SES_SETUP_GUIDE.md** — Complete step-by-step instructions (10 steps, detailed)
2. **AWS_SES_QUICK_CHECKLIST.md** — Checkoff list for tracking progress
3. **setup_aws_ses.sh** — Automation script to reduce manual steps

---

## ⚡ Quickest Path (30 minutes)

### For Email-Only Testing (Single Email)

1. **Log into AWS Console** → Search "SES"
2. **Create Identity** → Email address → `no-reply@catchtheten.com`
3. **Verify** → Click link in your email
4. **Test** → SES Console → "Send test email"
5. **Configure Backend** → Set environment variables
6. **Deploy** → Restart backend service
7. **Test Application** → Register → Check email for OTP

**Time**: ~10 minutes (instant, no waiting)

---

### For Production (Domain Verification)

1. **Verify Domain** in SES (adds DNS records)
2. **Wait 24-48 hours** for DNS propagation
3. **Request Production Access** (wait 24 hours for approval)
4. **Setup IAM** (optional but recommended)
5. **Configure Backend** → Environment variables
6. **Deploy** → Restart backend
7. **Full Testing** → All flows verified

**Time**: ~2-3 days total (mostly waiting)

---

## 🚀 Using the Automation Script

```bash
# Make script executable
chmod +x setup_aws_ses.sh

# Run the script
./setup_aws_ses.sh

# Follow the interactive menu
# Options: 1-10 for different steps, or 10 for all at once
```

**What it does**:
- ✅ Verifies AWS CLI credentials
- ✅ Creates/verifies email
- ✅ Creates IAM user
- ✅ Generates access keys
- ✅ Tests email sending
- ✅ Checks SES quota
- ✅ Generates .env file
- ✅ Optional: Creates CloudWatch alarms

---

## 🎯 Step-by-Step (5 Minutes for Testing)

### 1. Go to AWS SES Console
```
https://console.aws.amazon.com/ses/
→ Region: ap-southeast-2 (top right)
```

### 2. Create & Verify Email
```
Left sidebar → Verified identities
→ Create identity
→ Email address
→ Enter: no-reply@catchtheten.com
→ Create identity
→ Check email for verification link
→ Click link
```

### 3. Test Sending
```
Left sidebar → Email sending
→ Send test email
→ To: your-email@example.com
→ Subject: Test OTP
→ Body: This is a test
→ Send
→ Check your email
```

### 4. Configure Backend

**Option A: Environment Variables**
```bash
export AWS_REGION=ap-southeast-2
export SES_SENDER_EMAIL=no-reply@catchtheten.com
export SES_SENDER_NAME="Catch The Ten"
export OTP_TTL_MINUTES=10
export OTP_MAX_ATTEMPTS=5
export OTP_MAX_PER_EMAIL_PER_HOUR=5
export OTP_HASH_SECRET=<your-jwt-secret>
```

**Option B: .env File**
```bash
# Create .env.backend
AWS_REGION=ap-southeast-2
SES_SENDER_EMAIL=no-reply@catchtheten.com
SES_SENDER_NAME=Catch The Ten
OTP_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_MAX_PER_EMAIL_PER_HOUR=5
OTP_HASH_SECRET=<your-jwt-secret>
```

### 5. Restart Backend
```bash
# Docker
docker-compose restart backend

# Systemd
sudo systemctl restart catch-the-ten-backend

# Direct
python src/main.py
```

### 6. Test Application
1. Go to your app: http://localhost:3000
2. Register → Enter email → Click Register
3. Check your email for OTP code
4. Enter code → Success! ✅

---

## 📋 For Production (Domain)

### Additional Steps

1. **Get Domain DNS Records**
   - SES Console → Verified identities → Your domain
   - Copy the 3 CNAME records

2. **Add to Domain DNS**
   - Go to your domain registrar (Route53, GoDaddy, etc.)
   - Add all 3 CNAME records
   - Wait 24-48 hours

3. **Request Production Access**
   - SES Console → Account dashboard
   - "Request production access"
   - Fill form (transactional email use case)
   - Wait 24 hours for approval

4. **Add SPF Record** (recommended)
   ```
   v=spf1 include:amazonses.com ~all
   ```

---

## 🔧 Configuration Values

Save these for reference:

```
Region:                   ap-southeast-2
Sender Email:             no-reply@catchtheten.com
Sender Name:              Catch The Ten
OTP Expiry:               10 minutes
Max Attempts Per OTP:     5
Max OTPs Per Email/Hour:  5
```

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ Test email from SES Console arrives instantly
- ✅ Registration OTP email arrives in 1-2 seconds
- ✅ Forgot password email arrives
- ✅ Update email OTP arrives
- ✅ No errors in backend logs
- ✅ CloudWatch shows successful sends (if monitoring)

---

## 🔒 Security Notes

**For Testing**: Store credentials in .env file (`.gitignore`'d)
**For Production**: Use IAM Role on EC2 (no credentials on server)

```bash
# NEVER commit these to git:
.env.backend
.env.ses
credentials

# Add to .gitignore:
echo ".env.*" >> .gitignore
echo "credentials" >> .gitignore
```

---

## 🐛 If It Doesn't Work

| Problem | Solution |
|---------|----------|
| Email not verified | Check email inbox, click verification link |
| Can't send (in sandbox) | Request production access |
| "Access Denied" | Check IAM permissions |
| Email in spam | Add SPF/DKIM records |
| No CloudWatch data | Wait a few minutes, then refresh |

---

## 📞 Quick Help

```bash
# Test SES connection via CLI
aws ses send-email \
  --from no-reply@catchtheten.com \
  --to your-email@example.com \
  --subject "Test" \
  --text "Test" \
  --region ap-southeast-2

# Check SES quota
aws ses get-account-sending-enabled --region ap-southeast-2

# List verified identities
aws ses list-verified-email-addresses --region ap-southeast-2
```

---

## 📖 Full Documentation

For complete details:
- **Step-by-step**: Read `AWS_SES_SETUP_GUIDE.md`
- **Checklist**: Follow `AWS_SES_QUICK_CHECKLIST.md`
- **Automation**: Run `setup_aws_ses.sh`

---

## ⏱️ Timeline

| Scenario | Time | Steps |
|----------|------|-------|
| **Email Testing** | 10 min | 1. Verify email, 2. Test, 3. Configure, 4. Deploy |
| **Production (Domain)** | 2-3 days | + DNS setup + Production access request |
| **With Script** | 15 min | Run setup_aws_ses.sh |

---

## 🎯 Next Actions

### Right Now (5 minutes)
1. Log into AWS Console
2. Go to SES
3. Verify an email
4. Send a test email

### Next (10 minutes)
1. Set environment variables
2. Restart backend
3. Test application

### Later (for production)
1. Verify domain
2. Request production access
3. Add DNS records
4. Full application testing

---

## 💡 Pro Tips

- **Start with email verification** (fastest, no domain needed)
- **Use automation script** (saves time, reduces errors)
- **Test early** (verify everything works before going live)
- **Monitor logs** (CloudWatch tells you about problems)
- **Plan for 24 hours** (production approval takes time)

---

**You're all set! Start with Step 1 above or run the automation script.** 🚀

See `AWS_SES_SETUP_GUIDE.md` for detailed instructions on any step.
