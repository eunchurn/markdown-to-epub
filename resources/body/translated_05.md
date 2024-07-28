---
title: 데이터를 OpenSearch에 삽입하기
---

OpenSearch에 데이터를 삽입하는 방법에는 여러 가지가 있습니다:

- 개별 문서를 삽입합니다. 자세한 내용은 [문서 색인화](https://opensearch.org/docs/latest/getting-started/communicate/#indexing-documents)를 참조하십시오.
- 여러 문서를 대량으로 색인화합니다. 자세한 내용은 [대량 색인화](https://opensearch.org/docs/latest/getting-started/ingest-data/#bulk-indexing)를 참조하십시오.
- 데이터 프레퍼를 사용합니다. 데이터 프레퍼는 다운스트림 분석 및 시각화를 위해 데이터를 강화할 수 있는 OpenSearch 서버 측 데이터 수집기입니다. 자세한 내용은 [데이터 프레퍼](https://opensearch.org/docs/latest/data-prepper/)를 참조하십시오.
- 기타 데이터 삽입 도구를 사용합니다. 자세한 내용은 [OpenSearch 도구](https://opensearch.org/docs/latest/tools/)를 참조하십시오.

### 대량 색인화

문서를 대량으로 색인화하려면 [Bulk API](https://opensearch.org/docs/latest/api-reference/document-apis/bulk/)를 사용할 수 있습니다. 예를 들어, 여러 문서를 `students` 색인에 색인화하려면 다음 요청을 보냅니다:

```json
POST _bulk
{ "create": { "_index": "students", "_id": "2" } }
{ "name": "Jonathan Powers", "gpa": 3.85, "grad_year": 2025 }
{ "create": { "_index": "students", "_id": "3" } }
{ "name": "Jane Doe", "gpa": 3.52, "grad_year": 2024 }
```

### 샘플 데이터로 실험하기

OpenSearch는 REST API 요청 및 OpenSearch Dashboards 시각화를 실험할 수 있는 가상의 전자 상거래 데이터 세트를 제공합니다. 해당 데이터 세트 및 매핑 파일을 다운로드하여 색인을 생성하고 필드 매핑을 정의할 수 있습니다.

#### 샘플 색인 생성

샘플 색인을 생성하고 문서 필드에 대한 필드 매핑을 정의하려면 다음 단계를 따르십시오:

1. [ecommerce-field_mappings.json](https://github.com/opensearch-project/documentation-website/blob/2.15/assets/examples/ecommerce-field_mappings.json)을 다운로드합니다. 이 파일은 사용할 샘플 데이터에 대한 [매핑](https://opensearch.org/docs/latest/opensearch/mappings/)을 정의합니다.

cURL을 사용하려면 다음 요청을 보냅니다:

```sh
curl -O https://raw.githubusercontent.com/opensearch-project/documentation-website/2.15/assets/examples/ecommerce-field_mappings.json
```

wget을 사용하려면 다음 요청을 보냅니다:

```sh
wget https://raw.githubusercontent.com/opensearch-project/documentation-website/2.15/assets/examples/ecommerce-field_mappings.json
```

2. [ecommerce.json](https://github.com/opensearch-project/documentation-website/blob/2.15/assets/examples/ecommerce.json)을 다운로드합니다. 이 파일에는 Bulk API로 삽입할 수 있도록 형식이 지정된 색인 데이터가 포함되어 있습니다.

cURL을 사용하려면 다음 요청을 보냅니다:

```sh
curl -O https://raw.githubusercontent.com/opensearch-project/documentation-website/2.15/assets/examples/ecommerce.json
```

wget을 사용하려면 다음 요청을 보냅니다:

```sh
wget https://raw.githubusercontent.com/opensearch-project/documentation-website/2.15/assets/examples/ecommerce.json
```

3. 매핑 파일에 제공된 필드 매핑을 정의합니다:

```sh
curl -H "Content-Type: application/x-ndjson" -X PUT "https://localhost:9200/ecommerce" -ku admin:<custom-admin-password> --data-binary "@ecommerce-field_mappings.json"
```

4. Bulk API를 사용하여 문서를 업로드합니다:

```sh
curl -H "Content-Type: application/x-ndjson" -X PUT "https://localhost:9200/ecommerce/_bulk" -ku admin:<custom-admin-password> --data-binary "@ecommerce.json"
```

#### 데이터 쿼리하기

Search API를 사용하여 데이터를 쿼리합니다. 다음 쿼리는 `customer_first_name`이 `Sonya`인 문서를 검색합니다:

```json
GET ecommerce/_search
{
  "query": {
    "match": {
      "customer_first_name": "Sonya"
    }
  }
}
```

#### 데이터 시각화

OpenSearch Dashboards를 사용하여 데이터를 시각화하는 방법에 대해 알아보려면 [OpenSearch Dashboards 빠른 시작 가이드](https://opensearch.org/docs/latest/dashboards/quickstart/)를 참조하십시오.

### 추가 읽기

- 데이터 프레퍼에 대한 자세한 내용은 [데이터 프레퍼](https://opensearch.org/docs/latest/data-prepper/)를 참조하십시오.
- 데이터 삽입 도구에 대한 자세한 내용은 [OpenSearch 도구](https://opensearch.org/docs/latest/tools/)를 참조하십시오.
- OpenSearch Dashboards에 대한 자세한 내용은 [OpenSearch Dashboards 빠른 시작 가이드](https://opensearch.org/docs/latest/dashboards/quickstart/)를 참조하십시오.
- 대량 색인화에 대한 자세한 내용은 [Bulk API](https://opensearch.org/docs/latest/api-reference/document-apis/bulk/)를 참조하십시오.
