# OCI DevOps 배포 가이드

이 문서는 Oracle Cloud Infrastructure (OCI) DevOps 서비스를 사용하여 Rhythm Archive 애플리케이션을 빌드하고 배포하는 방법을 설명합니다.

## 사전 요구사항

1. OCI 계정 및 적절한 권한
2. OCI Container Registry 설정
3. OKE (Oracle Container Engine for Kubernetes) 클러스터
4. OCI CLI 설치 및 구성

## 1. OCI Container Registry 설정

### 1.1 Container Registry 생성

```bash
# OCI Console에서 Container Registry 생성
# 또는 OCI CLI 사용
oci artifacts container repository create \
  --compartment-id <compartment-id> \
  --display-name rhythm-archive \
  --is-public false
```

### 1.2 Registry 인증 설정

```bash
# Docker 로그인
docker login <region>.ocir.io
# 사용자명: <tenancy-namespace>/<username>
# 비밀번호: Auth Token
```

## 2. OCI DevOps 프로젝트 설정

### 2.1 DevOps 프로젝트 생성

1. OCI Console → Developer Services → DevOps → Projects
2. "Create Project" 클릭
3. 프로젝트 이름: `rhythm-archive-devops`
4. Compartment 선택

### 2.2 빌드 파이프라인 생성

1. 프로젝트 내에서 "Build Pipelines" → "Create Build Pipeline"
2. 파이프라인 이름: `rhythm-archive-build`
3. 빌드 스펙 파일: `build_spec.yaml` 사용

### 2.3 배포 파이프라인 생성

1. "Deploy Pipelines" → "Create Deploy Pipeline"
2. 파이프라인 이름: `rhythm-archive-deploy`
3. 배포 스펙 파일: `deploy_spec.yaml` 사용

## 3. 빌드 파이프라인 설정

### 3.1 빌드 스테이지 구성

1. **Build Stage** 추가
   - Build Spec: `build_spec.yaml`
   - Primary Source: Git Repository 연결
   - Build Parameters:
     - `BUILDRUN_HASH`: 빌드 실행 ID

### 3.2 Artifact Repository 설정

1. **Artifact Repository** 생성
   - Repository Type: Generic Artifacts
   - Repository Name: `rhythm-archive-k8s-manifests`
   - Description: Kubernetes manifests for Rhythm Archive

### 3.3 빌드 아티팩트 설정

`build_spec.yaml`에서 다음 아티팩트들이 자동으로 생성됩니다:

- **output-image**: Docker 이미지 (OCI Container Registry)
- **output-oci-oke-deployment**: Kubernetes 매니페스트 파일들 (`k8s/` 디렉토리)

## 4. 배포 파이프라인 설정

### 4.1 배포 환경 구성

1. **Deploy Stage** 추가
   - Deploy Spec: `deploy_spec.yaml`
   - Environment: OKE Cluster 선택
   - Artifacts:
     - `output-image`: 빌드 파이프라인에서 생성된 Docker 이미지
     - `output-oci-oke-deployment`: 빌드 파이프라인에서 생성된 K8s 매니페스트

### 4.2 OKE 클러스터 설정

```bash
# OKE 클러스터 생성 (OCI Console 또는 CLI)
# kubectl 설정
oci ce cluster create-kubeconfig \
  --cluster-id <cluster-id> \
  --file ~/.kube/config \
  --region <region>
```

### 4.3 OCI Container Registry Secret 생성

```bash
kubectl create secret docker-registry ocir-secret \
  --docker-server=<region>.ocir.io \
  --docker-username=<tenancy-namespace>/<username> \
  --docker-password=<auth-token> \
  --namespace=rhythm-archive
```

## 5. Kubernetes 매니페스트 파일 관리

### 5.1 매니페스트 파일 구조

```
k8s/
├── namespace.yaml          # 네임스페이스 정의
├── configmap.yaml          # 애플리케이션 설정
├── secret.yaml            # 민감한 정보
├── deployment.yaml        # 애플리케이션 배포
├── service.yaml           # 내부 서비스
├── ingress.yaml           # 외부 접근
├── kustomization.yaml     # Kustomize 설정
└── README.md              # 문서
```

### 5.2 매니페스트 파일 커스터마이징

빌드 과정에서 `build_spec.yaml`의 "Prepare Kubernetes Manifests" 단계에서:

- 이미지 태그가 자동으로 업데이트됨
- 환경별 설정이 적용됨

### 5.3 Artifact Repository에 매니페스트 추가

