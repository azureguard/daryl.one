#!/bin/bash

# Exit on any error
set -e

# Function to check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        echo "Error: Wrangler is not installed. Please install it using: npm install -g wrangler"
        exit 1
    fi
}

# Function to check if user is logged in to Cloudflare
check_auth() {
    if ! wrangler whoami &> /dev/null; then
        echo "Error: Not logged in to Cloudflare. Please run: wrangler login"
        exit 1
    fi
}

# Function to check if a project exists
check_project() {
    local project_name=$1

    echo "Checking if project '$project_name' exists..."

    # Try to get project info
    if wrangler pages project list | grep -qE "\s+$project_name\s+"; then
        echo "Project '$project_name' already exists."
        return 0
    else
        echo "Project '$project_name' does not exist."
        return 1
    fi
}

# Function to create a new project
create_project() {
    local project_name=$1
    local production_branch=${2:-main}

    echo "Creating new Pages project '$project_name'..."

    wrangler pages project create "$project_name" \
        --production-branch="$production_branch"

    echo "Project '$project_name' created successfully!"
}

# Main script
main() {
    # Check if project name is provided
    if [ $# -lt 1 ]; then
        echo "Usage: $0 <project-name> [production-branch]"
        echo "Example: $0 my-website main"
        exit 1
    fi

    PROJECT_NAME=$1
    PRODUCTION_BRANCH=${2:-main}

    # Perform initial checks
    check_wrangler
    check_auth

    # Check if project exists and create if it doesn't
    if ! check_project "$PROJECT_NAME"; then
        create_project "$PROJECT_NAME" "$PRODUCTION_BRANCH"
    fi
}

# Run main function with all script arguments
main "$@"
