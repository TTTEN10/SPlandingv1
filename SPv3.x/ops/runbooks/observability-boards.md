# SafePsy Observability Boards Runbook

## Overview

This runbook provides comprehensive procedures for setting up, managing, and maintaining observability boards for the SafePsy decentralized identity platform. Observability boards provide real-time monitoring, alerting, and insights into system performance, security, and business metrics.

## Observability Architecture

### Core Components
- **Metrics Collection**: System and application metrics
- **Log Aggregation**: Centralized logging and analysis
- **Distributed Tracing**: Request flow tracking
- **Alerting System**: Real-time notifications
- **Dashboard Visualization**: Real-time monitoring boards

### Monitoring Stack
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Log aggregation (Elasticsearch, Logstash, Kibana)
- **Jaeger**: Distributed tracing
- **AlertManager**: Alert routing and management

## Prerequisites

### Infrastructure Requirements
- Docker and Docker Compose
- 8GB+ RAM for monitoring stack
- 50GB+ disk space for metrics and logs
- Network access for external monitoring services

### Required Services
- Prometheus server
- Grafana dashboard
- Elasticsearch cluster
- Logstash pipeline
- Kibana interface
- Jaeger tracing
- AlertManager

## Observability Stack Deployment

### Step 1: Create Monitoring Configuration

#### Docker Compose for Observability
```yaml
# docker-compose.observability.yml
version: '3.8'

services:
  # Prometheus - Metrics Collection
  prometheus:
    image: prom/prometheus:latest
    container_name: safepsy-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - monitoring-network

  # Grafana - Visualization
  grafana:
    image: grafana/grafana:latest
    container_name: safepsy-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    networks:
      - monitoring-network

  # Elasticsearch - Log Storage
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: safepsy-elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - monitoring-network

  # Logstash - Log Processing
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: safepsy-logstash
    restart: unless-stopped
    volumes:
      - ./monitoring/logstash/pipeline:/usr/share/logstash/pipeline
      - ./monitoring/logstash/config:/usr/share/logstash/config
    ports:
      - "5044:5044"
    networks:
      - monitoring-network

  # Kibana - Log Visualization
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: safepsy-kibana
    restart: unless-stopped
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - monitoring-network

  # Jaeger - Distributed Tracing
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: safepsy-jaeger
    restart: unless-stopped
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    networks:
      - monitoring-network

  # AlertManager - Alert Management
  alertmanager:
    image: prom/alertmanager:latest
    container_name: safepsy-alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    networks:
      - monitoring-network

volumes:
  prometheus_data:
  grafana_data:
  elasticsearch_data:
  alertmanager_data:

networks:
  monitoring-network:
    driver: bridge
```

### Step 2: Configure Prometheus

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # SafePsy Backend
  - job_name: 'safepsy-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  # SafePsy Frontend
  - job_name: 'safepsy-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    scrape_interval: 5s

  # SafePsy AI Chatbot
  - job_name: 'safepsy-ai-chatbot'
    static_configs:
      - targets: ['ai-chatbot:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  # MongoDB
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']
    scrape_interval: 30s

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  # Node Exporter
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 15s

  # Docker
  - job_name: 'docker'
    static_configs:
      - targets: ['docker:9323']
    scrape_interval: 15s
```

### Step 3: Configure Grafana Dashboards

#### System Overview Dashboard
```json
{
  "dashboard": {
    "title": "SafePsy System Overview",
    "panels": [
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"safepsy-.*\"}",
            "legendFormat": "{{job}}"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{job}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

### Step 4: Configure Alerting Rules

#### Critical Alerts
```yaml
# monitoring/rules/critical.yml
groups:
  - name: critical
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service {{ $labels.job }} has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate for {{ $labels.job }}"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time for {{ $labels.job }}"
          description: "95th percentile response time is {{ $value }} seconds"
```

## Dashboard Categories

### 1. System Health Dashboard
- Service availability status
- Resource utilization (CPU, Memory, Disk)
- Network connectivity
- Container health

### 2. Application Performance Dashboard
- Request rates and response times
- Error rates and status codes
- Database query performance
- Cache hit rates

### 3. Security Dashboard
- Authentication failures
- Suspicious activity patterns
- SSL certificate status
- Access control violations

### 4. Business Metrics Dashboard
- User registrations
- DID creation rates
- Therapy session metrics
- Revenue metrics

### 5. Infrastructure Dashboard
- Server health and performance
- Database performance
- Network latency
- Storage utilization

## Alerting Configuration

### AlertManager Configuration
```yaml
# monitoring/alertmanager.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@safepsy.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://webhook:5001/'

  - name: 'email'
    email_configs:
      - to: 'alerts@safepsy.com'
        subject: 'SafePsy Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}

  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#safepsy-alerts'
        title: 'SafePsy Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

### Alert Severity Levels
- **Critical**: Service down, security breach, data loss
- **Warning**: Performance degradation, resource limits
- **Info**: Maintenance notifications, status updates

## Log Management

### Log Collection Setup
```yaml
# monitoring/logstash/pipeline/logs.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "backend" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
  }
  
  if [fields][service] == "frontend" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "safepsy-logs-%{+YYYY.MM.dd}"
  }
}
```

### Log Analysis Queries
```bash
# Search for errors
GET /safepsy-logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "ERROR" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}

