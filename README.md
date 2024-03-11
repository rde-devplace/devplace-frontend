# kubernetes 기반 Remote Development Environment 구성하기
## 개요
본 프로젝트는 Kubernetes 환경에서 컨테이너 기반 원격 개발 환경(Remote Development Environment)을 구성하는 프로젝트입니다. 제공 기능은 다음과 같습니다.
- VSCODE Server 기반 IDE 제공
- SSH Server 기반 Kubectl 지원 CLI 제공
- jupyter notebook 기반 원격 개발 환경 제공 (제공 예정)
- Intellij 기반 원격 개발 환경 제공 (제공 예정)
- 에어갭 제공 (제공 예정)

## Remote Development Environment(RDE)란?
Remote Development Environment(RDE)는 개발 환경을 개발자의 로컬 PC가 아닌 EKS, AKS, GKS 등 kubernetes 환경에서 개발 환경을 제공하여 
개발자가 언제 어디서나 자신의 개발환경을 쉽고 빠르게 구성하고 개발하고 테스트 할 수 있도록 합니다.
이 접근 방식은 로컬 컴퓨터가 아닌 클라우드 기반 환경에서 소프트웨어를 개발하는 방식으로 향상된 협업, 리소스 효율성 증대, 확장성 및 보안성을 제공하여 
기존 방식에 비해 여러가지 장점을 제공합니다. 

원격 개발은 간혹 원격 작업 공간 (workspace)와 혼동하는 경우가 있는데, 원격 작업 공간은 단순히 개발 런타임을 로컬 노트북에서 원격 인스턴스로 올기는 것을 말하는 반면, 
원격 개발 환경은 Production 환경을 그대로 Kubernetes에 제공하는 것을 의미이며, 실제 애플리케이션 개발 및 운영 시 필요한 전체 개발/운영 도구 스택을 
실행하여 연동 및 테스트 할수 있으며 개발자는 웹 브라우저 기반으로 이 모든 서비스를 제공 받을 수 있습니다. 

## 목표
개인 또는 기업이 public 또는 Private K8s Cluster 환경을 이미 확보하고 있는 경우 본 DevPlace 를 활용하여 VSCODE, Intellij, jupyter notebook, 
SSH 기반 K9S 또는 Kubectl cli 환경 등을 컨테이너 환경에서 설치 후 자신만의 Customized Remote Development Environment를 구성할 수 있습니다.
이를 기반으로 Kubernetes 기반 Cloud Native Application과 Microservice architecturing을 위한 개발 환경을 구성할 수 있습니다.

본 Devplace는 위의 목표에 따라 사용자가 원하는 방식으로 원객 개발 환경을 더 쉽게 구성할 수 있도록 지원합니다. 
Gitlab 사용자를 대상으로 한 설문조사에서 응답한 개발자의 61%는 한 달에 한번 이상, 31%는 일주일에 한번 이상 로컬 개발 환경 문제 해결에 시간을 소비한다고 합니다. 
이러한 문제들을 해소 할 수 있도록 DevPlace는 다음과 같은 목표롤 설정하였습니다.
1. #### 시간 절약
로컬 환경 구성, 프로젝트 환경에 맞추 구성, 로컬 개발 및 테스트, 클라우드 환경 빌드/배포 환경 구성, 통합 시험 등의 복잡한 프로세스와 시간을 절약할 수 있습니다.
DevPlace는 초기 개인 또는 프로젝트에서 사용하기 위한 환경 구성과 초기 설정 구성등을 도커이미지, 플러그인 코드 ,설정 유입등을 정의하게 되면 
이후 개발자에게 제공되는 환경은 이러한 설정을 기반으로 제공되어 개발자는 이러한 복잡한 과정을 거치지 않고도 개발에 집중할 수 있습니다.

2. #### 개발 환경 표준화
시간 절약에서 언급했듯이 개인 환경 또는 프로젝트, 기업을 위한 개발 환경을 표준화할 수 있으며 이러한 표준화는 프로덕션 환경에 최대한 가깝도록 자연스럽게 정의하고 구성 가능합니다. 