빌드 파이프라인에서 다음 단계가 자동으로 실행됩니다:

1. Kubernetes 매니페스트 파일 준비
2. 이미지 태그 업데이트
3. `k8s/` 디렉토리를 Artifact Repository에 업로드

## 6. CI/CD 파이프라인 실행

### 6.1 빌드 파이프라인 실행

1. DevOps 프로젝트 → Build Pipelines
2. `rhythm-archive-build` 선택
3. "Run Pipeline" 클릭
4. 빌드 파라미터 확인 및 실행

### 6.2 배포 파이프라인 실행

1. DevOps 프로젝트 → Deploy Pipelines
2. `rhythm-archive-deploy` 선택
3. "Run Pipeline" 클릭
4. 배포 환경 및 아티팩트 선택

## 7. 모니터링 및 로그

### 7.1 파이프라인 모니터링

- OCI DevOps 콘솔에서 실시간 빌드/배포 상태 확인
- 각 단계별 로그 확인
- 실패 시 자동 롤백 (설정된 경우)

### 7.2 애플리케이션 모니터링

```bash
# Pod 상태 확인
kubectl get pods -n rhythm-archive

# 서비스 상태 확인
kubectl get services -n rhythm-archive

# Ingress 상태 확인
kubectl get ingress -n rhythm-archive
```

### 7.3 로그 확인

```bash
# 애플리케이션 로그
kubectl logs -f deployment/rhythm-archive -n rhythm-archive

# 특정 Pod 로그
kubectl logs -f <pod-name> -n rhythm-archive
```

## 8. 트러블슈팅

### 8.1 빌드 파이프라인 문제

- **Docker 빌드 실패**: Dockerfile 문법 확인
- **의존성 설치 실패**: package.json 확인
- **테스트 실패**: 테스트 코드 및 환경 확인

### 8.2 배포 파이프라인 문제

- **이미지 풀 에러**: OCI Container Registry 인증 확인
- **Pod 시작 실패**: 환경 변수 및 ConfigMap 확인
- **서비스 연결 실패**: Service 및 Ingress 설정 확인

### 8.3 디버깅 명령어

```bash
# Pod 상세 정보
kubectl describe pod <pod-name> -n rhythm-archive

# 이벤트 확인
kubectl get events -n rhythm-archive

# ConfigMap 확인
kubectl get configmap rhythm-archive-config -n rhythm-archive -o yaml
```

## 9. 보안 고려사항

1. **Secret 관리**: 민감한 정보는 Kubernetes Secret 사용
2. **네트워크 보안**: Security Lists 및 Network Security Groups 설정
3. **이미지 스캔**: Container Registry의 취약점 스캔 활성화
4. **RBAC**: 적절한 Kubernetes RBAC 설정
5. **Vault 통합**: OCI Vault 서비스와 연동하여 Secret 관리

## 10. 비용 최적화

1. **리소스 제한**: Pod의 CPU/메모리 제한 설정
2. **오토스케일링**: HPA (Horizontal Pod Autoscaler) 설정
3. **스팟 인스턴스**: 비용 절약을 위한 스팟 인스턴스 사용 고려
4. **이미지 최적화**: 멀티스테이지 빌드로 이미지 크기 최소화

## 11. 백업 및 복구

1. **데이터베이스 백업**: MariaDB 데이터 정기 백업
2. **설정 백업**: ConfigMap 및 Secret 백업
3. **재해 복구**: 다중 리전 배포 고려
4. **Artifact 백업**: Container Registry 및 Artifact Repository 백업

## 12. 고급 기능

### 12.1 Blue-Green 배포

- 두 개의 환경을 번갈아가며 배포
- 롤백 시 빠른 전환 가능

### 12.2 Canary 배포

- 소수의 Pod에만 새 버전 배포
- 점진적으로 트래픽 증가

### 12.3 자동 스케일링

```yaml
# HPA 설정 예시
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: rhythm-archive-hpa
  namespace: rhythm-archive
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: rhythm-archive
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## 13. 참고 자료

- [OCI DevOps 공식 문서](https://docs.oracle.com/en-us/iaas/Content/devops/using/home.htm)
- [OKE 사용 가이드](https://docs.oracle.com/en-us/iaas/Content/ContEng/home.htm)
- [Kubernetes 공식 문서](https://kubernetes.io/docs/)
- [참고 링크](https://thekoguryo.github.io/oracle-cloudnative/devops/2.bluegreen-stragtegy/)
