<!-- CreateWebIDE.vue -->

<script>
import axios from 'axios'
import { wettyBaseURL } from '../../config'
import { ref } from 'vue'

const wettyURL = `${wettyBaseURL}`

const successCreate = ref(false)

export default {
  props: {
    userName: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      packageType: ['ai'], // 패키지 타입들의 리스트
      ideConfigSpec: {
        rdeServiceType: {
          rdeType: 'user',
          managedServices: [
            {name: 'himang10', wsName: '', appName: ''}
          ]
        },
        userName: '', // 사용자 이름
        wsName: '', // 워크스페이스 이름
        appName: '', // 앱 이름
        serviceTypes: ['vscode'], // 서비스 타입들의 리스트
        webssh: {
          permission: {
            useType: 'create', // 'create' 또는 'use'
            role: 'architect', // 'administrator', 'architect', 'developer', 'coder' 중 하나
            scope: 'namespace', // 'namespace' 또는 'cluster'
            serviceAccountName: 'default',
            additionalProperties: {}
          }
        },
        vscode: { // Vscode 설정
          useGit: false, // Git 사용 여부
          git: { // Git 설정
            id: '',
            token: '',
            repository: '',
            branch: ''
          }
        },
        portList: [ // 포트 리스트
          { name: 'service', protocol: 'TCP', port: 8080, targetPort: 8080 }
        ],
        tolerations: [
            { key: 'amdp-role',  operator: 'Equal', value: 'webide', effect: 'NoSchedule'}
        ],
        resourceSize: { // 인프라 사이즈
          cpu: '1000m',
          memory: '2048Mi',
        },
        diskSize: {
          disk: '10Gi'
        },
        replicas: 1 // 레플리카 수
      },
      createWebIDEVisible: true, // 기타 기존 상태들
      nameSpace: 'part-rde',
    }
  },
  created() {
    // 컴포넌트 생성 시 git.id를 userName으로 설정
    this.ideConfigSpec.vscode.git.id = this.userName;
    this.ideConfigSpec.userName = this.userName;
  },
  methods: {
    async submitCreateWebIDE() {
      this.closePopup()
      const structuredData = {
        ...this.ideConfigSpec,
        userId: this.userId,
      }

      const name = structuredData.userName
      const ns = this.nameSpace
      const packageType = this.packageType.join(',')

      if(structuredData.webssh.permission.useType === 'create') {
        structuredData.webssh.permission.serviceAccountName = `${name}-ide-account`
      }

      const fullName = name + "-" + structuredData.wsName + "-" + structuredData.appName

      const ideConfigApiUrl = `${wettyURL}api/ide-configs/custom-resource?namespace=${ns}&name=${fullName}&packageType=${packageType}`


      try {
        console.log('Sending IDE Config request:', structuredData)
        const ideConfigResponse = await axios.post(ideConfigApiUrl, structuredData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        console.log('IDE Config response:', ideConfigResponse.data)

        // 성공일 경우에만 두 번째 요청 실행

        if (ideConfigResponse.status === 200) {
          //const portArray = this.portList.map(item => item.port)
          const vscodeRouteApiUrl = `${wettyURL}api/route/vscode?namespace=${ns}&name=${name}&wsName=${structuredData.wsName}&appName=${structuredData.appName}`
          const portArray = this.ideConfigSpec.portList.map(item => item.port)
          console.log('Sending VSCode Route request:', portArray)
          console.log('VSCode Route URL:', vscodeRouteApiUrl)

          const vscodeRouteResponse = await axios.post(vscodeRouteApiUrl, portArray, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
          console.log('VSCode Route response:', vscodeRouteResponse.data)

          if(vscodeRouteResponse.status === 200) {
            successCreate.value = true
          }
          else {
            successCreate.value = false
          }


          const dataArray = [ideConfigResponse.data, vscodeRouteResponse.data]
          const resultPopup = window.open('', 'Result', 'width=600,height=900')
          resultPopup.document.write(`<pre>${JSON.stringify(dataArray, null, 2)}</pre>`)

        }
      } catch (error) {
        console.log('Error during the request:', error)
        //alert(`Error: ${error.message}\n\nData:\n${JSON.stringify(structuredData)}`)
      }

    },
    async submitNothing() {
      this.$emit('success', false)
      this.$emit('closePopup')
    },

    closePopup() {
      this.$emit('closePopup') // Wetty.vue로 이벤트 전송
      this.$emit('success', true)
      this.$emit('updateButtonDisabled', true)
      this.$emit('namespaceName', this.nameSpace)
    },
  },
}
</script>

<template>
  <div v-if="createWebIDEVisible" class="modal">
    <!-- Workspace & AppName -->
    <div class="box">
      <h3>RDE Service Type 설정</h3>
      <div class="port-item">
        <div class="input-group">
          <label class="input-label">사용자 이름</label>
          <input v-model="ideConfigSpec.userName" placeholder="사용자 이름 입력">
        </div>
        <div class="input-group">
          <label class="input-label">워크스페이스 이름</label>
          <input v-model="ideConfigSpec.wsName" placeholder="워크스페이스 이름 입력" >
        </div>
        <div class="input-group">
          <label class="input-label">앱 이름</label>
          <input v-model="ideConfigSpec.appName" placeholder="앱 이름 입력" >
        </div>
      </div>
    </div>

    <!-- RDE Service Type 설정 -->
    <div class="box">
      <h3>RDE Service Type 설정</h3>
      <div class="input-group sub-field">
        <label class="input-label">RDE 유형</label>
        <select v-model="ideConfigSpec.rdeServiceType.rdeType">
          <option disabled value="user">user</option>
          <option value="share">share</option>
          <option value="manager">collaboration</option>
          <option value="coacher">coach</option>
          <option value="user">user</option>
        </select>
      </div>
      <div v-if="ideConfigSpec.rdeServiceType.rdeType !== 'user'">
        <div v-for="(service, index) in ideConfigSpec.rdeServiceType.managedServices" :key="index" class="port-item">
          <div class="input-group">
            <label class="input-label">사용자 이름</label>
            <input v-model="service.name" placeholder="사용자 이름 입력">
          </div>
          <div class="input-group">
            <label class="input-label">워크스페이스 이름</label>
            <input v-model="service.wsName" placeholder="워크스페이스 이름 입력" >
          </div>
          <div class="input-group">
            <label class="input-label">앱 이름</label>
            <input v-model="service.appName" placeholder="앱 이름 입력" >
          </div>
        </div>
        <div class="port-item">
          <button class="add-port-button" @click="() => ideConfigSpec.rdeServiceType.managedServices.push({ name: '', wsName: '', appName: ''})">
            target 추가
          </button>
        </div>
      </div>
    </div>


    <!-- Service Types 선택 박스 -->
    <div class="box">
      <h3>Service Types</h3>
      <div class="checkbox-group">
        <label>
          <input type="checkbox" value="vscode" v-model="ideConfigSpec.serviceTypes">
          vscode
        </label>
        <label>
          <input type="checkbox" value="webssh" v-model="ideConfigSpec.serviceTypes">
          webssh
        </label>
        <label>
          <input type="checkbox" value="notebook" v-model="ideConfigSpec.serviceTypes">
          notebook
        </label>
      </div>
    </div>

    <!-- vscode 설정 박스 -->
    <div class="box" v-if="ideConfigSpec.serviceTypes.includes('vscode')">
      <h3>Vscode 설정</h3>
      <div class="checkbox-group">
        <label>
          <input type="checkbox" value="ai" v-model="packageType">
          copilot
        </label>
        <label>
          <input type="checkbox" value="java" v-model="packageType">
          spring boot
        </label>
        <label>
          <input type="checkbox" value="jupyter" v-model="packageType">
          jupyter notebook
        </label>
        <label>
          <input type="checkbox" value="vue" v-model="packageType">
          vue.js
        </label>
      </div>
      <!--div class="input-group sub-field">
        <label class="input-label">Package Type</label>
        <select v-model="packageType">
          <option disabled value="extensions">extensions</option>
          <option value="java">java develop</option>
          <option value="jupyter">jupyter</option>
          <option value="vue">vue.js</option>
          <option value="dev">develop</option>
          <option value="javaAi">java with AI</option>
          <option value="vueAi">vue with AI</option>
          <option value="jupyterAi">jupyter with AI</option>
          <option value="devAi">develop with AI</option>
        </select>
      </div -->
      <!-- Git 사용 여부 선택 -->
      <div class="input-group">
        <label class="input-label">Git 사용</label>
        <input type="checkbox" v-model="ideConfigSpec.vscode.useGit">
      </div>

      <!-- Git 설정 필드 -->
      <div v-if="ideConfigSpec.vscode.useGit">
        <div class="input-group sub-field">
          <label class="input-label">Git ID</label>
          <input v-model="ideConfigSpec.vscode.git.id" placeholder="Git ID 입력">
        </div>
        <div class="input-group sub-field">
          <label class="input-label">Repository</label>
          <input v-model="ideConfigSpec.vscode.git.repository" placeholder="Repository 입력" required>
        </div>
        <div class="input-group sub-field">
          <label class="input-label">Token (선택사항)</label>
          <input v-model="ideConfigSpec.vscode.git.token" placeholder="Token 입력">
        </div>
      </div>
    </div>

    <!-- webssh 설정 박스 -->
    <div class="box" v-if="ideConfigSpec.serviceTypes.includes('webssh')">
      <h3>WebSSH 설정</h3>
      <div class="input-group sub-field">
        <label class="input-label">Use Type</label>
        <select v-model="ideConfigSpec.webssh.permission.useType">
          <option disabled value="">선택</option>
          <option value="create">create</option>
          <option value="use">use</option>
        </select>
      </div>
      <!-- 'create' 선택 시 'role' 및 'scope' 설정 -->
      <div v-if="ideConfigSpec.webssh.permission.useType === 'create'">
        <div class="input-group">
          <label class="input-label sub-field">Role</label>
          <select v-model="ideConfigSpec.webssh.permission.role">
            <option value="administrator">administrator</option>
            <option value="architect">architect</option>
            <option value="developer">developer</option>
            <option value="coder">coder</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label sub-field">Scope</label>
          <select v-model="ideConfigSpec.webssh.permission.scope">
            <option value="cluster">cluster</option>
            <option value="namespace">namespace</option>
          </select>
        </div>
      </div>
      <!-- use 선택 시 serviceAccountName 설정 -->
      <div v-if="ideConfigSpec.webssh.permission.useType === 'use'">
        <div class="input-group sub-field">
          <label class="input-label">Service Account Name</label>
          <input v-model="ideConfigSpec.webssh.permission.serviceAccountName" placeholder="SA 이름 입력">
        </div>
      </div>
    </div>

    <!-- Port List 박스 -->
    <div class="box">
      <h3>Port List</h3>
      <div v-for="(port, index) in ideConfigSpec.portList" :key="index" class="port-item">
        <div class="input-group">
          <label class="input-label">이름</label>
          <input v-model="port.name" placeholder="이름 입력">
        </div>
        <div class="input-group">
          <label class="input-label">포트 번호</label>
          <input v-model="port.port" placeholder="포트 번호 입력" type="number" @input="port.targetPort = port.port">
        </div>
      </div>
      <button class="add-port-button" @click="() => ideConfigSpec.portList.push({ name: 'svc', protocol: 'TCP', port: 8081, targetPort: 8081 })">
        포트 추가
      </button>
    </div>

    <!-- Infra Size 박스 -->
    <div class="box">
      <h3>Infra Size</h3>
      <div class="port-item">
        <div class="input-group">
          <label class="input-label">CPU</label>
          <input v-model="ideConfigSpec.resourceSize.cpu" placeholder="CPU 입력">
        </div>
        <div class="input-group">
          <label class="input-label">MEM</label>
          <input v-model="ideConfigSpec.resourceSize.memory" placeholder="메모리 입력">
        </div>
        <div class="input-group">
          <label class="input-label">DISK</label>
          <input v-model="ideConfigSpec.diskSize.disk" placeholder="디스크 입력">
        </div>
      </div>
    </div>

    <!-- naemspace box -->
    <div class="box">
      <h3>Namespace</h3>
      <div class="port-item">
        <div class="input-group">
          <label class="input-label">name</label>
          <input v-model="nameSpace" placeholder="Namespace 입력">
        </div>
      </div>
    </div>

    <!-- Replicas 박스 -->
    <div class="box">
      <h3>Replicas</h3>
      <div class="port-item">
        <div class="input-group">
          <label class="input-label">Replicas</label>
          <input v-model="ideConfigSpec.replicas" placeholder="레플리카 수 입력" type="number">
        </div>
      </div>
    </div>

    <!-- Toleration -->
    <div class="box">
      <h3>Tolerations</h3>
      <div v-for="(toleration, index) in ideConfigSpec.tolerations" :key="index" class="port-item">
        <div class="input-group">
          <label class="input-label">key</label>
          <input v-model="toleration.key" placeholder="key 입력">
        </div>
        <div class="input-group">
          <label class="input-label">operator</label>
          <select v-model="toleration.operator">
            <option disabled value="Equal">Equal</option>
            <option value="Exists">Exists</option>
            <option value="Equal">Equal</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">value</label>
          <input v-model="toleration.value" placeholder="value 입력">
        </div>
        <div class="input-group">
          <label class="input-label">effect</label>
          <select v-model="toleration.effect">
            <option disabled value="NoSchedule">NoSchedule</option>
            <option value="NoExecute">NoExecute</option>
            <option value="NoSchedule">NoSchedule</option>
          </select>
        </div>
      </div>
      <button class="add-port-button" @click="() => ideConfigSpec.tolerations.push({ key: '', operator: '', value: '', effect: '' })">
        포트 추가
      </button>
    </div>

    <!-- 제출 버튼들의 컨테이너 -->
    <div class="button-container">
      <button @click="submitNothing">
        닫기
      </button>
      <button @click="submitCreateWebIDE">
        확인
      </button>
    </div>
  </div>
</template>

<style>
/* ... 기존의 스타일 ... */
main {
  overflow-y: auto;
}
/* 박스 스타일 */
.box {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f5f5f5;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 15px; /* 두 버튼 사이의 간격 */
}

.add-port-button {
  margin-top: 10px; /* 위쪽 마진 2px 설정 */
}

.port-item input {
  border: 1px solid #ccc;  /* 회색 테두리 추가 */
  padding: 8px 12px;  /* 텍스트와 테두리 사이의 간격을 위한 패딩 */
  border-radius: 4px;  /* 테두리의 모서리를 둥글게 */
  outline: none;  /* 선택 시 파란색 테두리 제거 */
  transition: border-color 0.3s;  /* 테두리 색상의 부드러운 전환 효과 */
}

.port-item input:focus {
  border-color: #007BFF;  /* 선택 시 테두리 색상 변경 */
}

/* 기본 버튼 스타일 */
button {
  border: 1px solid #ccc;  /* 회색 테두리 */
  padding: 8px 12px;  /* 내부 패딩 */
  border-radius: 4px;  /* 모서리 둥글게 */
  background-color: white;  /* 배경색 */
  cursor: pointer;  /* 마우스 오버 시 포인터 모양으로 */
  transition: transform 0.1s, box-shadow 0.1s;  /* 애니메이션 효과 */
  outline: none;  /* 선택 시 파란색 테두리 제거 */
}

/* 버튼 호버(마우스 오버) 시 스타일 */
button:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);  /* 그림자 효과 */
}

