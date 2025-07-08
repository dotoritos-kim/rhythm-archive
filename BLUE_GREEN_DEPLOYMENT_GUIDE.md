# Rhythm Archive 블루-그린 배포 가이드

## 개요

이 문서는 OKE(Oracle Container Engine for Kubernetes)에서 Rhythm Archive 애플리케이션을 블루-그린 배포 방식으로 배포하는 방법을 설명합니다.

## 블루-그린 배포란?

블루-그린 배포는 두 개의 동일한 환경(블루와 그린)을 유지하면서, 새 버전을 비활성 환경에 먼저 배포한 후 트래픽을 전환하는 배포 방식입니다.

### 장점

- **제로 다운타임**: 서비스 중단 없이 배포 가능
- **빠른 롤백**: 문제 발생 시 즉시 이전 환경으로 전환 가능
- **안전한 테스트**: 새 버전을 실제 환경에서 테스트 가능

## 파일 구조

```
rhythm-archive-blue-green-deployment.yaml  # 통합 Kubernetes 매니페스트
blue-green-deployment-script.sh           # 배포 자동화 스크립트
BLUE_GREEN_DEPLOYMENT_GUIDE.md            # 이 가이드 문서
```

## 사전 준비사항

### 1. OKE 클러스터 설정

- OKE 클러스터가 생성되어 있어야 합니다
- kubectl이 클러스터에 연결되어 있어야 합니다
- cert-manager가 설치되어 있어야 합니다 (SSL 인증서용)

### 2. 도메인 설정

- 메인 도메인: `rhythm-archive.your-domain.com`
- 그린 환경 도메인: `green.rhythm-archive.your-domain.com`
- DNS 레코드가 OKE 로드밸런서 IP로 설정되어 있어야 합니다

### 3. 이미지 준비

- Docker 이미지가 OCI Container Registry에 푸시되어 있어야 합니다
- 이미지 태그 형식: `rhythm-archive:<version>`

## 배포 단계

### 1단계: 초기 설정 적용

```bash
# Kubernetes 매니페스트 적용
kubectl apply -f rhythm-archive-blue-green-deployment.yaml
```

### 2단계: Secret 설정

실제 환경에 맞게 Secret 값을 설정해야 합니다:

```bash
# 데이터베이스 URL 설정
kubectl create secret generic rhythm-archive-secrets \
  --from-literal=database-url="your-database-url" \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=oauth-client-id="your-oauth-client-id" \
  --from-literal=oauth-client-secret="your-oauth-client-secret" \
  -n rhythm-archive-blue

kubectl create secret generic rhythm-archive-secrets \
  --from-literal=database-url="your-database-url" \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=oauth-client-id="your-oauth-client-id" \
  --from-literal=oauth-client-secret="your-oauth-client-secret" \
  -n rhythm-archive-green
```

### 3단계: 배포 스크립트 실행 권한 부여

```bash
chmod +x blue-green-deployment-script.sh
```

### 4단계: 첫 번째 배포

```bash
# 블루 환경에 첫 번째 배포
./blue-green-deployment-script.sh deploy v1.0.0
```

## 배포 스크립트 사용법

### 기본 명령어

```bash
# 새 버전 배포
./blue-green-deployment-script.sh deploy <image_tag>

# 특정 환경으로 롤백
./blue-green-deployment-script.sh rollback <environment>

# 현재 상태 확인
./blue-green-deployment-script.sh status

# 특정 환경 헬스 체크
./blue-green-deployment-script.sh health <environment>
```

### 사용 예시

```bash
# v1.1.0 배포
./blue-green-deployment-script.sh deploy v1.1.0

# 블루 환경으로 롤백
./blue-green-deployment-script.sh rollback blue

# 상태 확인
./blue-green-deployment-script.sh status

# 그린 환경 헬스 체크
./blue-green-deployment-script.sh health green
```

## 배포 프로세스

### 1. 자동 환경 선택

- 현재 활성 환경이 블루면 그린에 배포
- 현재 활성 환경이 그린이면 블루에 배포
- 둘 다 비활성이면 블루부터 시작

### 2. 배포 단계

