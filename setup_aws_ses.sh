#!/bin/bash

################################################################################
# AWS SES Setup Automation Script
# This script helps automate AWS SES configuration for Catch The Ten
# Usage: bash setup_aws_ses.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="ap-southeast-2"
SENDER_EMAIL="${SENDER_EMAIL:-no-reply@catchtheten.com}"
SENDER_NAME="${SENDER_NAME:-Catch The Ten}"
OTP_TTL_MINUTES="${OTP_TTL_MINUTES:-10}"
OTP_MAX_ATTEMPTS="${OTP_MAX_ATTEMPTS:-5}"
OTP_MAX_PER_EMAIL_PER_HOUR="${OTP_MAX_PER_EMAIL_PER_HOUR:-5}"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}==================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        echo "Install from: https://aws.amazon.com/cli/"
        exit 1
    fi
    print_success "AWS CLI found"
}

check_aws_credentials() {
    if ! aws sts get-caller-identity --region "$AWS_REGION" &> /dev/null; then
        print_error "AWS credentials not configured"
        echo "Run: aws configure"
        exit 1
    fi
    print_success "AWS credentials configured"
}

check_region() {
    local current_region=$(aws configure get region)
    if [ "$current_region" != "$AWS_REGION" ]; then
        print_warning "Current region is $current_region, will use $AWS_REGION for SES"
    fi
}

################################################################################
# Step 1: Verify Email/Domain
################################################################################

verify_email() {
    print_header "Step 1: Verify Sender Email"

    echo "Email to verify: $SENDER_EMAIL"
    read -p "Proceed with verification? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipped email verification"
        return
    fi

    # Check if already verified
    if aws ses get-identity-verification-attributes \
        --identities "$SENDER_EMAIL" \
        --region "$AWS_REGION" \
        --query "VerificationAttributes[0].VerificationStatus" \
        --output text 2>/dev/null | grep -q "Success"; then
        print_success "Email already verified: $SENDER_EMAIL"
        return
    fi

    # Verify email
    aws ses verify-email-identity \
        --email-address "$SENDER_EMAIL" \
        --region "$AWS_REGION" \
        --output json

    print_success "Verification request sent to $SENDER_EMAIL"
    print_info "Check your email and click the verification link"
    print_info "Verification link expires in 24 hours"
}

################################################################################
# Step 2: Create IAM User
################################################################################

create_iam_user() {
    print_header "Step 2: Create IAM User for SES"

    local iam_user="ses-backend-user"

    echo "IAM User name: $iam_user"
    read -p "Create IAM user? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipped IAM user creation"
        return
    fi

    # Check if user exists
    if aws iam get-user --user-name "$iam_user" &> /dev/null; then
        print_success "IAM user already exists: $iam_user"
        return
    fi

    # Create user
    print_info "Creating IAM user..."
    aws iam create-user --user-name "$iam_user"
    print_success "IAM user created: $iam_user"

    # Attach SES policy
    print_info "Attaching SES permissions..."
    aws iam attach-user-policy \
        --user-name "$iam_user" \
        --policy-arn "arn:aws:iam::aws:policy/AmazonSESFullAccess"
    print_success "SES permissions attached"
}

