# RDS Snapshot Cleanup Tool

## Overview

This tool safely deletes old RDS snapshots to reduce AWS storage costs. It includes a dry-run mode to preview changes before actual deletion.

**Current cost issue:** Your `db10s-game-v3` instance has accumulated manual snapshots that cost ~$0.023/GB per month indefinitely. Over 3-6 months, this can add up to $5-20+/month in unnecessary costs.

## Installation

The script is already in this directory: `cleanup-rds-snapshots.sh`

### Prerequisites

1. **AWS CLI** installed: `aws --version`
2. **AWS credentials** configured: `aws configure` (or via IAM role)
3. **Bash** 4.0+ (standard on macOS/Linux)
4. **jq** installed (for JSON parsing): `brew install jq` (macOS) or `sudo apt install jq` (Linux)

## Quick Start

```bash
# Make sure you're in the backend/scripts directory
cd /Users/lokendracarpenter/Documents/Projects/10S/Back\ end/10S-backend/scripts

# Step 1: See what would be deleted (no changes made)
./cleanup-rds-snapshots.sh --dry-run

# Step 2: Review the list - decide on retention window (default: 30 days)
# Note the total storage that would be freed

# Step 3: Actually delete the snapshots
./cleanup-rds-snapshots.sh --retention-days 30 --force

# Step 4: Check the log file
cat rds-snapshot-cleanup-*.log
```

## Usage

```bash
./cleanup-rds-snapshots.sh [OPTIONS]

OPTIONS:
    --retention-days N      Keep snapshots newer than N days (default: 30)
    --dry-run              Show what would be deleted without actually deleting (default: enabled)
    --force                Actually delete snapshots (disables dry-run)
    --region REGION        AWS region (default: ap-southeast-2)
    --db-id DB_ID          RDS instance ID (default: db10s-game-v3)
    --help                 Show help message
```

## Examples

### 1. Preview what would be deleted (30-day retention)
```bash
./cleanup-rds-snapshots.sh --dry-run
```
Output shows:
- Number of snapshots to delete
- Snapshot names, ages, and sizes
- Total storage to be freed
- Log file location

### 2. Preview with shorter retention (7 days)
```bash
./cleanup-rds-snapshots.sh --retention-days 7 --dry-run
```

### 3. Actually delete snapshots (after reviewing dry-run)
```bash
./cleanup-rds-snapshots.sh --retention-days 30 --force
```
Script will:
1. List snapshots again
2. Ask "Are you sure?" (unless `--force` flag is used)
3. Delete each snapshot one by one
4. Show success/failure summary
5. Log all actions to a timestamped file

### 4. Verify deletion afterwards
```bash
./cleanup-rds-snapshots.sh --dry-run  # Should show "No snapshots found" or fewer snapshots
```

## Safety Features

✅ **Dry-run by default** — nothing is deleted unless you use `--force`  
✅ **Only deletes manual snapshots** — automated backups (7-day AWS standard) are untouched  
✅ **Age-based filtering** — keeps snapshots within retention window, deletes older ones  
✅ **Interactive confirmation** — asks "Are you sure?" before deleting (unless `--force` used)  
✅ **Detailed logging** — timestamped log file for audit trail  
✅ **Color-coded output** — easy to spot warnings and errors  
✅ **Error handling** — reports which snapshots failed to delete  

## Cost Impact

### Before & After (Example: 50GB database, 6 months of manual snapshots)

**Before cleanup:**
- Automated backup retention: 35 days (excessive)
- Manual snapshots: 6 months accumulated = 300GB stored
- **Monthly cost: ~$7.00 (backup excess) + $6.90 (snapshots) = $13.90**

**After cleanup (with this script + backup retention fix):**
- Automated backup retention: 7 days (AWS standard)
- Manual snapshots: kept only 30 days = ~50GB stored
- **Monthly cost: ~$0.00 (no backup excess) + $1.15 (snapshots) = $1.15**
- **Savings: ~$12.75/month ongoing** ✨

## Related Tasks

### Also complete (Tier 4.8a) — Reduce Backup Retention
This script handles manual snapshots, but you should also:

1. Go to AWS RDS Console
2. Select `db10s-game-v3` database
3. Click "Modify"
4. Change "Backup retention period" from **35** to **7** days
5. Click "Apply immediately"
6. This saves an additional ~$0.50-1.00/month

**Total potential savings from Tier 4.8: $5-20/month**

## Troubleshooting

### "AWS CLI is not installed"
```bash
# Install AWS CLI
brew install awscli  # macOS
# or
sudo apt install awscli  # Linux
# or
pip install awscli  # Python
```

### "AWS credentials not configured"
```bash
# Configure credentials
aws configure

# Enter:
# AWS Access Key ID: [your key]
# AWS Secret Access Key: [your secret]
# Default region: ap-southeast-2
# Default output format: json
```

### "jq command not found"
```bash
# Install jq for JSON parsing
brew install jq  # macOS
# or
sudo apt install jq  # Linux
```

### Script hangs or times out
- Check your internet connection
- Confirm AWS credentials are valid: `aws sts get-caller-identity`
- Try running with a different region: `./cleanup-rds-snapshots.sh --region ap-southeast-2`

### "Failed to delete: snapshot-name"
- Check if the snapshot is in use or locked
- Check AWS RDS console for any copy/restore operations in progress
- Review the log file for detailed error messages
- Wait a few minutes and retry

## Log Files

Every run creates a log file: `rds-snapshot-cleanup-YYYYMMDD-HHMMSS.log`

Example log entries:
```
2026-08-09 15:42:30 [ℹ️  INFO] Fetching snapshots for instance: db10s-game-v3 (region: ap-southeast-2)...
2026-08-09 15:42:31 [ℹ️  INFO] Found 8 snapshot(s) older than 30 days:
2026-08-09 15:42:31 [ℹ️  INFO] Total storage to be freed: 400 GB
2026-08-09 15:42:32 [⚠️  WARNING] DRY-RUN MODE: No snapshots will be deleted
2026-08-09 15:42:32 [ℹ️  INFO] To actually delete these snapshots, run: ./cleanup-rds-snapshots.sh --retention-days 30 --force
```

View logs:
```bash
cat rds-snapshot-cleanup-*.log          # View most recent log
cat rds-snapshot-cleanup-*.log | tail   # Last 20 lines
```

## Questions?

- **AWS RDS Snapshots:** https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateSnapshot.html
- **Backup retention:** https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html
- **Cost optimization:** https://aws.amazon.com/rds/cost-optimization/
