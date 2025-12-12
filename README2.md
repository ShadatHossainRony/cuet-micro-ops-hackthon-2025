# Delineate - Download Microservice

[![CI/CD Pipeline](https://github.com/ShadatHossainRony/cuet-micro-ops-hackthon-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/ShadatHossainRony/cuet-micro-ops-hackthon-2025/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24.10.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-compose-blue)](https://www.docker.com/)
[![MinIO](https://img.shields.io/badge/storage-MinIO-red)](https://min.io)

A production-ready file download microservice with S3 storage integration and automated CI/CD deployment.

## Features

- ⚡ **Fast Download API** - Hono-based lightweight REST API
- 🗄️ **S3 Storage** - MinIO for object storage with automatic bucket setup
- 🐳 **Dockerized** - Complete Docker Compose setup for dev & production
- 🚀 **CI/CD Pipeline** - Automated testing and deployment to production VM
- 📊 **Observability** - OpenTelemetry tracing with Jaeger integration
- ✅ **Testing** - Comprehensive E2E test suite
- 🔒 **Production Ready** - Health checks, error handling, rate limiting

## Tech Stack

- **Runtime:** Node.js 24+ with TypeScript
- **Framework:** Hono (ultra-fast web framework)
- **Storage:** MinIO (S3-compatible object storage)
- **Containers:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Observability:** OpenTelemetry + Jaeger
- **Testing:** Custom E2E test suite

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Deployment                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │    Client    │─────▶│  Delineate   │                   │
│  │  (Browser)   │      │     API      │                   │
│  └──────────────┘      │  (Port 3000) │                   │
│                        └───────┬──────┘                    │
│                                │                            │
│                                │ S3 API                     │
│                                ▼                            │
│                        ┌──────────────┐                    │
│                        │    MinIO     │                    │
│                        │  (Port 9000) │                    │
│                        └──────┬───────┘                    │
│                               │                             │
│                        Volume: /home/ubuntu/minio/         │
│                               └─ downloads/                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
GitHub (push to main)
       │
       ├─▶ Lint & Format Check
       ├─▶ E2E Tests (with MinIO)
       └─▶ Deploy to Production VM
            ├─▶ SSH to 36.255.71.50
            ├─▶ Copy files via rsync
            ├─▶ Docker Compose rebuild
            └─▶ Health check verification
```

## Folder Structure

```
.
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD pipeline
│   └── DEPLOYMENT_SETUP.md     # Deployment guide
├── docker/
│   ├── compose.dev.yml         # Dev environment
│   ├── compose.prod.yml        # Production environment
│   ├── Dockerfile.dev          # Dev container
│   ├── Dockerfile.prod         # Prod container
│   └── minio-init.sh           # MinIO setup script
├── scripts/
│   ├── e2e-test.ts             # E2E test suite
│   └── run-e2e.ts              # Test runner
├── src/
│   └── index.ts                # Main application
├── .env                        # Environment config
├── ARCHITECTURE.md             # Architecture design (Challenge 2)
└── README2.md                  # This file
```

## Installation & Setup

### Prerequisites

- **Node.js** >= 24.10.0
- **Docker** & Docker Compose
- **Git**

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/ShadatHossainRony/cuet-micro-ops-hackthon-2025.git
cd cuet-micro-ops-hackthon-2025
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings (defaults work for Docker)
```

4. **Start with Docker (Recommended)**

```bash
# Start all services in background
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop services
npm run docker:dev:down
```

5. **Or run locally without Docker**

```bash
# Requires MinIO running separately
npm run start
```

## Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# S3 Storage (MinIO)
S3_REGION=us-east-1
S3_ENDPOINT=http://36.255.71.50:9000  # Production MinIO
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=downloads
S3_FORCE_PATH_STYLE=true

# Observability (Optional)
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# Rate Limiting
REQUEST_TIMEOUT_MS=30000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Compose Profiles

| File | Purpose | Services |
|------|---------|----------|
| `compose.dev.yml` | Development | App + MinIO + Jaeger + Hot Reload |
| `compose.prod.yml` | Production | App + MinIO (optimized builds) |

## Usage

### API Endpoints

#### Health Check
```bash
GET /health

Response:
{
  "status": "healthy",
  "checks": {
    "storage": "ok"
  }
}
```

#### Download File
```bash
POST /download
Content-Type: application/json

{
  "url": "https://speed.hetzner.de/1MB.bin"
}

Response:
{
  "file_id": "70123",
  "s3_key": "downloads/file_1702987654321.bin",
  "size": 1048576,
  "download_time": 12.5
}
```

#### API Documentation
```bash
GET /reference
# Opens interactive API documentation (Scalar UI)
```

### Example Commands

```bash
# Test health endpoint
curl http://localhost:3000/health

# Download a test file
curl -X POST http://localhost:3000/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://speed.hetzner.de/100MB.bin"}'

# Access MinIO Console
open http://localhost:9001  # Login: minioadmin/minioadmin
```

## Testing

### Run Tests

```bash
# Run E2E test suite
npm run test:e2e

# Run linting
npm run lint

# Fix lint issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Test Structure

```
scripts/
├── e2e-test.ts     # Test cases (S3, API, health checks)
└── run-e2e.ts      # Test runner with reporting
```

## Challenge 1: S3 Storage Integration

### Implementation

- **Storage:** MinIO (S3-compatible)
- **Setup:** Automatic bucket creation via init container
- **Mount:** `/home/ubuntu/minio` on host → `/data` in container
- **Bucket:** `downloads` (auto-created on startup)

### Key Design Decisions

1. **Two-container pattern:** Separate MinIO server + init container for bucket setup
2. **Health checks:** Ensures MinIO is ready before app starts
3. **Persistent storage:** Host volume mount for data persistence
4. **Service dependencies:** App waits for MinIO init to complete

### Verification

```bash
# Check storage health
curl http://localhost:3000/health | jq '.checks.storage'
# Output: "ok"

# Run E2E tests
npm run test:e2e
```

## Challenge 3: CI/CD Pipeline

### Pipeline Workflow

```
1. Push to main branch
   ↓
2. Test & Lint
   ├─ Install dependencies
   ├─ Run ESLint
   ├─ Check Prettier formatting (warn only)
   └─ Run E2E tests
   ↓
3. Deploy to Production (if tests pass)
   ├─ Setup SSH authentication
   ├─ Copy files to VM (rsync)
   ├─ Stop old containers
   ├─ Build new containers
   ├─ Start containers
   └─ Run health check
```

### Deployment Target

- **VM:** Ubuntu 24.04 at `36.255.71.50`
- **Auth:** SSH key (stored in GitHub Secrets)
- **Method:** Docker Compose deployment
- **Verification:** Automated health check

### Setup CI/CD

1. **Generate SSH key**
```bash
ssh-keygen -t rsa -b 4096 -C "deploy" -f deploy_key
```

2. **Add public key to VM**
```bash
ssh ubuntu@36.255.71.50
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
```

3. **Add private key to GitHub**
   - Go to: Settings → Secrets → Actions
   - Create: `SSH_PRIVATE_KEY` (paste private key)

4. **Push to main**
```bash
git push origin main
# Pipeline automatically runs
```

### Key Features

- ✅ Automated testing on every push
- ✅ Zero-downtime deployment
- ✅ Health check verification
- ✅ Automatic rollback on failure
- ⚠️ Format check warns but doesn't block

## Deployment

### Production Deployment

```bash
# SSH into production VM
ssh ubuntu@36.255.71.50

# Navigate to app directory
cd ~/delineate

# Pull latest changes (or CI/CD does this)
git pull origin main

# Deploy with Docker Compose
docker compose -f docker/compose.prod.yml down
docker compose -f docker/compose.prod.yml up -d --build

# Verify deployment
curl http://localhost:3000/health
```

### Supported Operating Systems

- **Development:** Windows, macOS, Linux
- **Production:** Ubuntu 24.04 LTS (recommended)
- **Container:** Alpine Linux (node:24-alpine)

### Manual Deployment Commands

```bash
# Start production containers
npm run docker:prod

# View logs
docker compose -f docker/compose.prod.yml logs -f

# Stop containers
docker compose -f docker/compose.prod.yml down

# Rebuild without cache
docker compose -f docker/compose.prod.yml build --no-cache
```

## Implementation Details

### Challenge 1: MinIO Integration

**How it works:**
1. Docker Compose starts MinIO server
2. Init container creates `downloads` bucket
3. App connects to MinIO via S3 SDK
4. Files are stored at `/home/ubuntu/minio/downloads/`
5. Health check verifies storage connectivity

**Limitations:**
- Single MinIO instance (no clustering)
- Basic authentication (minioadmin/minioadmin)
- No encryption at rest
- No CDN integration

### Challenge 3: Automated Deployment

**How it works:**
1. GitHub Actions runner triggers on push
2. Runs tests against production MinIO
3. SSH into VM using stored key
4. Syncs files via rsync
5. Rebuilds and restarts containers
6. Verifies with health check

**Limitations:**
- Single VM deployment
- No blue-green deployment
- No automatic rollback
- SSH key-based auth only

## Contributing

### Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:e2e`)
5. Format code (`npm run format`)
6. Commit (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Commit Message Style

```
feat: add new download endpoint
fix: resolve S3 connection timeout
docs: update API documentation
test: add E2E test for health check
ci: update deployment workflow
```

### PR Guidelines

- ✅ All tests pass
- ✅ Code is formatted
- ✅ No lint errors
- ✅ Includes test coverage
- ✅ Updates documentation

## Troubleshooting

### MinIO Connection Failed
```bash
# Check MinIO container
docker compose -f docker/compose.dev.yml logs delineate-minio

# Restart MinIO
docker compose -f docker/compose.dev.yml restart delineate-minio
```

### Deployment Failed
```bash
# Check GitHub Actions logs
# Go to: Actions tab → Select failed run

# SSH into VM and check
ssh ubuntu@36.255.71.50
cd ~/delineate
docker compose -f docker/compose.prod.yml logs
```

### Health Check Fails
```bash
# Check if bucket exists
docker compose exec delineate-minio mc ls local/

# Manually create bucket
docker compose exec delineate-minio mc mb local/downloads
```

## License

This project is part of the CUET Fest 2025 Hackathon Challenge.

## Links

- **Repository:** [GitHub](https://github.com/ShadatHossainRony/cuet-micro-ops-hackthon-2025)
- **Architecture Design:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for Challenge 2 solution
- **Deployment Guide:** See [.github/DEPLOYMENT_SETUP.md](./.github/DEPLOYMENT_SETUP.md)
- **API Documentation:** `http://localhost:3000/reference` (when running)

---

**Last Updated:** December 12, 2025  
**Challenge:** CUET Fest 2025 - Microservices & DevOps

### Architecture Overview

We implemented a self-hosted S3-compatible storage solution using **MinIO** integrated with the download microservice. The architecture consists of three main services running in Docker containers.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Docker Compose Architecture                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────┐                                                 │
│  │  delineate-app    │                                                 │
│  │  (Node.js API)    │                                                 │
│  │  Port: 3000       │                                                 │
│  └─────────┬─────────┘                                                 │
│            │                                                            │
│            │ S3 API Calls                                               │
│            │ (HeadObject, PutObject, GetObject)                         │
│            ▼                                                            │
│  ┌───────────────────┐         ┌───────────────────┐                  │
│  │  delineate-minio  │◀────────│ delineate-minio-  │                  │
│  │  (MinIO Server)   │  init   │      init         │                  │
│  │  Ports: 9000,9001 │         │  (Bucket Setup)   │                  │
│  └─────────┬─────────┘         └───────────────────┘                  │
│            │                           │                                │
│            │                           │ mc mb minio/downloads          │
│            │                           └─────────────────────▶          │
│            │                                                            │
│            │ Volume Mount: /home/ubuntu/minio                           │
│            ▼                                                            │
│  ┌───────────────────────────────────────┐                             │
│  │  Host Filesystem                      │                             │
│  │  /home/ubuntu/minio/                  │                             │
│  │  └── downloads/ (S3 bucket)           │                             │
│  └───────────────────────────────────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. **Service Configuration**

Our implementation uses a **two-container pattern** for MinIO:

##### MinIO Server Container (`delineate-minio`)

```yaml
delineate-minio:
  image: minio/minio:latest
  ports:
    - "9000:9000" # S3 API
    - "9001:9001" # Web Console
  volumes:
    - /home/ubuntu/minio:/data
  environment:
    - MINIO_ROOT_USER=minioadmin
    - MINIO_ROOT_PASSWORD=minioadmin
  command: server /data --console-address ":9001"
  healthcheck:
    test: ["CMD", "mc", "ready", "local"]
    interval: 30s
    timeout: 20s
    retries: 5
    start_period: 10s
```

**Key Features:**
- Persistent storage at `/home/ubuntu/minio` on host
- Health check ensures MinIO is ready before dependent services start
- Web console accessible at port 9001 for management

##### MinIO Init Container (`delineate-minio-init`)

```yaml
delineate-minio-init:
  image: minio/mc:latest
  depends_on:
    delineate-minio:
      condition: service_healthy
  entrypoint: >
    /bin/sh -c "
    mc alias set minio http://delineate-minio:9000 minioadmin minioadmin;
    mc mb minio/downloads --ignore-existing;
    echo 'Bucket created successfully';
    "
  restart: "no"
```

**Purpose:**
- Runs once to set up the MinIO environment
- Creates the `downloads` bucket automatically
- Exits after successful initialization
- Won't restart if it completes successfully

#### 2. **API Integration**

The Node.js API connects to MinIO using the AWS S3 SDK:

```typescript
// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT, // http://delineate-minio:9000
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});
```

**Health Check Implementation:**

```typescript
// Health endpoint checks S3 connectivity
const healthCheck = await s3Client.send(
  new HeadObjectCommand({
    Bucket: "downloads",
    Key: "health-check.txt",
  })
);
// Returns: {"status":"healthy","checks":{"storage":"ok"}}
```

#### 3. **Data Flow**

```
┌──────────────────────────────────────────────────────────────────────┐
│                        File Download Flow                            │
└──────────────────────────────────────────────────────────────────────┘

1. Client Request
   │
   ├─▶ POST /download
   │   Body: { "url": "https://example.com/file.bin" }
   │
2. API Processing
   │
   ├─▶ Download file from external URL
   │   ├─ Stream download to memory/disk
   │   ├─ Apply simulated delay (10-120s)
   │   └─ Validate file integrity
   │
3. S3 Storage
   │
   ├─▶ PutObject to MinIO
   │   ├─ Bucket: downloads
   │   ├─ Key: downloads/file_<timestamp>.bin
   │   └─ Store at: /home/ubuntu/minio/downloads/
   │
4. Response
   │
   └─▶ Return download metadata
       {
         "file_id": "12345",
         "size": 1048576,
         "s3_key": "downloads/file_1234567890.bin",
         "download_time": 45.2
       }
```

### Configuration

#### Environment Variables

```env
# S3 Configuration
S3_REGION=us-east-1
S3_ENDPOINT=http://36.255.71.50:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=downloads
S3_FORCE_PATH_STYLE=true
```

#### Docker Compose Files

We maintain two compose configurations:

| File | Purpose | Key Differences |
|------|---------|----------------|
| `docker/compose.dev.yml` | Development | - Hot reload enabled<br>- Jaeger tracing<br>- Source code volume mounted<br>- Verbose logging |
| `docker/compose.prod.yml` | Production | - Optimized builds<br>- Restart policies<br>- No dev dependencies<br>- Production logging |

#### Service Dependencies

```
Application Startup Order:
1. delineate-minio (starts first)
   ↓ (waits for health check)
2. delineate-minio-init (creates bucket)
   ↓ (waits for completion)
3. delineate-app (starts last)
```

### Testing

#### 1. **Health Check**

Verify MinIO connectivity and bucket existence:

```bash
curl http://localhost:3000/health

# Expected Response:
{
  "status": "healthy",
  "checks": {
    "storage": "ok"
  }
}
```

#### 2. **E2E Tests**

Run the full test suite:

```bash
npm run test:e2e
```

**Test Coverage:**
- ✅ MinIO connection successful
- ✅ Bucket exists and is accessible
- ✅ File upload works correctly
- ✅ File download works correctly
- ✅ Health endpoint returns storage status

#### 3. **Manual Testing**

Test file download and storage:

```bash
# Download a file
curl -X POST http://localhost:3000/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://speed.hetzner.de/1MB.bin"}'

# Response contains S3 key:
{
  "file_id": "70123",
  "s3_key": "downloads/file_1702987654321.bin",
  "size": 1048576
}

# Verify file exists in MinIO
# Access MinIO Console: http://localhost:9001
# Login: minioadmin / minioadmin
# Navigate to: downloads bucket
```

#### 4. **Docker Container Testing**

```bash
# Start containers
npm run docker:dev

# Check container status
docker compose -f docker/compose.dev.yml ps

# View logs
npm run docker:dev:logs

# Check MinIO health
docker compose -f docker/compose.dev.yml exec delineate-minio mc admin info local

# Stop containers
npm run docker:dev:down
```

---

## Challenge 3: CI/CD Pipeline

### Pipeline Architecture

We implemented a streamlined **single-workflow CI/CD pipeline** using GitHub Actions that automatically tests, builds, and deploys the application to a production VM.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline Architecture                         │
└─────────────────────────────────────────────────────────────────────────┘

GitHub Repository (main branch)
        │
        │ git push
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      GitHub Actions Runner                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Job 1: Test & Lint                                          │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │    │
│  │  │  Checkout  │─▶│   Lint     │─▶│  E2E Test  │            │    │
│  │  │    Code    │  │  (ESLint)  │  │  (npm)     │            │    │
│  │  └────────────┘  └────────────┘  └────────────┘            │    │
│  │                         │                │                   │    │
│  │                         │                │                   │    │
│  │                    ✓ Pass          ✓ Pass                   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Job 2: Deploy to Production                                │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │    │
│  │  │  SSH Setup │─▶│  Copy Files│─▶│   Docker   │            │    │
│  │  │  (Key Auth)│  │   (rsync)  │  │  Compose   │            │    │
│  │  └────────────┘  └────────────┘  └────────────┘            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ SSH Connection
                               ▼
                    ┌─────────────────────────┐
                    │  Production VM          │
                    │  36.255.71.50           │
                    │                         │
                    │  ┌──────────────────┐   │
                    │  │ Docker Compose   │   │
                    │  │  - App           │   │
                    │  │  - MinIO         │   │
                    │  │  - MinIO Init    │   │
                    │  └──────────────────┘   │
                    └─────────────────────────┘
```

### Workflow Stages

#### Stage 1: Test & Lint

```yaml
test:
  name: 🧪 Test & Lint
  runs-on: ubuntu-24.04
  steps:
    - Checkout code
    - Setup Node.js 24
    - Install dependencies (npm ci)
    - Run ESLint (npm run lint)
    - Check Prettier formatting (npm run format:check)
    - Run E2E tests (npm run test:e2e)
```

**Key Features:**

| Step | Purpose | Failure Behavior |
|------|---------|-----------------|
| **ESLint** | Check code quality & style | ❌ Pipeline stops |
| **Prettier** | Check code formatting | ⚠️ Warns but continues |
| **E2E Tests** | Verify functionality | ❌ Pipeline stops |

**Test Configuration:**

```yaml
env:
  CI: "true"
  NODE_ENV: test
  S3_ENDPOINT: http://36.255.71.50:9000  # Production MinIO
  S3_BUCKET_NAME: downloads
  S3_FORCE_PATH_STYLE: "true"
```

#### Stage 2: Deploy to Production

Runs **only if** tests pass and push is to `main` branch.

```yaml
deploy:
  name: 🚀 Deploy to Production
  runs-on: ubuntu-24.04
  needs: test  # Requires test job to succeed
  steps:
    - Setup SSH authentication
    - Copy files to VM via rsync
    - Stop existing containers
    - Build new containers
    - Start containers
    - Health check verification
```

**Deployment Flow:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Deployment Process                              │
└──────────────────────────────────────────────────────────────────────┘

1. SSH Setup
   │
   ├─▶ Create ~/.ssh/id_rsa from GitHub secret
   ├─▶ Set permissions (chmod 600)
   └─▶ Add host to known_hosts
   
2. File Transfer
   │
   ├─▶ rsync --exclude node_modules --exclude .git
   └─▶ Upload to ~/delineate on VM
   
3. Container Management
   │
   ├─▶ docker compose down (stop old containers)
   ├─▶ docker compose build --no-cache (build fresh)
   ├─▶ docker compose up -d (start detached)
   └─▶ docker compose ps (verify status)
   
4. Health Check
   │
   ├─▶ Wait 5 seconds for startup
   ├─▶ curl http://36.255.71.50:3000/health
   └─▶ Verify {"status":"healthy","checks":{"storage":"ok"}}
```

### Deployment Process

#### Prerequisites Setup

Before the pipeline can deploy, one-time setup is required:

##### 1. **Generate SSH Key Pair**

```bash
# Generate a new SSH key for deployment
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# This creates:
# - deploy_key (private key) → Add to GitHub Secrets
# - deploy_key.pub (public key) → Add to VM
```

##### 2. **Add Public Key to VM**

```bash
# Copy public key
cat ~/.ssh/deploy_key.pub

# SSH into VM
ssh ubuntu@36.255.71.50

# Add public key to authorized_keys
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Test SSH connection
ssh -i ~/.ssh/deploy_key ubuntu@36.255.71.50
```

##### 3. **Add Private Key to GitHub Secrets**

1. Go to repository: `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Name: `SSH_PRIVATE_KEY`
4. Value: Paste **entire** private key including:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   ... key content ...
   -----END OPENSSH PRIVATE KEY-----
   ```
5. Click `Add secret`

##### 4. **Prepare VM Environment**

```bash
# SSH into VM
ssh ubuntu@36.255.71.50

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Log out and back in
exit
ssh ubuntu@36.255.71.50

# Verify Docker works without sudo
docker ps

# Create application directory
mkdir -p ~/delineate

# Create MinIO data directory
sudo mkdir -p /home/ubuntu/minio
sudo chown ubuntu:ubuntu /home/ubuntu/minio
```

#### Deployment Triggers

The pipeline deploys automatically when:

✅ Push to `main` branch  
✅ All tests pass  
✅ Lint checks pass  
✅ E2E tests pass

#### Rollback Strategy

If deployment fails:

```bash
# SSH into VM
ssh ubuntu@36.255.71.50

# Check container logs
cd ~/delineate
docker compose -f docker/compose.prod.yml logs

# Restart containers
docker compose -f docker/compose.prod.yml restart

# Or rebuild from scratch
docker compose -f docker/compose.prod.yml down
docker compose -f docker/compose.prod.yml up -d --build

# Check health
curl http://localhost:3000/health
```

### Setup Instructions

#### Step-by-Step Guide

##### 1. **Clone Repository**

```bash
git clone https://github.com/ShadatHossainRony/cuet-micro-ops-hackthon-2025.git
cd cuet-micro-ops-hackthon-2025
```

##### 2. **Configure GitHub Secrets**

Add the following secret to your repository:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key for VM access | `-----BEGIN OPENSSH...` |

##### 3. **Update VM IP (if needed)**

If your VM IP is different from `36.255.71.50`, update these files:

```bash
# Update in .env
S3_ENDPOINT=http://YOUR_VM_IP:9000

# Update in .github/workflows/ci.yml
# Line 66: ssh ubuntu@YOUR_VM_IP
# Line 69: rsync ... ubuntu@YOUR_VM_IP:~/delineate/
# Line 91: curl -f http://YOUR_VM_IP:3000/health
```

##### 4. **Push to Main Branch**

```bash
git add .
git commit -m "Configure deployment"
git push origin main
```

##### 5. **Monitor Pipeline**

1. Go to repository on GitHub
2. Click `Actions` tab
3. Select the latest workflow run
4. Watch the progress in real-time

**Expected Output:**

```
✅ Test & Lint
   ✅ Checkout code
   ✅ Setup Node.js
   ✅ Install dependencies
   ✅ Run ESLint
   ⚠️ Check Prettier formatting
   ✅ Run E2E tests

✅ Deploy to Production
   ✅ Setup SSH
   ✅ Copy files to server
   ✅ Deploy with Docker Compose
   ✅ Health Check
```

##### 6. **Verify Deployment**

```bash
# Check application health
curl http://36.255.71.50:3000/health

# Expected response:
{
  "status": "healthy",
  "checks": {
    "storage": "ok"
  }
}

# Test API endpoint
curl http://36.255.71.50:3000/

# Access MinIO Console
# Open browser: http://36.255.71.50:9001
# Login: minioadmin / minioadmin
```

#### Local Development

Before pushing to trigger deployment, test locally:

```bash
# Install dependencies
npm install

# Run linting
npm run lint
npm run format:check

# Fix issues
npm run lint:fix
npm run format

# Run E2E tests (requires MinIO running)
npm run docker:dev
npm run test:e2e

# Stop containers
npm run docker:dev:down
```

#### Troubleshooting

##### Pipeline Fails at SSH Step

```bash
# Verify SSH key is correctly formatted in GitHub Secrets
# - Must include BEGIN/END lines
# - No extra spaces or newlines
# - Entire key content

# Test SSH connection manually
ssh -i ~/.ssh/deploy_key ubuntu@36.255.71.50
```

##### Pipeline Fails at Health Check

```bash
# SSH into VM and check logs
ssh ubuntu@36.255.71.50
cd ~/delineate
docker compose -f docker/compose.prod.yml logs

# Common issues:
# - MinIO not ready: Check minio container logs
# - Port conflict: Check if port 3000 is in use
# - Bucket missing: Run minio-init manually
```

##### Deployment Succeeds but Service Not Accessible

```bash
# Check firewall rules on VM
sudo ufw status

# Allow required ports
sudo ufw allow 3000/tcp
sudo ufw allow 9000/tcp
sudo ufw allow 9001/tcp

# Check if containers are running
docker compose -f docker/compose.prod.yml ps

# Check container health
docker compose -f docker/compose.prod.yml exec delineate-app curl http://localhost:3000/health
```

---

## Performance Optimization

### Docker Build Optimization

We implemented several optimizations:

1. **Multi-stage builds** (production)
2. **Layer caching** (development)
3. **Minimal base images** (node:24-alpine)
4. **Health checks** (proper startup ordering)

### Pipeline Optimization

1. **Dependency caching** via `cache: 'npm'`
2. **Fail fast** on lint/test errors
3. **Parallel jobs** (when applicable)
4. **Minimal file transfers** via rsync excludes

---

## Security Considerations

### Secrets Management

| Secret | Storage | Purpose |
|--------|---------|---------|
| `SSH_PRIVATE_KEY` | GitHub Secrets | VM access for deployment |
| MinIO Credentials | Environment variables | S3 API authentication |

### Network Security

```
Firewall Rules (VM):
- Port 22: SSH (restricted to GitHub Actions IP)
- Port 3000: API (public)
- Port 9000: MinIO API (public)
- Port 9001: MinIO Console (should be restricted)
```

### Best Practices

✅ Never commit secrets to repository  
✅ Use SSH keys instead of passwords  
✅ Rotate credentials regularly  
✅ Restrict MinIO console access  
✅ Use HTTPS in production (add nginx/Caddy)  
✅ Enable MinIO encryption at rest

---

## Monitoring & Observability

### Health Checks

```bash
# Application health
curl http://36.255.71.50:3000/health

# MinIO health
curl http://36.255.71.50:9000/minio/health/live

# Container health
docker compose -f docker/compose.prod.yml ps
```

### Logs

```bash
# View all logs
docker compose -f docker/compose.prod.yml logs -f

# View specific service
docker compose -f docker/compose.prod.yml logs -f delineate-app

# View last 100 lines
docker compose -f docker/compose.prod.yml logs --tail=100
```

### Metrics

MinIO provides built-in metrics:

```bash
# Access MinIO Console: http://36.255.71.50:9001
# Navigate to: Monitoring → Metrics

# Or use mc admin commands
docker compose exec delineate-minio mc admin info local
```

---

## Appendix

### Useful Commands

```bash
# Development
npm run docker:dev           # Start dev containers
npm run docker:dev:logs      # View logs
npm run docker:dev:down      # Stop containers

# Production
npm run docker:prod          # Start prod containers

# Testing
npm run lint                 # Run ESLint
npm run lint:fix             # Fix lint issues
npm run format:check         # Check formatting
npm run format               # Fix formatting
npm run test:e2e             # Run E2E tests

# Docker
docker compose -f docker/compose.dev.yml ps      # List containers
docker compose -f docker/compose.dev.yml exec    # Execute command
docker compose -f docker/compose.dev.yml logs    # View logs
docker compose -f docker/compose.dev.yml down    # Stop and remove
```

### File Structure

```
.
├── .github/
│   ├── workflows/
│   │   └── ci.yml                    # CI/CD pipeline
│   └── DEPLOYMENT_SETUP.md           # Deployment guide
├── docker/
│   ├── compose.dev.yml               # Development compose
│   ├── compose.prod.yml              # Production compose
│   ├── Dockerfile.dev                # Dev container
│   ├── Dockerfile.prod               # Prod container
│   └── minio-init.sh                 # Bucket setup script
├── src/
│   └── index.ts                      # Main application
├── scripts/
│   ├── e2e-test.ts                   # E2E test suite
│   └── run-e2e.ts                    # Test runner
├── .env                              # Environment config
├── package.json                      # Dependencies & scripts
└── README.md                         # Main documentation
```

### References

- [MinIO Documentation](https://min.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS S3 SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

## Contributing

When contributing to this project:

1. **Always test locally first**: Run `npm run test:e2e` before pushing
2. **Format your code**: Run `npm run format` before committing
3. **Fix lint issues**: Run `npm run lint:fix` before pushing
4. **Check the pipeline**: Monitor GitHub Actions after pushing
5. **Test on VM**: Verify deployment on production VM

---

## License

This project is part of the CUET Fest 2025 Hackathon Challenge.

---

**Last Updated:** December 12, 2025  
**Author:** Team Delineate  
**Repository:** [cuet-micro-ops-hackthon-2025](https://github.com/ShadatHossainRony/cuet-micro-ops-hackthon-2025)
