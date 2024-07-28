---
title: 데이터 검색
---

OpenSearch에서는 데이터를 검색하는 여러 가지 방법이 있습니다:

- [도메인 특화 언어(DSL)](https://opensearch.org/docs/latest/query-dsl/index/): 복잡하고 완전히 사용자 지정 가능한 쿼리를 생성할 수 있는 주요 OpenSearch 쿼리 언어입니다.
- [쿼리 문자열 쿼리 언어](https://opensearch.org/docs/latest/query-dsl/full-text/query-string/): 검색 요청의 쿼리 매개변수 또는 OpenSearch Dashboards에서 사용할 수 있는 축소된 쿼리 언어입니다.
- [SQL](https://opensearch.org/docs/latest/search-plugins/sql/sql/index/): 전통적인 관계형 데이터베이스 개념과 OpenSearch의 문서 지향 데이터 저장의 유연성을 연결하는 전통적인 쿼리 언어입니다.
- [파이프 처리 언어(PPL)](https://opensearch.org/docs/latest/search-plugins/sql/ppl/index/): OpenSearch에서 관측 가능성을 위해 사용하는 주요 언어입니다. PPL은 명령을 쿼리로 연결하는 파이프 구문을 사용합니다.
- [Dashboards 쿼리 언어(DQL)](https://opensearch.org/docs/latest/dashboards/dql/): OpenSearch Dashboards에서 데이터를 필터링하기 위한 간단한 텍스트 기반 쿼리 언어입니다.

### 데이터 준비

이 튜토리얼에서는 아직 학생 데이터를 색인하지 않았다면 색인해야 합니다. `students` 색인을 삭제하고(`DELETE /students`) 다음과 같은 대량 요청을 보냄으로써 시작할 수 있습니다:

```json
POST _bulk
{ "create": { "_index": "students", "_id": "1" } }
{ "name": "John Doe", "gpa": 3.89, "grad_year": 2022}
{ "create": { "_index": "students", "_id": "2" } }
{ "name": "Jonathan Powers", "gpa": 3.85, "grad_year": 2025 }
{ "create": { "_index": "students", "_id": "3" } }
{ "name": "Jane Doe", "gpa": 3.52, "grad_year": 2024 }
```

### 색인의 모든 문서 검색

색인의 모든 문서를 검색하려면 다음 요청을 보냅니다:

```sh
GET /students/_search
```

이전 요청은 색인의 모든 문서와 일치하는 match_all 쿼리와 동일합니다:

```json
GET /students/_search
{
  "query": {
    "match_all": {}
  }
}
```

### 쿼리 컨텍스트

쿼리 컨텍스트에서는 스코어링(문서 일치 점수 매기기)이 발생하며, 이는 문서를 검색 결과에서 가장 관련성이 높은 순서로 정렬하는 데 사용됩니다.

#### 일치 쿼리

문서를 검색하려면 match 쿼리를 사용하여 필드 값과 텍스트를 일치시킵니다. 예를 들어, 이름이 "doe"와 일치하는 학생을 검색하려면 다음 요청을 보냅니다:

```json
GET students/_search
{
  "query": {
    "match": {
      "name": "doe"
    }
  }
}
```

다음 쿼리는 학생 이름과 졸업 연도를 매칭하여 이름이 "doe"이고 졸업 연도가 2022년인 학생을 검색합니다:

```json
GET students/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "doe" }},
        { "term": { "grad_year": 2022 }}
      ]
    }
  }
}
```

#### 필터

Boolean 쿼리를 사용하여 정확한 값이 있는 필드에 대해 필터 절을 쿼리에 추가할 수 있습니다.

Term 필터는 특정 용어와 일치합니다. 예를 들어, 다음 Boolean 쿼리는 졸업 연도가 2022년인 학생을 검색합니다:

```json
GET students/_search
{
  "query": { 
    "bool": { 
      "filter": [ 
        { "term":  { "grad_year": 2022 }}
      ]
    }
  }
}
```

범위 필터를 사용하여 값의 범위를 지정할 수 있습니다. 예를 들어, 다음 Boolean 쿼리는 GPA가 3.6보다 큰 학생을 검색합니다:

```json
GET students/_search
{
  "query": { 
    "bool": { 
      "filter": [ 
        { "range": { "gpa": { "gt": 3.6 }}}
      ]
    }
  }
}
```

필터에 대한 자세한 내용은 [쿼리 및 필터 컨텍스트](https://opensearch.org/docs/latest/query-dsl/query-filter-context/)를 참조하십시오.

#### 복합 쿼리

복합 쿼리를 사용하면 여러 쿼리 또는 필터 절을 결합할 수 있습니다. Boolean 쿼리는 복합 쿼리의 예입니다.

예를 들어, 이름이 "doe"와 일치하고 졸업 연도와 GPA로 필터링된 학생을 검색하려면 다음 요청을 사용합니다:

```json
GET students/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "doe"
          }
        },
        { "range": { "gpa": { "gte": 3.6, "lte": 3.9 } } },
        { "term":  { "grad_year": 2022 }}
      ]
    }
  }
}
```

Boolean 및 기타 복합 쿼리에 대한 자세한 내용은 [복합 쿼리](https://opensearch.org/docs/latest/query-dsl/compound/index/)를 참조하십시오.

### 검색 방법

이 튜토리얼에서 설명한 전통적인 전체 텍스트 검색 외에도 OpenSearch는 k-NN, 시맨틱, 멀티모달, 스파스, 하이브리드 및 대화형 검색을 포함한 다양한 머신 러닝(ML) 기반 검색 방법을 지원합니다. OpenSearch에서 지원하는 모든 검색 방법에 대한 정보는 [검색](https://opensearch.org/docs/latest/search-plugins/)을 참조하십시오.
