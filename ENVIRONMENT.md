# Environment Configuration

This project uses environment variables for configuration. Follow these steps to set up your environment:

## 1. Copy the Example Environment File
```bash
cp .env.example .env.local
```

## 2. Fill in Your Environment Variables
Edit `.env.local` with your actual values:

```bash
# Database Configuration
DATABASE_URL=postgresql://banking:banking123@database:5432/banking_customer

# PostgreSQL Database Settings (for docker-compose)
POSTGRES_USER=banking
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=banking_customer

# CDP Configuration  
NEXT_PUBLIC_CDP_WRITEKEY=your_actual_cdp_writekey
NEXT_PUBLIC_CDP_ENDPOINT=https://your-actual-cdp-endpoint.com

# HCL Interact Configuration
NEXT_PUBLIC_INTERACT_ENDPOINT=your_interact_endpoint

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id

# Discover Script Configuration
NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT=/js/discover.js
```

## 3. Docker Compose Usage

The docker-compose.yml file now uses environment variables instead of hardcoded secrets. Make sure your `.env.local` file is properly configured before running:

```bash
# Load environment variables and start containers
docker-compose --env-file .env.local up --build -d
```

## Security Notes

- ✅ **Never commit** `.env.local` or any file containing actual secrets
- ✅ **Always use** `.env.example` as a template
- ✅ **Environment variables** are now used in docker-compose.yml
- ✅ **Secrets are excluded** from version control via .gitignore

## Production Deployment

For production deployments (like Fly.io), set environment variables through the platform's dashboard or CLI rather than in files.
