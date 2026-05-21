#!/bin/bash

# DAM Kubernetes Management Script
# Usage: ./scripts/k8s-manage.sh [start|stop|status]

ACTION=$1
ENV=$2

if [ -z "$ACTION" ]; then
    echo "Usage: $0 [start|stop|status] [local|staging|production]"
    exit 1
fi

apply_manifests() {
    if [ -n "$ENV" ]; then
        if [ "$ENV" = "local" ] || [ "$ENV" = "staging" ] || [ "$ENV" = "production" ]; then
            echo "Deploying via Kustomize overlay for environment: $ENV..."
            kubectl apply -k infra/envs/$ENV
        else
            echo "Unknown environment: $ENV. Supported: local, staging, production"
            exit 1
        fi
    else
        echo "Creating namespaces and core resources..."
        kubectl apply -f infra/k8s/base/namespace.yml
        kubectl apply -f infra/k8s/base/secrets.yml
        
        echo "Deploying infrastructure (Redis, RabbitMQ, MinIO, Postgres)..."
        kubectl apply -f infra/k8s/infrastructure/
        
        echo "Deploying application microservices..."
        kubectl apply -f infra/k8s/apps/
        
        echo "Deploying monitoring stack (Prometheus, Grafana)..."
        kubectl apply -f infra/k8s/monitoring/grafana-dashboards.yml
        kubectl apply -f infra/k8s/monitoring/monitoring.yml
    fi
    
    echo "Waiting for pods to be ready..."
    kubectl get pods -A
}

delete_manifests() {
    if [ -n "$ENV" ]; then
        if [ "$ENV" = "local" ] || [ "$ENV" = "staging" ] || [ "$ENV" = "production" ]; then
            echo "Deleting Kustomize overlay resources for environment: $ENV..."
            kubectl delete -k infra/envs/$ENV
        else
            echo "Unknown environment: $ENV. Supported: local, staging, production"
            exit 1
        fi
    else
        echo "Stopping all services and deleting manifests..."
        kubectl delete -f infra/k8s/apps/
        kubectl delete -f infra/k8s/monitoring/
        kubectl delete -f infra/k8s/infrastructure/
        kubectl delete -f infra/k8s/base/secrets.yml
    fi
}

check_status() {
    echo "Current Cluster Status:"
    kubectl get all -n dam
    echo "---"
    kubectl get all -n monitoring
    echo "---"
    kubectl get ingress -A
}

case $ACTION in
    start)
        apply_manifests
        ;;
    stop)
        delete_manifests
        ;;
    status)
        check_status
        ;;
    *)
        echo "Invalid action: $ACTION"
        echo "Usage: $0 [start|stop|status] [local|staging|production]"
        exit 1
        ;;
esac
