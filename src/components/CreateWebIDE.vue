<!-- CreateWebIDE.vue -->

<script>
import axios from 'axios'
import { wettyBaseURL } from '../../config'

const wettyURL = `${wettyBaseURL}`

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
      ideConfigSpec: {
        userName: '', // 사용자 이름
        serviceTypes: ['vscode', 'webssh'], // 서비스 타입들의 리스트
        webssh: {
          permission: {
            useType: '', // 'create' 또는 'use'
            role: '', // 'administrator', 'architect', 'developer', 'coder' 중 하나
            scope: '', // 'namespace' 또는 'cluster'
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
        infrastructureSize: { // 인프라 사이즈
          cpu: '200m',
          memory: '512Mi',
          disk: '20Gi'
        },
        replicas: 1 // 레플리카 수
      },
      createWebIDEVisible: true, // 기타 기존 상태들
      nameSpace: 'kube-pattern',
    }
  },
  created() {
    // 컴포넌트 생성 시 git.id를 userName으로 설정
    this.ideConfigSpec.vscode.git.id = this.userName;
    this.ideConfigSpec.userName = this.userName;
  },
  methods: {
    async submitCreateWebIDE() { // <-- Use async because axios is promise-based
      this.closePopup()
      const structuredData = {
        ...this.ideConfigSpec,
        userId: this.userId,
      }

      const name = structuredData.userName
      const ns = this.nameSpace

      if(structuredData.webssh.permission.useType === 'create') {
        structuredData.webssh.permission.serviceAccountName = `${name}-ide-account`
      }

      const ideConfigApiUrl = `${wettyURL}api/ideconfig/ide?namespace=${ns}&name=${name}`
      const vscodeRouteApiUrl = `${wettyURL}api/vscode/route/${name}`

      try {
        const ideConfigResponse = await axios.post(ideConfigApiUrl, structuredData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const portArray = this.portList.map(item => item.port)
        const vscodeRouteResponse = await axios.post(vscodeRouteApiUrl, portArray, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const dataArray = [ideConfigResponse.data, vscodeRouteResponse.data]
        const resultPopup = window.open('', 'Result', 'width=600,height=900')
        resultPopup.document.write(`<pre>${JSON.stringify(dataArray, null, 2)}</pre>`)
        this.$emit('updateButtonDisabled', true)
      }
      catch (error) {
        alert(`Error: ${vscodeRouteApiUrl.toString()}${error.message}\n\nData:\n${JSON.stringify(structuredData)}`)
      }
      finally {
        this.closePopup()
      }
    },
    closePopup() {
      this.$emit('closePopup') // Wetty.vue로 이벤트 전송
    },
  },
}
</script>

<template>
  <div v-if="createWebIDEVisible" class="modal">
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
      </div>
    </div>

    <!-- vscode 설정 박스 -->
    <div class="box" v-if="ideConfigSpec.serviceTypes.includes('vscode')">
      <h3>Vscode 설정</h3>
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
          <input v-model="ideConfigSpec.infrastructureSize.cpu" placeholder="CPU 입력">
        </div>
        <div class="input-group">
          <label class="input-label">MEM</label>
          <input v-model="ideConfigSpec.infrastructureSize.memory" placeholder="메모리 입력">
        </div>
        <div class="input-group">
          <label class="input-label">DISK</label>
          <input v-model="ideConfigSpec.infrastructureSize.disk" placeholder="디스크 입력">
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

    <!-- 제출 버튼들의 컨테이너 -->
    <div class="button-container">
      <button @click="closePopup">
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