create_access_keys() {
    print_header "Step 3: Create Access Keys"

    local iam_user="ses-backend-user"

    echo "IAM User: $iam_user"
    read -p "Create access keys? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipped access key creation"
        return
    fi

    # Create access key
    print_info "Creating access key..."
    local key_output=$(aws iam create-access-key --user-name "$iam_user" --output json)

    local access_key_id=$(echo "$key_output" | jq -r '.AccessKey.AccessKeyId')
    local secret_access_key=$(echo "$key_output" | jq -r '.AccessKey.SecretAccessKey')

    print_success "Access key created"

    # Display credentials
    echo -e "\n${YELLOW}=== SAVE THESE CREDENTIALS ===${NC}"
    echo "Access Key ID:     $access_key_id"
    echo "Secret Access Key: $secret_access_key"
    echo "Region:            $AWS_REGION"
    echo -e "${YELLOW}=============================${NC}\n"

    # Offer to save to file
    read -p "Save to credentials file? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat > .env.ses << EOF
AWS_REGION=$AWS_REGION
AWS_ACCESS_KEY_ID=$access_key_id
AWS_SECRET_ACCESS_KEY=$secret_access_key
SES_SENDER_EMAIL=$SENDER_EMAIL
SES_SENDER_NAME=$SENDER_NAME
OTP_TTL_MINUTES=$OTP_TTL_MINUTES
OTP_MAX_ATTEMPTS=$OTP_MAX_ATTEMPTS
OTP_MAX_PER_EMAIL_PER_HOUR=$OTP_MAX_PER_EMAIL_PER_HOUR
EOF
        chmod 600 .env.ses
        print_success "Credentials saved to .env.ses (chmod 600)"
        print_warning "⚠️  NEVER commit .env.ses to git!"
    fi
}

################################################################################
# Step 4: Test Email Sending
################################################################################

test_ses_sending() {
    print_header "Step 4: Test Email Sending"

    read -p "Email address to receive test email: " test_email

    print_info "Sending test email to $test_email..."

    aws ses send-email \
        --from "$SENDER_EMAIL" \
        --to "$test_email" \
        --subject "AWS SES Test Email" \
        --text "This is a test email from AWS SES. If you received this, SES is working correctly!" \
        --region "$AWS_REGION" \
        --output json

    print_success "Test email sent!"
    print_info "Check $test_email for the email (may take 1-2 seconds)"
}

################################################################################
# Step 5: Check SES Quota
################################################################################

check_ses_quota() {
    print_header "Step 5: Check SES Sending Quota"

    print_info "Retrieving SES quota information..."

    local quota_info=$(aws ses get-account-sending-enabled --region "$AWS_REGION" --output json)
    local sandbox=$(echo "$quota_info" | jq -r '.Enabled')

    if [ "$sandbox" = "true" ]; then
        print_success "SES is ENABLED (Production Access)"
    else
        print_warning "SES is in SANDBOX mode (limited sending)"
        echo "To enable production: Go to AWS SES Console → Account dashboard → Request production access"
    fi

    # Get sending stats
    print_info "\nChecking 24-hour sending statistics..."
    local stats=$(aws ses get-send-statistics --region "$AWS_REGION" --output json)

    if [ "$(echo "$stats" | jq '.SendDataPoints | length')" -gt 0 ]; then
        local bounces=$(echo "$stats" | jq '.SendDataPoints | add.Bounces')
        local complaints=$(echo "$stats" | jq '.SendDataPoints | add.Complaints')
        local sends=$(echo "$stats" | jq '.SendDataPoints | add.Sends')

        echo "Total sends (24h):     $sends"
        echo "Total bounces (24h):   $bounces"
        echo "Total complaints (24h): $complaints"
    else
        print_info "No sending statistics yet"
    fi
}

################################################################################
# Step 6: Create CloudWatch Alarms
################################################################################

create_cloudwatch_alarms() {
    print_header "Step 6: Setup CloudWatch Alarms (Optional)"

    read -p "Setup CloudWatch alarms? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipped CloudWatch alarm setup"
        return
    fi

    read -p "SNS Topic ARN for notifications (or press Enter to skip): " sns_topic

    if [ -z "$sns_topic" ]; then
        print_warning "Skipped alarm configuration"
        return
    fi

    # Create bounce alarm
    print_info "Creating bounce rate alarm..."
    aws cloudwatch put-metric-alarm \
        --alarm-name "SES-High-Bounce-Rate" \
        --alarm-description "Alert if SES bounce rate is high" \
        --metric-name Bounce \
        --namespace AWS/SES \
        --statistic Sum \
        --period 3600 \
        --threshold 50 \
        --comparison-operator GreaterThanThreshold \
        --alarm-actions "$sns_topic" \
        --region "$AWS_REGION"

    print_success "Alarm created: SES-High-Bounce-Rate"
}

