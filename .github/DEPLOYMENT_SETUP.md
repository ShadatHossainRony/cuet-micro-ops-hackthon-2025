# 🚀 Deployment Setup Guide

## Prerequisites

1. Ubuntu VM at `36.255.71.50`
2. SSH key pair for authentication
3. Docker and Docker Compose installed on the VM

## GitHub Actions Secret Setup

### 1. Add SSH Private Key to GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SSH_PRIVATE_KEY`
5. Value: Paste your **private SSH key** (entire content including `-----BEGIN` and `-----END` lines)
6. Click **Add secret**

### 2. Verify SSH Key on VM

Make sure your SSH public key is added to the VM:

```bash
# On your local machine, copy the public key
cat ~/.ssh/id_rsa.pub

# On the VM (36.255.71.50), add it to authorized_keys
ssh ubuntu@36.255.71.50
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. Verify Docker on VM

Ensure Docker is installed and the ubuntu user has permissions:

```bash
ssh ubuntu@36.255.71.50

# Check Docker
docker --version
docker compose version

# Add ubuntu user to docker group (if needed)
sudo usermod -aG docker ubuntu

# Log out and back in for group changes to take effect
exit
ssh ubuntu@36.255.71.50

# Test Docker without sudo
docker ps
```

### 4. Create Required Directories on VM

```bash
ssh ubuntu@36.255.71.50

# Create application directory
mkdir -p ~/delineate

# Create MinIO data directory
sudo mkdir -p /home/ubuntu/minio
sudo chown ubuntu:ubuntu /home/ubuntu/minio
```

## How the Pipeline Works

### On every push to `main` branch:

1. **🧪 Test & Lint Job**
   - Checkout code
   - Install Node.js dependencies
   - Run ESLint
   - Check Prettier formatting
   - Ensure MinIO bucket exists
   - Run E2E tests against the production MinIO server

2. **🚀 Deploy to Production Job** (only if tests pass)
   - Setup SSH connection to VM
   - Copy project files via rsync
   - Stop existing containers
   - Build new containers
   - Start containers with docker-compose
   - Run health check to verify deployment

## Manual Deployment

To deploy manually from your local machine:

```bash
# Deploy to production
ssh ubuntu@36.255.71.50 "cd ~/delineate && docker compose -f docker/compose.prod.yml down && docker compose -f docker/compose.prod.yml up -d --build"

# Check logs
ssh ubuntu@36.255.71.50 "cd ~/delineate && docker compose -f docker/compose.prod.yml logs -f"

# Check status
ssh ubuntu@36.255.71.50 "cd ~/delineate && docker compose -f docker/compose.prod.yml ps"
```

## Troubleshooting

### Pipeline fails at SSH step

- Verify `SSH_PRIVATE_KEY` secret is set correctly
- Check that the public key is in `~/.ssh/authorized_keys` on the VM
- Ensure SSH service is running on the VM

### Deployment fails

- Check Docker is installed and running on VM
- Verify ubuntu user has Docker permissions
- Check `/home/ubuntu/minio` directory exists and has correct permissions

### Health check fails

- Check container logs: `docker compose -f docker/compose.prod.yml logs`
- Verify MinIO is accessible at `36.255.71.50:9000`
- Check firewall settings allow port 3000

## Testing the Deployment

After successful deployment:

```bash
# Check health endpoint
curl http://36.255.71.50:3000/health

# Check API documentation
curl http://36.255.71.50:3000/

# Test download endpoint
curl -X POST http://36.255.71.50:3000/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://speed.hetzner.de/1MB.bin"}'
```

## Security Notes

- Never commit private SSH keys to the repository
- Only add the public key to the VM
- Rotate SSH keys periodically
- Use GitHub secrets for sensitive data
- Keep the VM firewall configured properly
