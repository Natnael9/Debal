# Debal

## Overview

**Debal** is a platform that helps people find compatible roommates to rent a home together. It aims to make the roommate-finding process more secure, trustworthy, and efficient.

## Problem Statement

The major problems identified are:

- Home rental prices are continuously rising in Ethiopia.
- Existing methods of finding roommates through social media platforms are often unreliable and lack trust.
- People struggle to find roommates with compatible preferences and lifestyles online.

## Key Features

- User authentication
- Profile creation and preference setup
- Fayda authentication for enhanced security and trust
- Automatic matching of compatible profiles displayed on the home page
- Manual search for people based on specific preferences and characteristics
- Chat room for users who have been matched

## Quick Start with Docker (Recommended for Teammates)

To get the entire stack (Frontend, Backend API, MongoDB, Redis) running on any computer with Docker installed:

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd Debal
   ```

2. **Start all services**:
   ```bash
   docker compose up --build
   ```

3. **Access the application**:
   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:4001`
   - **MongoDB**: `localhost:27017`
   - **Redis**: `localhost:6379`

4. **Stop all services**:
   ```bash
   docker compose down
   ```

## Seed Admin Account

To seed the initial admin user inside the server container:
```bash
docker exec -it debal-server node modules/admin/seed-admin.js
```

## Team Information

**Classroom:** 5

| Name | CTC ID |
|------|---------|
| Natnael Ashenafi | CTC-897-26 |
| Natnael Sebhat | CTC-1708-26 |
| Nardos Haile | CTC-7685-26 |
| Robel Alemayehu | CTC-1067-26 |
| Natnael Abrha | CTC-2834-26 |
| Midaso Edasa | CTC-4752-26 |
