---
title: 설치 시작하기
---

OpenSearch 및 OpenSearch Dashboards를 사용하려면 [Docker](https://www.docker.com/)로 컨테이너를 배포하여 시작할 수 있습니다. 진행하기 전에 로컬 머신에 [Docker](https://docs.docker.com/get-docker/)와 [Docker Compose](https://github.com/docker/compose)가 설치되어 있어야 합니다.

### 클러스터 시작하기

Docker Compose는 Compose 파일이라는 특별한 파일을 사용하여 클러스터의 컨테이너를 정의하고 생성합니다. OpenSearch 프로젝트에서는 시작하기 위해 사용할 수 있는 샘플 Compose 파일을 제공합니다. Compose 파일 작업에 대한 자세한 내용은 공식 [Compose 사양](https://docs.docker.com/compose/compose-file/)을 참조하십시오.

1. 머신에서 OpenSearch를 실행하기 전에 성능을 향상시키고 OpenSearch에서 사용할 수 있는 메모리 맵 수를 늘리기 위해 호스트의 메모리 페이징 및 스왑 성능을 비활성화해야 합니다.

메모리 페이징 및 스왑 비활성화:

```sh
sudo swapoff -a
```

호스트의 최대 맵 수를 정의하는 sysctl 구성 파일을 편집합니다:

```go
vm.max_map_count=262144
```

커널 매개변수를 다시 로드합니다:

```sh
sudo sysctl -p
```

자세한 내용은 중요 시스템 설정을 참조하십시오.

2. 호스트에 샘플 Compose 파일을 다운로드합니다. curl과 wget 같은 명령줄 유틸리티를 사용하거나 웹 브라우저를 사용하여 OpenSearch 프로젝트 문서 웹사이트 저장소에서 [docker-compose.yml](https://github.com/opensearch-project/documentation-website/blob/2.15/assets/examples/docker-compose.yml) 파일을 수동으로 복사할 수 있습니다.

cURL을 사용하려면 다음 요청을 보냅니다:

```sh
curl -O https://raw.githubusercontent.com/opensearch-project/documentation-website/2.15/assets/examples/docker-compose.yml
```

wget을 사용하려면 다음 요청을 보냅니다:

```sh
wget https://raw.githubusercontent.com/opensearch-project/documentation-website/2.15/assets/examples/docker-compose.yml
```

3. 터미널 애플리케이션에서 `docker-compose.yml` 파일이 있는 디렉터리로 이동합니다.

```sh
cd <directory-path>
```

4. 다음 명령을 실행하여 OpenSearch 클러스터를 시작합니다:

```sh
docker-compose up
```

이 명령은 OpenSearch와 OpenSearch Dashboards가 포함된 두 개의 노드를 시작합니다.

### 문제 해결

#### 오류 메시지: "docker: 'compose' is not a docker command."

Docker Desktop을 설치한 경우 Docker Compose는 이미 머신에 설치되어 있습니다. 하이픈 없이 `docker compose`를 대신 사용해 보십시오. [Docker Compose 사용](https://docs.docker.com/get-started/08_using_compose/)을 참조하십시오.

#### 오류 메시지: "docker: 'compose'는 Docker 명령이 아닙니다."

Docker Engine을 설치한 경우 Docker Compose를 별도로 설치해야 하며, 하이픈과 함께 `docker-compose` 명령을 사용합니다. [Docker Compose](https://github.com/docker/compose)를 참조하십시오.

#### 오류 메시지: "max virtual memory areas vm.max_map_count [65530] is too low"

호스트의 `vm.max_map_count`가 너무 낮으면 OpenSearch가 시작되지 않습니다. 서비스 로그에서 다음 오류가 발생하면 [중요 시스템 설정](https://opensearch.org/docs/latest/opensearch/install/important-settings/)을 검토하고 `vm.max_map_count`를 적절히 설정하십시오.

```
opensearch-node1         | ERROR: [1] bootstrap checks failed
opensearch-node1         | [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
opensearch-node1         | ERROR: OpenSearch did not exit normally - check the logs at /usr/share/opensearch/logs/opensearch-cluster.log
```

### 다른 설치 유형

Docker 외에도 OpenSearch를 다양한 Linux 배포판과 Windows에 설치할 수 있습니다. 사용 가능한 모든 설치 가이드는 [OpenSearch 설치 및 업그레이드](https://opensearch.org/docs/latest/install-and-configure/)를 참조하십시오.

### 추가 읽기

OpenSearch Dashboards를 사용하여 자체 OpenSearch 클러스터를 배포하고 샘플 데이터를 추가했습니다. 이제 구성 및 기능에 대해 더 자세히 배울 준비가 되었습니다. 시작할 위치에 대한 몇 가지 추천 사항은 다음과 같습니다:

- [보안 플러그인 소개](https://opensearch.org/docs/latest/security/index/)
- [OpenSearch 구성](https://opensearch.org/docs/latest/install-and-configure/configuring-opensearch/)
- [OpenSearch 플러그인 설치](https://opensearch.org/docs/latest/opensearch/install/plugins/)
