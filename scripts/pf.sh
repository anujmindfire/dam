#!/bin/bash
kubectl port-forward svc/minio -n dam 9000:9000 &
kubectl port-forward svc/minio -n dam 9001:9001 &
kubectl port-forward svc/rabbitmq -n dam 15672:15672 &
kubectl port-forward svc/grafana -n monitoring 3000:3000 &
kubectl port-forward svc/prometheus -n monitoring 9090:9090 &
kubectl port-forward svc/api-gateway -n dam 8080:80 &
wait