3. #### 컴퓨팅 집약적인 리소스 아웃소싱
소프트웨어를 개발한다는것은 소프트웨어 컴파일, 테스트 및 실행과 같은 계산 집약적인 작업을 수행하는 것을 의미합니다.
즉, 도구 때문에 RAM이 불에 타버릴 뻔하고 테스트 등이 완료될 때까지 기다려야 하는 개발자의 불만입니다. 
또한 적절한 장비를 제공하는 데 드는 비용으로 인한 관리자의 불만도 있습니다.
RDE는 성능 집약적인 프로세스를 대신하고 원격 서버에서 실행되므로 업무용 디바이스 선택의 폭이 넓어져 기업의 비용을 절감할수 있습니다.

4. #### 생산성 향상
필요한 모든 버전에서 즉시 사용할 수 있습니다. 필요한 경우 주요 버전뿐만 아니라 개별 브랜치의 특정 커밋 해시에 대해서도 RDE를 생성할 수 있습니다. 
각 개발자는 여러 개를 병렬로 실행할 수 있습니다

5. #### 소스 코드 및 데이터 보안
RDE는 완전히 에어 갭이 적용되어 소스 코드가 개발자의 컴퓨터에 로컬로 저장되지 않도록 할 수 있습니다.
테스트 데이터는 RDE에서 사용할 수 있지만 개발자가 직접 액세스할 수 없도록 보호됩니다.
개발자의 경우 RDE에서 작업하는 것이 편안하기 때문에 생산성을 위해 좋은 의도로 오용할 유인이 없습니다.
 또한 소스 코드와 데이터가 로컬에 저장되지 않으므로 최종 디바이스의 분실이나 도난 위험이 전혀 없습니다.

## 구성 컴포넌트
운영을 위한 컴포넌트는 다음과 같습니다.

### devplace-frontend
DevPlace의 사용자 인터페이스를 제공하는 Vue 3.0 기반의 Frontend 서비스입니다.

아래 화면은 DevPlace의 Frontend 서비스를 통해 제공되는 화면입니다.
![DevPlace Frontend](docs/images/devplace.png)

WebIDE 열기 버튼을 클릭하는 경우 2가지 기능을 제공합니다.
첫번째는 Open VSCode Developer Environment를 클릭할때 뜨는 화면입니다. 

![DevPlace vscode](docs/images/vscode.png)

두번째는 Open CLI Terminal을 클릭할때 뜨는 화면입니다.

![DevPlace sshserver](docs/images/sshserver.png)


