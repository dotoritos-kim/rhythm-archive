# OCI 배포 문제 해결 가이드

## 현재 발생한 문제 분석

### 1. grep 명령어 오류

```
EXEC: Usage: grep [OPTION]... PATTERN [FILE]...
EXEC: Try 'grep --help' for more information.
```

**원인**: grep 명령어가 잘못된 인수로 실행됨
**해결책**: build_spec.yaml에서 grep 명령어 사용 시 적절한 인수 제공

### 2. Docker 이미지 저장 실패

```
Docker image $IMAGE_PATH:$TAG not found. Please pull/build the image to make it available.
Unable to save docker image artifact $IMAGE_PATH:$TAG in the build spec file.
```

**원인**:

- IMAGE_PATH 또는 TAG 변수가 제대로 설정되지 않음
- Docker 빌드가 실패했거나 이미지가 제대로 생성되지 않음
- OCI Container Registry 인증 문제

**해결책**:

- 변수 설정 로직 개선
- Docker 빌드 과정에 더 자세한 로깅 추가
- 이미지 존재 여부 확인 후 저장

## 수정된 해결책

### 1. build_spec.yaml 개선사항

#### 변수 설정 개선

```yaml
- type: Command
  name: 'Define Image Tag - Commit ID'
  timeoutInSeconds: 30
  command: |
    if [ -n "${OCI_TRIGGER_COMMIT_HASH}" ]; then
      COMMIT_ID=$(echo "${OCI_TRIGGER_COMMIT_HASH}" | cut -c 1-7)
      TAG=$COMMIT_ID
    else
      BUILDRUN_HASH=$(echo "${OCI_BUILD_RUN_ID}" | rev | cut -c 1-7)
      TAG=$BUILDRUN_HASH
    fi
    echo "TAG set to: $TAG"
    export TAG
```

#### Docker 빌드 개선

```yaml
- type: Command
  name: 'Build Container Image'
  timeoutInSeconds: 1200
  command: |
    cd ${OCI_PRIMARY_SOURCE_DIR}
    echo "Current directory: $(pwd)"
    echo "Building Docker image with tag: $IMAGE_PATH:$TAG"
    echo "Docker build context:"
    ls -la

    # Build the Docker image
    docker build --pull --rm -t $IMAGE_PATH:$TAG . --build-arg BUILDKIT_INLINE_CACHE=1
    BUILD_EXIT_CODE=$?
    echo "Docker build exit code: $BUILD_EXIT_CODE"

    if [ $BUILD_EXIT_CODE -eq 0 ]; then
      docker tag $IMAGE_PATH:$TAG $IMAGE_PATH:latest
      echo "Docker image built and tagged successfully"
      echo "Available Docker images:"
      docker images
      echo "Checking for our image:"
      docker images | grep "$IMAGE_PATH" || echo "Image not found in docker images list"
    else
      echo "Docker build failed with exit code: $BUILD_EXIT_CODE"
      exit $BUILD_EXIT_CODE
    fi
```

#### 이미지 푸시 개선

```yaml
- type: Command
  name: 'Push Container Image'
  timeoutInSeconds: 600
  command: |
    echo "Verifying image exists before pushing..."
    docker images | grep "$IMAGE_PATH" || (echo "Image not found, cannot push" && exit 1)

    echo "Pushing Docker image: $IMAGE_PATH:$TAG"
    docker push $IMAGE_PATH:$TAG
    PUSH_EXIT_CODE=$?
    echo "Push exit code for $TAG: $PUSH_EXIT_CODE"

    echo "Pushing Docker image: $IMAGE_PATH:latest"
    docker push $IMAGE_PATH:latest
    LATEST_PUSH_EXIT_CODE=$?
    echo "Push exit code for latest: $LATEST_PUSH_EXIT_CODE"

    if [ $PUSH_EXIT_CODE -eq 0 ] && [ $LATEST_PUSH_EXIT_CODE -eq 0 ]; then
      echo "Container images pushed successfully"
    else
      echo "Failed to push one or more images"
      exit 1
    fi
```

### 2. Dockerfile 개선사항

#### Health Check 수정

```dockerfile
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1
```

#### curl 설치 추가

```dockerfile
# Install curl for health check
RUN apk add --no-cache curl
```

### 3. package.json 개선사항

#### build:safe 스크립트 추가

```json
"build:safe": "nest build || (echo 'Build failed, trying with legacy peer deps' && npm install --legacy-peer-deps && nest build)"
```

## 추가 디버깅 단계

### 1. 빌드 전 확인사항

1. **OCI CLI 인증 확인**

   ```bash
   oci os ns get --query data --raw-output
   ```

2. **Docker 로그인 확인**

   ```bash
   docker login <region>.ocir.io
   ```

3. **필수 파일 존재 확인**
   ```bash
   ls -la Dockerfile
   ls -la package.json
   ls -la k8s/deployment.yaml
   ```

### 2. 빌드 중 확인사항

1. **변수 설정 확인**

   ```bash
   echo "IMAGE_PATH: $IMAGE_PATH"
   echo "TAG: $TAG"
   echo "APP_NAME: $APP_NAME"
   ```

2. **Docker 빌드 컨텍스트 확인**

   ```bash
   ls -la
   ```

3. **Docker 이미지 생성 확인**
   ```bash
   docker images
   ```

### 3. 배포 전 확인사항

1. **OKE 클러스터 연결 확인**

   ```bash
   kubectl cluster-info
   ```

2. **Namespace 존재 확인**

   ```bash
   kubectl get namespaces | grep rhythm-archive
   ```

3. **Secret 존재 확인**
   ```bash
   kubectl get secrets -n rhythm-archive
   ```

## 일반적인 문제 해결

### 1. 권한 문제

- OCI IAM 정책 확인
- Container Registry 권한 확인
- OKE 클러스터 권한 확인

### 2. 네트워크 문제

- Security Lists 설정 확인
- Network Security Groups 설정 확인
- VCN 설정 확인

### 3. 리소스 문제

- 컴퓨트 인스턴스 사양 확인
- 스토리지 용량 확인
- 메모리 사용량 확인

## 모니터링 및 로그

### 1. 빌드 로그 확인

```bash
# OCI DevOps 콘솔에서 실시간 로그 확인
# 또는 CLI 사용
oci devops build-run get --build-run-id <build-run-id>
```

### 2. 배포 로그 확인

```bash
# Pod 로그 확인
kubectl logs -f deployment/rhythm-archive -n rhythm-archive

# 이벤트 확인
kubectl get events -n rhythm-archive --sort-by='.lastTimestamp'
```

### 3. 애플리케이션 상태 확인

```bash
# Pod 상태 확인
kubectl get pods -n rhythm-archive

# 서비스 상태 확인
kubectl get services -n rhythm-archive

# Ingress 상태 확인
kubectl get ingress -n rhythm-archive
```

## 예방 조치

1. **정기적인 테스트**: 로컬에서 Docker 빌드 테스트
2. **변수 검증**: 빌드 전 환경 변수 설정 확인
3. **권한 검토**: 정기적인 IAM 정책 검토
4. **리소스 모니터링**: 사용량 및 한도 모니터링
5. **백업**: 중요한 설정 및 매니페스트 파일 백업

## 연락처 및 지원

- OCI 지원: OCI Console → Support
- 커뮤니티 포럼: Oracle Cloud Community
- 공식 문서: [OCI DevOps 문서](https://docs.oracle.com/en-us/iaas/Content/devops/using/home.htm)