/* 버튼 누를 때(액티브) 스타일 */
button:active {
  transform: scale(0.97);  /* 버튼 크기를 약간 줄임 */
}

.button-container {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  gap: 10px; /* 버튼 사이의 간격 */
  margin-top: 10px; /* 상단과의 간격, 필요에 따라 조정 가능 */
}

.input-group {
  display: flex;
  align-items: center;
  gap: 2px; /* 라벨과 입력 사이의 간격 */
}

.input-label {
  width: 150px; /* 라벨의 너비 */
  margin-right: 20px; /* 라벨과 입력 사이의 간격 */
  white-space: nowrap; /* 라벨 텍스트가 줄바꿈되지 않도록 설정 */
}

.sub-field {
  /* border: 1px solid #ccc; */
  margin-right: 10px;
  margin-inside: 10px;
  padding: 1px;
  margin-bottom: 10px;
  background-color: #f5f5f5;
}

.sub-field input {
  width: 60%;
  border: 1px solid #ccc;  /* 회색 테두리 추가 */
  padding: 8px 12px;  /* 텍스트와 테두리 사이의 간격을 위한 패딩 */
  border-radius: 4px;  /* 테두리의 모서리를 둥글게 */
  outline: none;  /* 선택 시 파란색 테두리 제거 */
  transition: border-color 0.3s;  /* 테두리 색상의 부드러운 전환 효과 */
}

.modal {
  max-height: 100vh; /* 뷰포트 높이에 맞춰 최대 높이 설정 */
  overflow-y: auto; /* 내용이 넘칠 경우에만 세로 스크롤바 표시 */
}
</style>
