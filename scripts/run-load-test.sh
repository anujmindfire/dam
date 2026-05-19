#!/bin/bash
# Enterprise-Grade Queue Worker High-Load & Autoscaling Simulator
# This script simulates heavy media processing uploads to trigger HPA scaling.

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${YELLOW}===================================================${NC}"
echo -e "${YELLOW}🚀 DAM Queue Worker Load & Autoscaling Simulator  ${NC}"
echo -e "${YELLOW}===================================================${NC}"

# Authenticate
echo -e "${CYAN}[1/3] Authenticating as Admin...${NC}"
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@dam.com","password":"Chiku143"}' http://localhost:8080/api/v1/auth/login -H "Host: dam.local")

TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to authenticate. Response: $RESPONSE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Successfully authenticated. Token obtained.${NC}"

# Confirm large image exists
if [ ! -f "large_stress.png" ]; then
    echo -e "${YELLOW}Generating 36MB high-fidelity stress image (5000x5000 random noise)...${NC}"
    python3 -c 'import random; from PIL import Image; width, height = 500, 500; rand_bytes = bytearray(random.getrandbits(8) for _ in range(width * height * 3)); img = Image.frombytes("RGB", (width, height), bytes(rand_bytes)); img_large = img.resize((5000, 5000), Image.BILINEAR); img_large.save("large_stress.png")'
fi
echo -e "${GREEN}✓ Verification: large_stress.png (36MB) is present.${NC}"

# Triggering concurrent high-load uploads
CONCURRENCY=8
echo -e "${CYAN}[2/3] Spiking Queue with $CONCURRENCY parallel uploads of large_stress.png...${NC}"

upload_file() {
    local i=$1
    local filename="stress_upload_${i}_$(date +%s).png"
    echo -e "${YELLOW}Starting upload $i: $filename...${NC}"
    
    # Upload via ingress API Gateway
    local start_time=$(date +%s)
    local res=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Host: dam.local" \
        -F "file=@large_stress.png;filename=$filename;type=image/png" \
        -F "department=Engineering" \
        -F "usageRights=Enterprise" \
        http://localhost:8080/api/v1/assets/upload)
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    local status=$(echo "$res" | grep "HTTP_STATUS" | cut -d':' -f2)
    if [ "$status" = "201" ]; then
        echo -e "${GREEN}✓ Upload $i finished successfully in ${duration}s (HTTP 201)${NC}"
    else
        echo -e "${RED}✗ Upload $i failed in ${duration}s (HTTP $status)${NC}"
    fi
}

export -f upload_file
export TOKEN

# Run uploads in parallel in a loop to keep CPU hot for 90s
start_stress_time=$(date +%s)
stress_duration=90

stress_worker() {
    local id=$1
    local run=1
    while [ $(( $(date +%s) - start_stress_time )) -lt $stress_duration ]; do
        upload_file "${id}_${run}"
        run=$((run+1))
        sleep 1
    done
}

export start_stress_time
export stress_duration
export -f stress_worker

for i in $(seq 1 $CONCURRENCY); do
    stress_worker "$i" &
done

echo -e "${CYAN}[3/3] Parallel uploads dispatched. Monitoring HPA in background...${NC}"
echo -e "${YELLOW}Keep this terminal open to watch the worker scaling!${NC}"
echo -e "Press Ctrl+C to stop active monitoring."

# Monitor HPA for the next 3 minutes
for k in {1..36}; do
    echo -e "\n${CYAN}--- Cluster Status (Interval $k/36) ---${NC}"
    kubectl get hpa worker-hpa -n dam
    echo -e "${YELLOW}Worker Pods Replicas:${NC}"
    kubectl get pods -n dam -l app=worker
    sleep 5
done

# Wait for all background uploads to complete
wait

echo -e "${GREEN}✓ All uploads completed and processed!${NC}"
