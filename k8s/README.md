# Kubernetes Manifests for Rhythm Archive

이 디렉토리에는 OCI DevOps를 통해 OKE(Oracle Container Engine for Kubernetes)에 배포하기 위한 Kubernetes 매니페스트 파일들이 포함되어 있습니다.

## 파일 구조

```
k8s/
├── namespace.yaml          # 네임스페이스 정의
├── configmap.yaml          # 애플리케이션 설정
├── secret.yaml            # 민감한 정보 (JWT, DB 비밀번호 등)
├── deployment.yaml        # 애플리케이션 배포
├── service.yaml           # 내부 서비스
├── ingress.yaml           # 외부 접근 (로드밸런서)
├── kustomization.yaml     # Kustomize 설정
└── README.md              # 이 파일
```

## 배포 방법

### 1. OCI DevOps를 통한 배포 (권장)

1. OCI DevOps 콘솔에서 빌드 파이프라인 생성
2. `build_spec.yaml` 파일을 빌드 스펙으로 설정
3. 배포 파이프라인 생성
4. `deploy_spec.yaml` 파일을 배포 스펙으로 설정
5. 파이프라인 실행

### 2. 수동 배포

```bash
# 네임스페이스 생성
kubectl apply -f namespace.yaml

# ConfigMap 및 Secret 적용
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# 애플리케이션 배포
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

### 3. Kustomize를 사용한 배포

```bash
# 모든 리소스를 한 번에 적용
kubectl apply -k .

# 특정 환경에 맞게 커스터마이징
kubectl apply -k overlays/production/
```

## 환경 변수 설정

### ConfigMap (configmap.yaml)

- `NODE_ENV`: 실행 환경 (production)
- `PORT`: 애플리케이션 포트 (3000)
- `DATABASE_URL`: 데이터베이스 연결 문자열
- `JWT_EXPIRES_IN`: JWT 토큰 만료 시간
- `CORS_ORIGIN`: CORS 설정
- `UPLOAD_DEST`: 파일 업로드 경로
- `MAX_FILE_SIZE`: 최대 파일 크기

### Secret (secret.yaml)

- `JWT_SECRET`: JWT 서명 키
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호
- `OAUTH_CLIENT_SECRET`: OAuth 클라이언트 비밀번호

## 리소스 요구사항

### Deployment

- **Replicas**: 3
- **CPU Request**: 250m
- **CPU Limit**: 500m
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi

### Health Checks

- **Liveness Probe**: 30초 지연, 10초 간격
- **Readiness Probe**: 5초 지연, 5초 간격

## 네트워킹

### Service

- **Type**: ClusterIP
- **Port**: 80 → 3000

### Ingress

- **Class**: oci
- **Load Balancer**: Flexible shape (10-100 Mbps)
- **SSL Termination**: 활성화
- **TLS**: Let's Encrypt 인증서 사용

## 모니터링

### 로그 확인

```bash
# 애플리케이션 로그
kubectl logs -f deployment/rhythm-archive -n rhythm-archive

# 특정 Pod 로그
kubectl logs -f <pod-name> -n rhythm-archive
```

### 상태 확인

```bash
# Pod 상태
kubectl get pods -n rhythm-archive

# 서비스 상태
kubectl get services -n rhythm-archive

# Ingress 상태
kubectl get ingress -n rhythm-archive
```

## 트러블슈팅

### 일반적인 문제들

1. **Pod 시작 실패**
   - 환경 변수 및 ConfigMap 확인
   - 이미지 태그 확인
   - 리소스 제한 확인

2. **서비스 연결 실패**
   - Service 및 Ingress 설정 확인
   - 네트워크 정책 확인

3. **데이터베이스 연결 실패**
   - DATABASE_URL 설정 확인
   - 데이터베이스 서비스 상태 확인

### 디버깅 명령어

```bash
# Pod 상세 정보
kubectl describe pod <pod-name> -n rhythm-archive

# 이벤트 확인
kubectl get events -n rhythm-archive

# ConfigMap 확인
kubectl get configmap rhythm-archive-config -n rhythm-archive -o yaml

# Secret 확인
kubectl get secret rhythm-archive-secrets -n rhythm-archive -o yaml
```

## 보안 고려사항

1. **Secret 관리**: 민감한 정보는 Kubernetes Secret 사용
2. **RBAC**: 적절한 권한 설정
3. **네트워크 정책**: 필요한 포트만 열기
4. **이미지 스캔**: Container Registry의 취약점 스캔 활성화

## 업데이트 방법

### 이미지 업데이트

```bash
# 새 이미지로 배포
kubectl set image deployment/rhythm-archive rhythm-archive=<new-image>:<tag> -n rhythm-archive

# 롤링 업데이트 확인
kubectl rollout status deployment/rhythm-archive -n rhythm-archive
```

### 설정 업데이트

```bash
# ConfigMap 업데이트
kubectl apply -f configmap.yaml

# Secret 업데이트
kubectl apply -f secret.yaml

# Pod 재시작
kubectl rollout restart deployment/rhythm-archive -n rhythm-archive
```

# Blue/Green 배포를 위한 네임스페이스 및 NGINX Ingress 설정

## 네임스페이스

- `namespace-blue.yaml`: 블루 배포용 네임스페이스
- `namespace-green.yaml`: 그린 배포용 네임스페이스

## NGINX Ingress

- `ingress-blue.yaml`: 블루 네임스페이스용 인그레스 (host: blue.rhythm-archive.your-domain.com)
- `ingress-green.yaml`: 그린 네임스페이스용 인그레스 (host: green.rhythm-archive.your-domain.com)

## 사용 예시

```bash
kubectl apply -f namespace-blue.yaml
kubectl apply -f namespace-green.yaml
kubectl apply -f ingress-blue.yaml
kubectl apply -f ingress-green.yaml
```

## 인그레스 이름

- 블루: `rhythm-archive-blue-ingress`
- 그린: `rhythm-archive-green-ingress`

## 도메인 예시

- 블루: `blue.rhythm-archive.your-domain.com`
- 그린: `green.rhythm-archive.your-domain.com`

## 서비스 이름

- 두 네임스페이스 모두 `rhythm-archive-service`로 통일

## 참고

- 실제 배포 환경에 맞게 host 값을 수정하세요.
- NGINX Ingress Controller가 클러스터에 설치되어 있어야 합니다.
