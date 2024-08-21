---
title: OpenSearch 보안 시작하기
---

데모 구성을 사용하는 것이 OpenSearch 보안을 시작하는 가장 간단한 방법입니다. OpenSearch에는 `install_demo_configuration.sh` (Windows의 경우 `install_demo_configuration.bat`)을 포함한 여러 유용한 스크립트가 번들로 제공됩니다.

이 스크립트는 `plugins/opensearch-security/tools`에 위치하며 다음 작업을 수행합니다:

- 전송 및 REST 레이어 모두에서 TLS 암호화를 위한 데모 인증서를 생성합니다.
- 데모 사용자, 역할, 역할 매핑을 구성합니다.
- 인증 및 인가를 위한 내부 데이터베이스를 사용하도록 보안 플러그인을 구성합니다.
- 클러스터를 시작하는 데 필요한 기본 구성을 사용하여 `opensearch.yml` 파일을 업데이트합니다.

데모 구성 및 빠르게 시작하는 방법에 대한 자세한 정보는 [데모 구성 설정](https://opensearch.org/docs/latest/security/configuration/demo-configuration/)에서 찾을 수 있습니다.

{: .note}

데모 인증서 및 기본 비밀번호와 같은 이 구성의 특정 측면은 프로덕션에서 절대 사용해서는 안 됩니다. 프로덕션으로 진행하기 전에 데모 구성의 이러한 부분을 사용자 정의 정보로 교체해야 합니다.

{: .warning}

## 데모 구성 설정

`install_demo_configuration.sh` 스크립트를 실행하기 전에 강력한 비밀번호를 사용하여 `OPENSEARCH_INITIAL_ADMIN_PASSWORD`라는 환경 변수를 생성해야 합니다. 이는 OpenSearch와 인증하는 관리 사용자 비밀번호로 사용됩니다. [_Zxcvbn_](https://lowe.github.io/tryzxcvbn/) 온라인 도구를 사용하여 비밀번호의 강도를 테스트할 수 있습니다. 그런 다음, `install_demo_configuration.sh`를 실행하고 터미널 프롬프트에 필요한 세부 정보를 입력합니다.

스크립트가 실행된 후, 다음 명령을 실행하여 OpenSearch를 시작하고 구성을 테스트할 수 있습니다:

```
curl -k -XGET -u admin:<password> https://<opensearch-ip>:9200
```

다음과 유사한 출력이 표시됩니다:

```
{
  "name" : "smoketestnode",
  "cluster_name" : "opensearch",
  "cluster_uuid" : "1234abcd",
  "version" : {
    "number" : "1.0.0",
    "build_type" : "tar",
    "build_hash" : "abcd1234",
    "build_date" : "2020-01-01T00:00:00.000Z",
    "build_snapshot" : false,
    "lucene_version" : "8.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

## 역할 생성 및 사용자 매핑

보안을 설정할 때 사용자와 역할을 정의하고 매핑하는 것이 중요합니다. 

### 역할 생성

새 역할을 정의하려면 `roles.yml` 파일을 사용합니다. 예를 들어, `human_resources`라는 새 역할을 정의하려면 다음 구성을 추가합니다:

```
human_resources:
  cluster_permissions:
    - "cluster_composite_ops"
  index_permissions:
    - index_patterns:
      - "employees"
      allowed_actions:
      - "read"
  tenant_permissions:
    - tenant_patterns:
      - "global_tenant"
      allowed_actions:
      - "kibana_all_read"
```

이 예에서는 `employees` 인덱스에서 읽기 작업을 허용하고 `global_tenant`에 대한 `kibana_all_read` 작업을 허용하는 `human_resources` 역할을 정의합니다.

### 사용자 생성

사용자는 `internal_users.yml` 파일에 정의됩니다. 예를 들어, `test-user`라는 새 사용자를 생성하려면 다음 구성을 추가합니다:

```
test-user:
  hash: "$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36uFf4SLgRoxz8Z/q7o8Qle"
  reserved: false
  backend_roles:
    - "test-backend-role"
  description: "A test user"
```

이 예에서는 `test-backend-role` 백엔드 역할이 할당된 `test-user` 사용자를 생성합니다.

## 사용자와 역할 매핑

사용자가 OpenSearch에 로그인할 때 올바른 권한을 얻기 위해 적절한 역할에 매핑되어야 합니다. 이 매핑은 다음 구조를 사용하는 `roles_mapping.yml` 파일을 사용하여 수행됩니다:

```
<role_name>:
  users:
    - <username>
    - ...
  backend_roles:
    - <rolename>
```

새로 생성된 사용자 `test-user`를 `human_resources` 역할에 매핑하려면 `roles_mapping.yml` 파일에 다음 구성을 사용할 수 있습니다:

```
human_resources:
  backend_roles:
    - test-backend-role
```

추가 예로, `roles_mappings.yml` 파일에는 `kibanauser` 백엔드 역할이 `kibana_user` 역할에 매핑되어 있습니다:

```
kibana_user:
  reserved: false
  backend_roles:
  - "kibanauser"
  description: "Maps kibanauser to kibana_user"
```

## 보안 인덱스에 구성 업로드

사용자, 역할 또는 기타 보안 구성을 구성하는 최종 단계는 이를 OpenSearch 보안 인덱스에 업로드하는 것입니다. 파일을 업데이트만 하고 업로드하지 않으면 이미 실행 중인 OpenSearch 클러스터의 구성은 변경되지 않습니다.

구성을 업로드하려면 `install_demo_configuration.sh` 실행 중에 생성된 관리자 인증서를 사용하여 다음 명령을 사용할 수 있습니다:

```
./plugins/opensearch-security/tools/securityadmin.sh -cd "config/opensearch-security" -icl -key "../kirk-key.pem" -cert "../kirk.pem" -cacert "../root-ca.pem" -nhnv
```

## 다음 단계

[OpenSearch 보안 모범 사례](https://opensearch.org/docs/latest/security/configuration/best-practices/) 가이드는 OpenSearch 보안을 시작할 때 고려해야 할 10가지 사항을 다룹니다.

[보안 구성](https://opensearch.org/docs/latest/security/configuration/index/) 개요는 OpenSearch 구현에서 보안을 설정하는 기본 단계를 제공하며, 비즈니스 요구에 맞게 보안을 사용자 정의하는 정보에 대한 링크를 포함합니다.
