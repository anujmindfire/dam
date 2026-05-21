#!/bin/bash
# DAM Kubernetes Port-Forward Script
# Exposes all services to local URLs

set -e

# Kill any existing port-forwards
echo "🔄 Clearing old port-forwards..."
pkill -f "kubectl port-forward" 2>/dev/null || true
sleep 2

LOG_DIR="/tmp/dam-portforwards"
mkdir -p "$LOG_DIR"

echo "🚀 Starting port-forwards..."

# dam.local:8080 -> ingress-nginx (routes to all app services via nginx ingress)
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 \
  > "$LOG_DIR/dam.log" 2>&1 &
echo "  ✅ DAM App:    http://dam.local:8080  (PID $!)"

# Grafana - grafana.local (also accessible at localhost:3000)
kubectl port-forward -n monitoring svc/grafana 3000:3000 \
  > "$LOG_DIR/grafana.log" 2>&1 &
echo "  ✅ Grafana:    http://grafana.local:3000  |  http://localhost:3000  (PID $!)"

# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090 \
  > "$LOG_DIR/prometheus.log" 2>&1 &
echo "  ✅ Prometheus: http://prometheus.local:9090  |  http://localhost:9090  (PID $!)"

# MinIO Console (API is routed through ingress-nginx port 8080)
kubectl port-forward -n dam svc/minio 9001:9001 \
  > "$LOG_DIR/minio.log" 2>&1 &
echo "  ✅ MinIO Console: http://minio.local:9001  |  http://localhost:9001  (PID $!)"

# RabbitMQ Management UI
kubectl port-forward -n dam svc/rabbitmq 15672:15672 \
  > "$LOG_DIR/rabbitmq.log" 2>&1 &
echo "  ✅ RabbitMQ:   http://rabbitmq.local:15672  |  http://localhost:15672  (PID $!)"

echo ""
echo "📋 /etc/hosts entries needed (already set):"
echo "   127.0.0.1  dam.local grafana.local prometheus.local minio.local rabbitmq.local"
echo ""
echo "🌐 Access URLs:"
echo "   DAM App:       http://dam.local:8080"
echo "   Grafana:       http://grafana.local:3000     (admin/admin)"
echo "   Prometheus:    http://prometheus.local:9090"
echo "   MinIO API:     http://minio.local:8080"
echo "   MinIO Console: http://minio.local:9001       (minioadmin/minioadmin)"
echo "   RabbitMQ:      http://rabbitmq.local:15672   (guest/guest)"
echo ""
echo "⏳ Waiting for connections... (Ctrl+C to stop all port-forwards)"

wait
