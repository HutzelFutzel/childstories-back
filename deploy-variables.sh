#!/bin/bash

# Exit on any error
set -e

# Define the secret names
SECRET_PREFIX="childstories-backend-variables"

# Function to deploy a JSON file to a specific secret
deploy_secret() {
  local environment="$1"
  local file_name=".backend-variables-${environment}.json"
  local secret_name="${SECRET_PREFIX}-${environment}"

  # Check if the file exists
  if [[ ! -f "$file_name" ]]; then
    echo "Warning: File $file_name does not exist. Skipping deployment for $environment."
    return
  fi

  echo "Deploying $file_name to secret $secret_name..."

  # Check if the secret already exists
  if gcloud secrets describe "$secret_name" >/dev/null 2>&1; then
    # If the secret exists, add a new version
    gcloud secrets versions add "$secret_name" --data-file="$file_name"
    echo "Successfully updated $secret_name with a new version."
  else
    # If the secret does not exist, create it
    gcloud secrets create "$secret_name" --replication-policy="automatic"
    gcloud secrets versions add "$secret_name" --data-file="$file_name"
    echo "Successfully created $secret_name and added the first version."
  fi
}

# Function to restart Cloud Run services
restart_cloud_run_service() {
  local service_name="$1"
  local region="$2"

  echo "Triggering a new revision for Cloud Run service $service_name in region $region..."
  # Update a dummy environment variable to trigger a new revision
  gcloud run services update "$service_name" \
    --region "$region" \
    --platform managed \
    --update-env-vars "DUMMY_ENV_VAR=$(date +%s)" \
    --quiet
  echo "Successfully triggered a new revision for $service_name."
}

# Determine which environments to deploy based on the argument
environments=("production" "development")

# Deploy for the specified environments
for environment in "${environments[@]}"; do
  deploy_secret "$environment"

  # Restart containers for staging and production only
  if [[ "$environment" == "production" ]]; then
    service_name="childstories-back"
    region="us-east4"
    restart_cloud_run_service "$service_name" "$region"
  fi
done
