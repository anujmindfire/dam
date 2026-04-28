#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Digital Assets Management - K8s Deploy${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
PROJECT_DIR="/home/lenovo/Documents/digital-assest-management"
NAMESPACE="dam"
REGISTRY="docker.io"  # Change for production

# Function to print status
print_status() {
    echo -e "${YELLOW}[*] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

print_error() {
    echo -e "${RED}[✗] $1${NC}"
    exit 1
}

# Step 1: Check prerequisites
print_status "Checking prerequisites..."
command -v docker &> /dev/null || print_error "Docker not installed"
command -v kubectl &> /dev/null || print_error "kubectl not installed"
print_success "Prerequisites satisfied"

# Step 2: Point Docker to minikube
print_status "Configuring Docker to use minikube registry..."
eval $(minikube docker-env)
print_success "Docker configured"

# Step 3: Build Docker images
print_status "Building Docker images..."
cd "$PROJECT_DIR"

images=(
    "apps/dashboard:dam-dashboard"
    "apps/server:dam-server"
    "apps/assets:dam-assets"
    "apps/metadata:dam-metadata"
    "apps/usage:dam-usage"
    "apps/worker:dam-worker"
)

for img in "${images[@]}"; do
    IFS=':' read -r app_path image_name <<< "$img"
    print_status "Building $image_name from $app_path..."
    docker build -f "$app_path/Dockerfile" -t "$image_name:latest" . || print_error "Failed to build $image_name"
    print_success "Built $image_name:latest"
done

# Step 4: Verify images
print_status "Verifying Docker images..."
docker images | grep dam- || print_error "No images found!"
print_success "All images built successfully"

# Step 5: Create namespace
print_status "Creating Kubernetes namespace..."
kubectl apply -f "$PROJECT_DIR/infra/k8s/namespace.yml" || print_error "Failed to create namespace"
print_success "Namespace created"

# Step 6: Create secrets (if file exists)
if [ -f "$PROJECT_DIR/infra/k8s/secrets.yml" ]; then
    print_status "Creating secrets..."
    kubectl apply -f "$PROJECT_DIR/infra/k8s/secrets.yml" || print_error "Failed to create secrets"
    print_success "Secrets created"
fi

# Step 7: Deploy infrastructure services
print_status "Deploying infrastructure services..."
for service in redis rabbitmq minio; do
    if [ -f "$PROJECT_DIR/infra/k8s/$service.yml" ]; then
        print_status "Deploying $service..."
        kubectl apply -f "$PROJECT_DIR/infra/k8s/$service.yml"
        print_success "$service deployed"
    fi
done

# Wait for infrastructure
print_status "Waiting for infrastructure services to be ready (30s)..."
sleep 30

# Step 8: Deploy application services
print_status "Deploying application services..."
for service in server assets metadata usage worker; do
    if [ -f "$PROJECT_DIR/infra/k8s/$service.yml" ]; then
        print_status "Deploying $service..."
        kubectl apply -f "$PROJECT_DIR/infra/k8s/$service.yml"
        print_success "$service deployed"
    fi
done

# Step 9: Deploy dashboard
print_status "Deploying dashboard UI..."
kubectl apply -f "$PROJECT_DIR/infra/k8s/dashboard.yml" || print_error "Failed to deploy dashboard"
print_success "Dashboard deployed"

# Step 10: Deploy gateway (last)
print_status "Deploying API gateway..."
kubectl apply -f "$PROJECT_DIR/infra/k8s/gateway.yml" || print_error "Failed to deploy gateway"
print_success "API gateway deployed"

# Step 11: Wait for pods to be ready
print_status "Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod -l app -n $NAMESPACE --timeout=300s 2>/dev/null || print_status "Some pods may still be starting..."

# Step 12: Display status
print_status "Current pod status:"
kubectl get pods -n $NAMESPACE

# Step 13: Display service endpoints
print_status "Service endpoints:"
kubectl get svc -n $NAMESPACE

# Step 14: Get gateway URL
print_status "Getting gateway access point..."
GATEWAY_IP=$(minikube ip)
GATEWAY_PORT=$(kubectl get svc api-gateway -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Access the application at: ${YELLOW}http://$GATEWAY_IP:$GATEWAY_PORT${NC}"
echo ""
echo "Useful commands:"
echo "  kubectl get pods -n $NAMESPACE              # View all pods"
echo "  kubectl logs <pod-name> -n $NAMESPACE       # View pod logs"
echo "  kubectl describe pod <pod-name> -n $NAMESPACE # Debug pod issues"
echo "  kubectl port-forward svc/api-gateway 8080:80 -n $NAMESPACE  # Port forward"
echo ""