# Search for specific service
GET /safepsy-logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "fields.service": "backend" } },
        { "range": { "@timestamp": { "gte": "now-24h" } } }
      ]
    }
  }
}
```

## Distributed Tracing

### Jaeger Configuration
```yaml
# monitoring/jaeger-config.yml
collector:
  otlp:
    enabled: true
    grpc:
      endpoint: "0.0.0.0:4317"
    http:
      endpoint: "0.0.0.0:4318"

query:
  base-path: "/jaeger"

storage:
  type: "memory"
  memory:
    max-traces: 10000
```

### Tracing Integration
```javascript
// Backend tracing setup
const { trace, context } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const provider = new NodeTracerProvider();
const jaegerExporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces',
});

provider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));
provider.register();
```

## Deployment Procedures

### Step 1: Deploy Observability Stack
```bash
# Create monitoring directory
mkdir -p monitoring/{prometheus,grafana,logstash,rules}

# Deploy observability stack
docker-compose -f docker-compose.observability.yml up -d

# Verify deployment
docker-compose -f docker-compose.observability.yml ps
```

### Step 2: Configure Service Integration
```bash
# Add monitoring to main application
docker-compose up -d

# Verify metrics endpoints
curl -f http://localhost:3000/metrics
curl -f http://localhost:3001/metrics
```

### Step 3: Setup Dashboards
```bash
# Import Grafana dashboards
curl -X POST http://admin:admin@localhost:3001/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana/dashboards/system-overview.json
```

## Monitoring Best Practices

### Metrics Collection
- [ ] Collect business metrics alongside technical metrics
- [ ] Use consistent naming conventions
- [ ] Implement proper metric cardinality
- [ ] Set appropriate retention periods

### Alerting Best Practices
- [ ] Set meaningful alert thresholds
- [ ] Implement alert fatigue prevention
- [ ] Use proper alert grouping
- [ ] Include runbook links in alerts

### Dashboard Design
- [ ] Design for different user personas
- [ ] Use consistent color schemes
- [ ] Implement proper time ranges
- [ ] Include contextual information

## Maintenance Procedures

### Regular Maintenance Tasks
- [ ] Review and update alert thresholds
- [ ] Clean up old metrics and logs
- [ ] Update dashboard configurations
- [ ] Review alert effectiveness
- [ ] Update monitoring documentation

### Performance Optimization
```bash
# Optimize Prometheus storage
promtool tsdb analyze /prometheus

# Optimize Elasticsearch indices
curl -X POST "localhost:9200/_forcemerge?max_num_segments=1"

# Clean up old logs
curl -X DELETE "localhost:9200/safepsy-logs-$(date -d '30 days ago' +%Y.%m.%d)"
```

## Troubleshooting

### Common Issues

#### Prometheus Not Scraping
```bash
# Check Prometheus configuration
curl -f http://localhost:9090/api/v1/targets

# Check service endpoints
curl -f http://localhost:3000/metrics
curl -f http://localhost:3001/metrics
```

#### Grafana Dashboard Issues
```bash
# Check Grafana logs
docker logs safepsy-grafana

# Verify data source
curl -f http://admin:admin@localhost:3001/api/datasources
```

#### Log Collection Problems
```bash
# Check Logstash status
docker logs safepsy-logstash

# Verify Elasticsearch connectivity
curl -f http://localhost:9200/_cluster/health
```

## Security Considerations

### Access Control
- [ ] Implement proper authentication
- [ ] Use role-based access control
- [ ] Secure API endpoints
- [ ] Encrypt sensitive data

### Data Privacy
- [ ] Implement data retention policies
- [ ] Anonymize sensitive information
- [ ] Use secure communication channels
- [ ] Regular security audits

## Contact Information

### Monitoring Team
- **Observability Lead**: observability@safepsy.com
- **DevOps Team**: devops@safepsy.com
- **Security Team**: security@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Monitoring Support**: monitoring@safepsy.com
- **Technical Lead**: tech-lead@safepsy.com

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
**Approved By**: Observability Lead