1. **타겟 환경 배포**: 새 버전을 비활성 환경에 배포
2. **헬스 체크**: 배포된 환경이 정상 작동하는지 확인
3. **트래픽 전환**: 활성 환경을 새로 배포된 환경으로 변경
4. **스케일링**: 새 환경을 프로덕션 레벨로, 이전 환경을 최소 레벨로 조정

### 3. 롤백 프로세스

- 문제 발생 시 즉시 이전 환경으로 트래픽 전환
- 이전 버전으로 자동 롤백

## 모니터링

### 상태 확인

```bash
# 전체 상태 확인
kubectl get all -n rhythm-archive-blue
kubectl get all -n rhythm-archive-green

# 로그 확인
kubectl logs -f deployment/rhythm-archive-deployment-blue -n rhythm-archive-blue
kubectl logs -f deployment/rhythm-archive-deployment-green -n rhythm-archive-green

# 인그레스 상태 확인
kubectl get ingress -n rhythm-archive-blue
kubectl get ingress -n rhythm-archive-green
```

### 메트릭 확인

```bash
# HPA 상태 확인
kubectl get hpa -n rhythm-archive-blue
kubectl get hpa -n rhythm-archive-green

# 리소스 사용량 확인
kubectl top pods -n rhythm-archive-blue
kubectl top pods -n rhythm-archive-green
```

## 트러블슈팅

### 일반적인 문제들

#### 1. 배포 실패

```bash
# 배포 상태 확인
kubectl rollout status deployment/rhythm-archive-deployment-blue -n rhythm-archive-blue

# 이벤트 확인
kubectl get events -n rhythm-archive-blue --sort-by='.lastTimestamp'
```

#### 2. 헬스 체크 실패

```bash
# 포드 상태 확인
kubectl get pods -n rhythm-archive-blue
kubectl describe pod <pod-name> -n rhythm-archive-blue

# 서비스 엔드포인트 확인
kubectl get endpoints rhythm-archive-service-blue -n rhythm-archive-blue
```

#### 3. 인그레스 문제

```bash
# 인그레스 상태 확인
kubectl describe ingress rhythm-archive-ingress-blue -n rhythm-archive-blue

# SSL 인증서 확인
kubectl get certificates -n rhythm-archive-blue
```

### 로그 분석

```bash
# 애플리케이션 로그
kubectl logs -f deployment/rhythm-archive-deployment-blue -n rhythm-archive-blue

# 인그레스 컨트롤러 로그
kubectl logs -f deployment/nginx-ingress-controller -n ingress-nginx
```

## 보안 고려사항

### 1. Secret 관리

- 민감한 정보는 Kubernetes Secret으로 관리
- 환경별로 다른 Secret 사용 권장
- 정기적인 Secret 로테이션

### 2. 네트워크 보안

- 네임스페이스 간 격리
- NetworkPolicy를 통한 트래픽 제어
- SSL/TLS 암호화 적용

### 3. 접근 제어

- RBAC을 통한 권한 관리
- ServiceAccount 사용
- 최소 권한 원칙 적용

## 비용 최적화

### 1. 리소스 관리

- HPA를 통한 자동 스케일링
- 적절한 리소스 요청/제한 설정
- 사용하지 않는 환경 스케일 다운

### 2. 스토리지 최적화

- 적절한 PVC 크기 설정
- 불필요한 데이터 정리
- 백업 전략 수립

## 백업 및 복구

### 1. 데이터베이스 백업

```bash
# MariaDB 백업
kubectl exec -it <mariadb-pod> -n <namespace> -- mysqldump -u root -p rhythm_archive > backup.sql
```

### 2. 설정 백업

```bash
# Kubernetes 리소스 백업
kubectl get all -n rhythm-archive-blue -o yaml > blue-backup.yaml
kubectl get all -n rhythm-archive-green -o yaml > green-backup.yaml
```

## 결론

블루-그린 배포 방식을 통해 Rhythm Archive 애플리케이션을 안전하고 효율적으로 배포할 수 있습니다. 이 가이드를 참고하여 성공적인 배포를 진행하시기 바랍니다.

### 추가 지원

문제가 발생하거나 추가 지원이 필요한 경우:

1. 로그를 수집하여 분석
2. Kubernetes 이벤트 확인
3. 네트워크 연결 상태 점검
4. 리소스 사용량 모니터링
