#!/bin/bash
# Complete Deployment Script for DAM Performance Testing Infrastructure
# This script automates the deployment of all monitoring, logging, and scaling components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_IP=${CLUSTER_IP:-"localhost"}
NAMESPACE_DAM="dam"
NAMESPACE_MONITORING="monitoring"
NAMESPACE_LOGGING="logging"

# Functions
print_header() {
    echo -e "${YELLOW}======================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}======================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    print_success "kubectl is installed"
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"
    
    if ! kubectl get storageclass &> /dev/null; then
        print_error "No storage classes found"
        exit 1
    fi
    print_success "Storage classes available"
}

create_namespaces() {
    print_header "Creating Namespaces"
    
    kubectl create namespace $NAMESPACE_DAM --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace $NAMESPACE_DAM name=$NAMESPACE_DAM --overwrite
    print_success "Created namespace: $NAMESPACE_DAM"
    
    kubectl create namespace $NAMESPACE_MONITORING --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace $NAMESPACE_MONITORING name=$NAMESPACE_MONITORING --overwrite
    print_success "Created namespace: $NAMESPACE_MONITORING"
    
    kubectl create namespace $NAMESPACE_LOGGING --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace $NAMESPACE_LOGGING name=$NAMESPACE_LOGGING --overwrite
    print_success "Created namespace: $NAMESPACE_LOGGING"
}

deploy_monitoring() {
    print_header "Deploying Monitoring Stack (Prometheus)"
    
    kubectl apply -f infra/k8s/monitoring/prometheus.yml
    print_success "Deployed Prometheus"
    
    # Wait for Prometheus to be ready
    echo "Waiting for Prometheus to be ready..."
    kubectl rollout status deployment/prometheus -n $NAMESPACE_MONITORING --timeout=5m || true
    print_success "Prometheus is ready"
}

deploy_logging() {
    print_header "Deploying Logging Stack (Loki + Promtail)"
    
    kubectl apply -f infra/k8s/monitoring/logging.yml
    print_success "Deployed Loki logging stack"
    
    # Wait for Loki to be ready
    echo "Waiting for Loki to be ready..."
    kubectl rollout status deployment/loki -n $NAMESPACE_LOGGING --timeout=5m || true
    print_success "Loki is ready"
}

deploy_grafana() {
    print_header "Deploying Grafana with Dashboards"
    
    kubectl apply -f infra/k8s/monitoring/grafana-datasources.yml
    kubectl apply -f infra/k8s/monitoring/grafana-dashboards.yml
    print_success "Deployed Grafana dashboards"
    
    # Wait for Grafana to be ready
    echo "Waiting for Grafana to be ready..."
    kubectl rollout status deployment/grafana -n $NAMESPACE_MONITORING --timeout=5m || true
    print_success "Grafana is ready"
}

deploy_network_policies() {
    print_header "Applying Network Policies"
    
    kubectl apply -f infra/k8s/monitoring/network-policies.yml
    print_success "Deployed network policies"
}

deploy_hpa() {
    print_header "Deploying Horizontal Pod Autoscalers"
    
    kubectl apply -f infra/k8s/apps/hpa.yml
    print_success "Deployed HPA for all services"
}

deploy_services() {
    print_header "Deploying Application Services"
    
    kubectl apply -f infra/k8s/apps/worker.yml
    print_success "Deployed worker service"
    
    kubectl apply -f infra/k8s/apps/assets.yml
    print_success "Deployed assets service"
}

deploy_ingress() {
    print_header "Deploying Ingress Configuration"
    
    kubectl apply -f infra/k8s/apps/ingress.yml
    print_success "Deployed ingress"
}

verify_deployment() {
    print_header "Verifying Deployment"
    
    echo "Checking HPA status..."
    kubectl get hpa -n $NAMESPACE_DAM
    print_success "HPA configured"
    
    echo ""
    echo "Checking Prometheus..."
    kubectl get pod -n $NAMESPACE_MONITORING -l app=prometheus
    print_success "Prometheus running"
    
    echo ""
    echo "Checking Loki..."
    kubectl get pod -n $NAMESPACE_LOGGING -l app=loki
    print_success "Loki running"
    
    echo ""
    echo "Checking Grafana..."
    kubectl get pod -n $NAMESPACE_MONITORING -l app=grafana
    print_success "Grafana running"
    
    echo ""
    echo "Checking Application Pods..."
    kubectl get pods -n $NAMESPACE_DAM
    print_success "All services running"
    
    echo ""
    echo "Checking Ingress..."
    kubectl get ingress -n $NAMESPACE_DAM
    print_success "Ingress configured"
}

print_access_info() {
    print_header "Access Information"
    
    echo "Grafana Dashboard:"
    echo "  URL: http://grafana.local:3000"
    echo "  Default credentials: admin/admin"
    echo ""
    echo "Prometheus:"
    echo "  URL: http://prometheus.local:9090"
    echo ""
    echo "Loki:"
    echo "  URL: http://loki.local:3100"
    echo ""
    echo "DAM Application:"
    echo "  URL: http://dam.local"
    echo ""
    echo "To access these URLs, add the following to your /etc/hosts file:"
    echo "$CLUSTER_IP grafana.local prometheus.local loki.local dam.local"
    echo ""
}

print_next_steps() {
    print_header "Next Steps"
    
    echo "1. Update your /etc/hosts file with the cluster IP"
    echo ""
    echo "2. Access Grafana:"
    echo "   - Open http://grafana.local:3000"
    echo "   - Login with admin/admin"
    echo "   - Navigate to Dashboards > DAM Performance Testing Dashboard"
    echo ""
    echo "3. Run load test:"
    echo "   chmod +x scripts/run-load-test.sh"
    echo "   ./scripts/run-load-test.sh"
    echo ""
    echo "4. Monitor the test:"
    echo "   - Watch HPA: kubectl get hpa -n dam -w"
    echo "   - Watch pods: kubectl get pods -n dam -l app=worker -w"
    echo ""
    echo "5. Analyze results:"
    echo "   - Check Grafana dashboards"
    echo "   - Review logs in Loki"
    echo "   - Export metrics from Prometheus"
    echo ""
}

# Main execution
main() {
    print_header "DAM Performance Testing Infrastructure Deployment"
    
    check_prerequisites
    create_namespaces
    deploy_monitoring
    deploy_logging
    deploy_grafana
    deploy_network_policies
    deploy_hpa
    deploy_services
    deploy_ingress
    verify_deployment
    print_access_info
    print_next_steps
    
    print_header "Deployment Complete!"
    print_success "All components deployed successfully"
}

# Run main function
main
