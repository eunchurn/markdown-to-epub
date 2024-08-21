---
title: OpenSearch와 통신하기
---

OpenSearch와 통신하려면 REST API 또는 OpenSearch 언어 클라이언트를 사용할 수 있습니다. 이 페이지에서는 OpenSearch REST API를 소개합니다. 프로그래밍 언어로 OpenSearch와 통신해야 하는 경우 사용 가능한 클라이언트 목록은 클라이언트 섹션을 참조하십시오.

### OpenSearch REST API

REST API를 사용하여 OpenSearch 클러스터와 상호작용할 수 있으며, 이는 많은 유연성을 제공합니다. REST API를 통해 대부분의 OpenSearch 설정을 변경하고, 인덱스를 수정하며, 클러스터 상태를 확인하고, 통계를 가져오는 등 거의 모든 작업을 수행할 수 있습니다. cURL과 같은 클라이언트나 HTTP 요청을 보낼 수 있는 프로그래밍 언어를 사용할 수 있습니다.

터미널이나 OpenSearch Dashboards의 [개발 도구 콘솔](https://opensearch.org/docs/latest/dashboards/dev-tools/index-dev/)에서 HTTP 요청을 보낼 수 있습니다.

#### 터미널에서 요청 보내기

터미널에서 cURL 요청을 보낼 때, 보안 플러그인을 사용하는지 여부에 따라 요청 형식이 달라집니다. 예를 들어, 클러스터 상태 API에 대한 요청을 고려해 보겠습니다.

보안 플러그인을 사용하지 않는 경우, 다음 요청을 보냅니다:

```sh
curl -XGET "http://localhost:9200/_cluster/health"
```

보안 플러그인을 사용하는 경우, 요청에 사용자 이름과 비밀번호를 제공합니다:

```sh
curl -X GET "http://localhost:9200/_cluster/health" -ku admin:<custom-admin-password>
```

기본 사용자 이름은 `admin`이며, 비밀번호는 `docker-compose.yml` 파일의 `OPENSEARCH_INITIAL_ADMIN_PASSWORD=<custom-admin-password>` 설정에 지정됩니다.

OpenSearch는 기본적으로 평면 JSON 형식으로 응답을 반환합니다. 사람이 읽기 쉬운 응답 본문을 얻으려면 `pretty` 쿼리 매개변수를 제공합니다:

```sh
curl -XGET "http://localhost:9200/_cluster/health?pretty"
```

`pretty` 및 기타 유용한 쿼리 매개변수에 대한 자세한 내용은 [일반 REST 매개변수](https://opensearch.org/docs/latest/opensearch/common-parameters/)를 참조하십시오.

본문이 포함된 요청의 경우, `Content-Type` 헤더를 지정하고 본문을 JSON 형식으로 제공합니다. 예를 들어, 새로운 색인을 생성하려면 다음과 같이 합니다:

```json
curl -X PUT "http://localhost:9200/students" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "index": {
      "number_of_shards": 1
    }
  }
}
'
```

색인을 생성한 후, 문서를 색인화할 수 있습니다:

```json
curl -X PUT "http://localhost:9200/students/_doc/1" -H 'Content-Type: application/json' -d'
{
  "name": "John Doe",
  "gpa": 3.89,
  "grad_year": 2022
}
'
```

이제 색인을 검색할 수 있습니다:

```sh
curl -X GET "http://localhost:9200/students/_search?q=name:John"
```

#### Dev Tools 콘솔에서 요청 보내기

OpenSearch Dashboards의 개발 도구 콘솔은 cURL 명령을 작성하지 않고도 HTTP 요청을 보낼 수 있는 편리한 방법을 제공합니다. 개발 도구 콘솔을 열고 다음 명령을 입력하여 클러스터 상태를 확인할 수 있습니다:

```sh
GET /_cluster/health
```

### 맵핑 및 설정

맵핑은 색인의 필드 유형을 정의합니다. 색인을 생성할 때 맵핑을 지정할 수 있습니다. 예를 들어, 다음 요청은 색인의 이름, 생성 날짜, 샤드 수를 지정합니다. 자세한 내용은 [OpenSearch 구성](https://opensearch.org/docs/latest/install-and-configure/configuring-opensearch/index/)을 참조하십시오.

하나의 요청으로 맵핑과 설정을 지정할 수 있습니다. 예를 들어, 다음 요청은 색인의 샤드 수를 지정하고 `name` 필드를 `text`로, `grad_year` 필드를 `date`로 매핑합니다:

```json
PUT /students
{
  "settings": {
    "index.number_of_shards": 1
  }, 
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "grad_year": {
        "type": "date"
      }
    }
  }
}
```

이제 이전 섹션에서 색인화한 것과 동일한 문서를 색인화할 수 있습니다:

```json
PUT /students/_doc/1
{
  "name": "John Doe",
  "gpa": 3.89,
  "grad_year": 2022
}
```

색인 필드의 맵핑을 보려면 다음 요청을 보냅니다:

```sh
GET /students/_mapping
```

OpenSearch는 지정된 유형에 따라 `name` 및 `grad_year` 필드를 매핑하고, `gpa` 필드의 유형을 유추합니다:

```json
{
  "students": {
    "mappings": {
      "properties": {
        "gpa": {
          "type": "float"
        },
        "grad_year": {
          "type": "date"
        },
        "name": {
          "type": "text"
        }
      }
    }
  }
}
```

> 필드가 생성된 후에는 유형을 변경할 수 없습니다. 필드 유형을 변경하려면 색인을 삭제하고 새로운 맵핑으로 다시 생성해야 합니다.

### 추가 읽기

- OpenSearch REST API에 대한 정보는 [REST API 참조](https://opensearch.org/docs/latest/api-reference/)를 참조하십시오.
- OpenSearch 언어 클라이언트에 대한 정보는 [클라이언트](https://opensearch.org/docs/latest/clients/)를 참조하십시오.
- 맵핑에 대한 정보는 [맵핑 및 필드 유형](https://opensearch.org/docs/latest/field-types/)을 참조하십시오.
- 설정에 대한 정보는 [OpenSearch 구성](https://opensearch.org/docs/latest/install-and-configure/configuring-opensearch/index/)을 참조하십시오.
