# SocialLink Platform Architecture

**Technical Specification Document**
*   **Classification**: RESTRICTED (Engineering Only)
*   **System Owner**: CTO
*   **Last Update**: 2026-02-01

---

## 1. High Level Design
The SocialLink platform operates as a distributed microservices architecture on AWS. It is designed for high availability (99.99%) and strict data sovereignty compliancy.

## 2. Data Ingestion Layer
**2.1 Connectors**: We utilize official Enterprise APIs for Reddit, X/Twitter, and Meta. Screen-scraping is strictly prohibited at the architecture level.
**2.2 Queueing**: Incoming data is buffered in Apache Kafka (Topic: `social-firehose-v1`) to handle spike loads.

## 3. Processing Core (The Brain)
**3.1 Sentiment Engine**: A BERT-based model fine-tuned on our proprietary 'Brand Risk' dataset.
**3.2 Entity Recognition**: Named Entity Recognition (NER) extracts brands, locations, and competitors for cross-referencing against the CSV Registries.

## 4. Storage Layer
**4.1 Hot Storage**: PostgreSQL for transactional data (User sessions, draft locks).
**4.2 Cold Storage**: S3 Glacier for audit logs (7-year retention). Immutability flags enabled.

## 5. Network Security Architecture
All services run inside a VPC. No public ingress except via the WAF-protected API Gateway. Database subnets are air-gapped from the internet.