################################################################################
# Step 7: Generate Environment File
################################################################################

generate_env_file() {
    print_header "Step 7: Generate Environment File"

    read -p "Generate .env file for backend? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipped .env generation"
        return
    fi

    cat > .env.backend << EOF
# AWS SES Configuration
AWS_REGION=$AWS_REGION
SES_SENDER_EMAIL=$SENDER_EMAIL
SES_SENDER_NAME=$SENDER_NAME

# OTP Configuration
OTP_TTL_MINUTES=$OTP_TTL_MINUTES
OTP_MAX_ATTEMPTS=$OTP_MAX_ATTEMPTS
OTP_MAX_PER_EMAIL_PER_HOUR=$OTP_MAX_PER_EMAIL_PER_HOUR
OTP_HASH_SECRET=\${JWT_SECRET_KEY}

# Note: If using IAM Role on EC2, AWS credentials are provided by the role
# If using access keys, add these:
# AWS_ACCESS_KEY_ID=your-key-here
# AWS_SECRET_ACCESS_KEY=your-secret-here
EOF

    chmod 600 .env.backend
    print_success "Generated .env.backend (chmod 600)"
    print_warning "⚠️  NEVER commit .env.backend to git!"
    print_info "Update with your actual values before deploying"
}

################################################################################
# Step 8: Verify DNS Records (Domain)
################################################################################

verify_dns_records() {
    print_header "Step 8: Verify DNS Records (if using Domain)"

    echo "If you verified a DOMAIN (not just email), check DNS propagation:"
    echo ""
    echo "1. Go to AWS SES Console → Verified identities"
    echo "2. Select your domain"
    echo "3. Copy the 3 CNAME records"
    echo "4. Add them to your domain registrar's DNS"
    echo "5. Wait 24-48 hours for propagation"
    echo ""
    echo "To check DKIM status:"
    read -p "Domain to check (press Enter to skip): " domain_to_check

    if [ -n "$domain_to_check" ]; then
        print_info "Checking DKIM status for $domain_to_check..."
        aws ses get-identity-dkim-attributes \
            --identities "$domain_to_check" \
            --region "$AWS_REGION" \
            --output table
    fi
}

################################################################################
# Main Menu
################################################################################

show_menu() {
    print_header "AWS SES Setup Automation Tool"

    echo "Select steps to run:"
    echo ""
    echo "  1) Check prerequisites"
    echo "  2) Verify sender email"
    echo "  3) Create IAM user"
    echo "  4) Create access keys"
    echo "  5) Test email sending"
    echo "  6) Check SES quota"
    echo "  7) Setup CloudWatch alarms"
    echo "  8) Generate .env file"
    echo "  9) Verify DNS records"
    echo " 10) Run all steps"
    echo "  0) Exit"
    echo ""
    read -p "Enter your choice (1-10, 0): " choice
}

run_all_steps() {
    check_aws_cli
    check_aws_credentials
    check_region
    verify_email
    create_iam_user
    create_access_keys
    test_ses_sending
    check_ses_quota
    create_cloudwatch_alarms
    generate_env_file
    verify_dns_records
}

################################################################################
# Main Script
################################################################################

main() {
    print_header "AWS SES Setup for Catch The Ten"

    # Show configuration
    echo "Configuration:"
    echo "  Region:           $AWS_REGION"
    echo "  Sender Email:     $SENDER_EMAIL"
    echo "  Sender Name:      $SENDER_NAME"
    echo ""

    while true; do
        show_menu

        case $choice in
            1) check_aws_cli; check_aws_credentials; check_region ;;
            2) verify_email ;;
            3) create_iam_user ;;
            4) create_access_keys ;;
            5) test_ses_sending ;;
            6) check_ses_quota ;;
            7) create_cloudwatch_alarms ;;
            8) generate_env_file ;;
            9) verify_dns_records ;;
            10) run_all_steps ;;
            0) print_success "Exiting..."; exit 0 ;;
            *) print_error "Invalid option" ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
