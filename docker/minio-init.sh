#!/bin/sh
# MinIO bucket initialization script

echo "Starting MinIO bucket initialization..."

# Wait for MinIO to be ready
until curl -f http://36.255.71.50:9000/minio/health/live > /dev/null 2>&1; do
  echo "Waiting for MinIO to be ready..."
  sleep 2
done

echo "MinIO is ready. Setting up bucket..."

# Configure mc (MinIO client)
mc alias set local http://36.255.71.50:9000 minioadmin minioadmin

# Create the download bucket
mc mb local/download --ignore-existing

# Set bucket policy to public for easier access
mc policy set public local/download

echo "Bucket 'download' created successfully!"

# List buckets to verify
mc ls local

echo "MinIO bucket setup completed!"