### devplace-proxy
DevPlace의 API Gateway 역할을 수행하는 spring cloud gateway 기반의 Proxy 서비스입니다.
proxy 서비스는 3가지 유형으로 지원하고 있습니다. 
[GitHub Repository](https://github.com/rde-devplace/devplace-proxy)

1. #### session-gateway
keycloak 기반의 oauth2 client 구조로 client가 gateway를 통해 직접 로그인을 수행하며, 발급받은 토큰은 gateway 내부에서 저장관리합니다.
대신 Client는 Session Coooie를 통해 gateway에 접근할 수 있습니다. 
세션 정보는 mariaDB로 잔체적으로 관리하고 있습니다. 
이것은 자체적인 로그인 및 인증 처리를 수행하고자 할때 유용합니다. 
또한 동적으로 생성되는 개발 환경 컨테이너로 라우팅을 위해 mariadb에 routing 정보를 동적으로 저장 관리하고 있습니다. 

2. #### api-gateway-mariadb
keycloak 기반의 ouath2 resource server 구조로 별도 세션 정보를 저장 관리하고 있지 않으며, Client는 Keycloak을 통해  발급 받은 토큰을 관리하고 있어야 합니다.
라우팅 정보 관리는 session-gateway 와 동일합니다. 

4. #### api-gateway-stateless
기본 동작 기능은 api-gateway-mariadb와 동일합니다. 
대신 별도의 동적 라우팅을 위한 DB를 관리하지 않고 gateway 내부에서 로직적으로 라우팅 정보를 생성 및 라우팅합니다. 
이것은 gateway 설치 영역을 최소화할 수 있도록 합니다. 


### Ide Manager
이 컴포넌트는 Devplace 환경을 관리하는 컴포넌트입니다.
[GitHub Repository](https://github.com/rde-devplace/devplace-manager)

### Ide Operator
이 컴포넌트는 WebIDE와 SSH Server를 생성 및 관리하는 컴포넌트입니다.
[GitHub Repository](https://github.com/rde-devplace/devplace-operator)

### webIdeCode
이 컴포넌트는 VSCODE 기반의 Web IDE, Jupyter Notebook, 그리고 이것을 초기화 하기 위한 Init Code를 제공합니다.
[GitHub Repository](https://github.com/rde-devplace/webIdeCode)

### sshserver
이 컴포넌트는 SSHServer 기반의 Kubectl CLI를 제공합니다.
[GitHub Repository](https://github.com/rde-devplace/sshserver)

## 제약 사항
현재 제공하는 DevPlace는 Multi-Cluster 를 지원하고 있지 않으며, 계정별 한개의 Workspaced와 한개의 Pod 환경을 제공합니다. 
단일 Pod는 요청하는 기능을 포함한 컨테이너 여러개가 설치됩니다. 
옐들들어, VSCODE Server, SSH Server 를 선택하는 경우 2개의 컨테이너가 함께 포함된 Pod 가 생성됩니다. 

## 생성 리소스 
생성 리소스는 다음과 같습니다.

Custom Resource Definition (CRD)는 다음과 같습니다.

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
name: ideconfigs.amdev.cloriver.io
spec:
group: amdev.cloriver.io
versions:
- name: v1
  served: true
  storage: true
  schema:
  openAPIV3Schema:
  type: object
  properties:
  spec:
  type: object
  properties:
  userName:
  type: string
  serviceTypes:
  type: array
  items:
  type: string
  enum:
  - vscode
  - webssh
  vscode:
  type: object
  properties:
  git:
  type: object
  properties:
  id:
  type: string
  token:
  type: string
  repository:
  type: string
  branch:
  type: string
  webssh:
  type: object
  properties:
  permission:
  type: object
  properties:
  useType:
  type: string
  enum:
  - create
  - use
  role:
  type: string
  enum:
  - administrator
  - architect
  - developer
  - coder
  scope:
  type: string
  enum:
  - namespace
  - cluster
  serviceAccountName:
  type: string
  x-kubernetes-preserve-unknown-fields: true
            portList:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  protocol:
                    type: string
                  port:
                    type: integer
                  targetPort:
                    type: integer
            infrastructureSize:
              type: object
              properties:
                cpu:
                  type: string
                memory:
                  type: string
                disk:
                  type: string
            replicas:
              type: integer
          required:
          - userName
          - serviceTypes
          - infrastructureSize
          - portList
scope: Namespaced
names:
kind: IdeConfig
plural: ideconfigs
singular: ideconfig
shortNames:
- ic

```

CRD를 생성하면 다음과 같은 리소스가 생성됩니다.

```yaml
apiVersion: amdev.cloriver.io/v1
kind: IdeConfig
metadata:
  name: vscode-server
spec:
  userName: "himang10"
  serviceTypes:
    - vscode
    - webssh
  webssh:
    permission:
      useType: "create"
      role: "architect"
      scope: "cluster"
  vscode:
    git:
      id: "himang10"
      token: "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"
      repository: "https://github.com/himang10/sample-cloud-stream-with-kafka-with-sleuth.git"
  portList:
    - name: "http"
      protocol: "TCP"
      port: 8080
      targetPort: 8080
    - name: "mgmt"
      protocol: "TCP"
      port: 9090
      targetPort: 9090  
  infrastructureSize:
    cpu: "200m"
    memory: "512Mi"
    disk: "20Gi"
  replicas: 1
```
## 사전 준비

## 설치 및 구성
RDE를 사용하기 위해서는 다음 링크의 소스 코드를 설치 및 구성해야 합니다. 
개별 프로그램의 설치 가이드는 Install.md를 참고하면 됩니다. 

## 실행 및 테스트

## 사용 방법

## Q&A
DevPlace에 대한 사용에 대한 질문이나 Cloud Native Application 과 Microservice 전환에 대한 질문은 다음 메일로 문의 주시기 바랍니다.

yongwoo.yi0@gmail.com

# License
이 프로젝트는 Apache License 2.0에 따라 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](https://www.apache.org/licenses/LICENSE-2.0) 파일을 참고하세요.
