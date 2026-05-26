# Digital Assets Management (DAM) - Operational Troubleshooting Runbooks

This guide provides step-by-step instructions for diagnosing and resolving common operational incidents in the DAM application ecosystem.

---

## 📂 Table of Contents
1. [Troubleshooting RabbitMQ Queue Backlogs](#1-troubleshooting-rabbitmq-queue-backlogs)
2. [Safely Clearing Redis Caches](#2-safely-clearing-redis-caches)
3. [Recovering PostgreSQL Connection Failures](#3-recovering-postgresql-connection-failures)

---

## 1. Troubleshooting RabbitMQ Queue Backlogs

### Incident Symptoms
* Asset analysis is delayed or fails to transition status.
* Worker services are running but not processing new objects.
* Dashboard jobs queue indicators show rising message counts.

### Diagnostics

#### A. Check Queue Status inside Kubernetes
List all queues and verify message counts:
```bash
kubectl exec -n dam -it deployment/rabbitmq -- rabbitmqctl list_queues name messages messages_ready messages_unacknowledged
```

#### B. Access the RabbitMQ Management UI
1. Start port-forwarding:
   ```bash
   kubectl port-forward -n dam svc/rabbitmq 15672:15672
   ```
2. Open **`http://localhost:15672`** (Default user/pass: `guest` / `guest`).
3. Check the **Queues** tab to identify if messages are backed up in `asset-analysis` or `notifications`.

### Mitigation Steps

#### Step 1: Verify Consumer Availability
If the number of `consumers` for a backed-up queue is `0`, the Worker service is down. Restart it:
```bash
kubectl rollout restart deployment/worker -n dam
```

#### Step 2: Purge Backlogged Queues (Data Loss Risk)
If the queue is backed up with poison-pill/corrupt messages that crash workers, you can purge them:
```bash
kubectl exec -n dam -it deployment/rabbitmq -- rabbitmqctl purge_queue asset-analysis
```

---

## 2. Safely Clearing Redis Caches

### Incident Symptoms
* Frontend dashboard shows stale metrics, usage trends, or compliance stats.
* Outdated user profiles or token validation states are persisting after data migrations.

### Diagnostics

Check Redis connectivity and memory usage:
```bash
kubectl exec -n dam -it deployment/redis -- redis-cli info memory
```

### Mitigation Steps

#### A. Flush All Keys (Use with Caution)
To clear every key cached across all databases inside the Redis instance:
```bash
kubectl exec -n dam -it deployment/redis -- redis-cli flushall
```

#### B. Safely Scan and Delete Stale Cache Keys
To delete only analytics or metadata caches without dropping session information:
```bash
kubectl exec -n dam -it deployment/redis -- redis-cli --eval /dev/stdin <<EOF
local keys = redis.call('keys', 'cache:analytics:*')
for i, k in ipairs(keys) do
    redis.call('del', k)
end
return #keys
EOF
```

---

## 3. Recovering PostgreSQL Connection Failures

### Incident Symptoms
* Express APIs return `500 Internal Server Error` with `ECONNREFUSED` or database timeout logs.
* Node microservices fail their startup health checks and restart repeatedly.

### Diagnostics

#### A. Test Database Reachability
Run `pg_isready` inside the server or database namespace:
```bash
kubectl exec -n dam -it postgres-0 -- pg_isready -h localhost -p 5432 -U postgres
```

#### B. Check Active Connections
Connect to PostgreSQL and inspect connection slots:
```bash
kubectl exec -n dam -it postgres-0 -- psql -U postgres -d dam -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
```

### Mitigation Steps

#### Step 1: Restart PostgreSQL StatefulSet
If database connections are saturated or the engine is unresponsive:
```bash
kubectl rollout restart statefulset/postgres -n dam
```

#### Step 2: Terminate Idle Connections
To terminate runaway idle transactions safely:
```bash
kubectl exec -n dam -it postgres-0 -- psql -U postgres -d dam -c \
"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < shrink_interval;"
```
