#!/bin/bash

# Set variables
IMAGE_NAME="springboot-java17-universal"
CONTAINER_NAME="springboot-app"
PORT="8080"

# Function to check if a container exists
container_exists() {
    docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Function to check if a container is running
container_running() {
    docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Main logic
if container_exists; then
    if container_running; then
        echo "The container '${CONTAINER_NAME}' is already running. Access it at http://localhost:${PORT}"
    else
        echo "The container '${CONTAINER_NAME}' exists but is not running. Starting it..."
        docker start "${CONTAINER_NAME}"
        echo "Access the app at http://localhost:${PORT}"
    fi
else
    echo "Container '${CONTAINER_NAME}' does not exist. Building and running a new one..."

    # Build the Docker image
    docker build -t "${IMAGE_NAME}" .

    # Run the Docker container
    docker run -d --name "${CONTAINER_NAME}" -p "${PORT}:${PORT}" "${IMAGE_NAME}"
    echo "Access the app at http://localhost:${PORT}"
fi