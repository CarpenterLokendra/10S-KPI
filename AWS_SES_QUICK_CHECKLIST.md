# AWS SES Setup - Quick Checklist

## ✅ Pre-Setup

- [ ] AWS Account created and logged in
- [ ] Region set to **ap-southeast-2**
- [ ] Email domain ready (or sender email)
- [ ] Terminal/CLI access available
- [ ] AWS CLI configured (optional)

---

## 📝 Step-by-Step Checklist

### Step 1: SES Console Access
- [ ] Log into AWS Console
- [ ] Search for "SES" service
- [ ] Confirm region is **ap-southeast-2**

### Step 2: Verify Sender Email/Domain
- [ ] Decide: Single email (testing) OR Domain (production)
- [ ] Create identity in SES
- [ ] Verify via email link or DNS records
- [ ] Status shows "Verified" ✅

**DNS Records Added** (if domain):
- [ ] CNAME Record 1 added to domain DNS
- [ ] CNAME Record 2 added to domain DNS
- [ ] CNAME Record 3 added to domain DNS
- [ ] Wait 24-48 hours for propagation

### Step 3: Exit Sandbox Mode
- [ ] Check Account Dashboard for sandbox status
- [ ] If in sandbox: Click "Request production access"
- [ ] Fill out production access form
- [ ] Receive AWS approval email
- [ ] Status changes from "Sandbox" to "Production" ✅

### Step 4: Create IAM User (Optional but Recommended)
- [ ] Go to IAM Console
- [ ] Create user: `ses-backend-user`
- [ ] Attach policy: `AmazonSESFullAccess`
- [ ] Create access keys
- [ ] **Save credentials securely**:
  - [ ] Access Key ID: `___________________`
  - [ ] Secret Access Key: `___________________`

### Step 5: Create IAM Role for EC2 (If using EC2)
- [ ] Create role: `Backend-SES-Role`
- [ ] Attach: `AmazonSESFullAccess`
- [ ] Attach to EC2 instance
- [ ] Verify attachment ✅

### Step 6: Configure Backend Environment
- [ ] Set `AWS_REGION=ap-southeast-2`
- [ ] Set `SES_SENDER_EMAIL=no-reply@catchtheten.com`
- [ ] Set `SES_SENDER_NAME=Catch The Ten`
- [ ] Set `OTP_TTL_MINUTES=10`
- [ ] Set `OTP_MAX_ATTEMPTS=5`
- [ ] Set `OTP_MAX_PER_EMAIL_PER_HOUR=5`
- [ ] Set `OTP_HASH_SECRET=<your-jwt-secret>`

### Step 7: Test Email Delivery
- [ ] Send test email via SES Console
- [ ] Verify email received ✅
- [ ] Test via AWS CLI (optional)
- [ ] Test via backend code (optional)

### Step 8: Setup Monitoring (Production)
- [ ] CloudWatch alarms configured
- [ ] SNS notifications setup
- [ ] Dashboard created
- [ ] Bounce/Complaint alerts active

### Step 9: Deploy Updated Backend
- [ ] Pull latest code (with email service)
- [ ] Set environment variables
- [ ] Restart backend service
- [ ] Check backend logs for SES connection ✅

### Step 10: Test Full Application Flow
- [ ] Test registration → OTP email received ✅
- [ ] Test forgot password → OTP email received ✅
- [ ] Test update email → OTP to new email ✅
- [ ] Test update password → OTP to current email ✅
- [ ] Test all 8 languages display correctly ✅

---

## 🔑 Important Values

```
AWS Region:              ap-southeast-2
Sender Email:            no-reply@catchtheten.com
Sender Name:             Catch The Ten
OTP Validity:            10 minutes
Max Attempts:            5
Max OTPs Per Email/Hour: 5
IAM User:                ses-backend-user
IAM Role:                Backend-SES-Role
```

---

## ⏱️ Timeline

| Step | Time | Notes |
|------|------|-------|
| 1-2 | 5 min | Quick if email, 24-48h if domain |
| 3 | 24 h | Wait for AWS approval |
| 4-5 | 10 min | Optional but recommended |
| 6 | 5 min | Set env variables |
| 7 | 5 min | Quick test |
| 8 | 10 min | Monitoring setup |
| 9 | 5 min | Deploy backend |
| 10 | 15 min | Full app testing |
| **Total** | **~2h** | Plus 24h wait for production access |

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Email not verified" | Verify in SES Console first |
| "In Sandbox mode" | Request production access |
| "Sending limit exceeded" | Request higher quota |
| "Emails to spam folder" | Add SPF/DKIM records |
| "Access Denied" | Check IAM permissions |
| "Can't connect to SES" | Verify credentials/IAM role |

---

## 📋 After Production Access Approved

- [ ] Verify status changed to "Production"
- [ ] Update backend environment if needed
- [ ] Restart backend service
- [ ] Re-test all flows (Step 10)
- [ ] Monitor CloudWatch metrics
- [ ] Announce feature to users

---

## 🎉 Success Indicators

✅ Email appears in inbox within 1-2 seconds  
✅ OTP codes valid for 10 minutes  
✅ Users can verify emails  
✅ Users can reset passwords  
✅ All 8 languages display correctly  
✅ No errors in CloudWatch logs  

---

## 📞 Need Help?

- AWS SES Docs: https://docs.aws.amazon.com/ses/
- Check CloudWatch Logs
- Review backend logs for errors
- Test via AWS CLI for connectivity

---

**Good luck with the setup! 🚀**
