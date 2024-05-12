<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { wettyBaseURL } from '../../config'

import CreateWebIDE from './CreateWebIDE.vue' // 새로운 컴포넌트 불러오기

const buttonDisabled = ref(false) // 버튼의 활성화 상태를 저장하기 위한 변수

const popupVisible = ref(false) // For showing the popup
const iframeVisible = ref(false) // For showing the iframe
const createWebIDEVisible = ref(false) // For showing the createWebIDE
const endpointURL = ref('') // For showing the endpointURL
const userName = ref('') // For showing the userName
const nameSpaceName = ref('part-rde') // For showing the nameSpaceName
const userId = ref('') // For showing the userId

const loading = ref(false) // 로딩 상태를 관리하는 변수

const defaultPath = 'dev'
const wettyURL = `${wettyBaseURL}${defaultPath}`
const k9sURL = `${wettyURL}/k9/wetty`

interface IdeConfigSpec {
  rdeServiceType: {
    rdeType: string;
    managedServices: Array<{
      name: string;
      wsName: string;
      appName: string;
    }>;
  };
  userName: string;
  wsName: string;
  appName: string;
  serviceTypes: string[];
  webssh: {
    permission: {
      useType: string;
      role: string;
      scope: string;
      serviceAccountName: string;
      additionalProperties: Record<string, unknown>;
    };
  };
  vscode: {
    useGit: boolean;
    git: {
      id: string;
      token: string;
      repository: string;
      branch: string;
    };
  };
  portList: Array<{
    name: string;
    protocol: string;
    port: number;
    targetPort: number;
  }>;
  tolerations: Array<{
    key: string;
    operator: string;
    value: string;
    effect: string;
  }>;
  resourceSize: {
    cpu: string;
    memory: string;
  };
  diskSize: {
    disk: string;
  };
  replicas: number;
}

const ideConfigSpec = ref<IdeConfigSpec | null>(null);

const openPopup = () => {
  popupVisible.value = true
}

const closePopup = () => {
  popupVisible.value = false // 팝업 가시성을 false로 변경하여 팝업을 닫습니다.
}

const closeCreateWebIDEPopup = () => {
  createWebIDEVisible.value = false
}

const fetchUserName = async () => {
  try {
    if (import.meta.env.VITE_APP_RUNNING_LOCAL === 'true') {
      // 로컬 실행 환경일 때
      return 'testName'
    }
    console.log('fetchUserName: wettyBaseURL: ' + wettyBaseURL)
    const response = await axios.get(`${wettyBaseURL}user/name`)
    if (response.status === 200 && response.data) { return response.data }
    else {
      alert('Not Ready Yet - Try Again Later') // 수정된 부분
      return null
    }
  }
  catch (error) {
    console.error(error)
    alert('An error occurred while fetching the user name.') // 수정된 부분
    return null
  }
}

const fetchIdeConfig = async () => {
  const ns = nameSpaceName.value // 적절한 namespace 값을 설정하세요
  const name = userName.value // 사용자 이름을 이름으로 사용
  const ideConfigSpecsUrl = `${wettyBaseURL}api/ide-configs/custom-resource/spec/user?namespace=${ns}&userName=${name}`
  try {
    const response = await axios.get<IdeConfigSpec[]>(ideConfigSpecsUrl)
    if (response.status === 200 && response.data) {
      ideConfigSpec.value = response.data[0]
      const fullName = ideConfigSpec.value?.userName + "-" + ideConfigSpec.value?.wsName + "-" + ideConfigSpec.value?.appName
      return fullName
    } else {
      alert('Failed to fetch ideConfigSpecs')
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}


const fetchUserId = async () => {
  try {
    if (import.meta.env.VITE_APP_RUNNING_LOCAL === 'true') {
      // 로컬 실행 환경일 때
      return '1111111111'
    }
    const response = await axios.get(`${wettyBaseURL}user/id`)
    if (response.status === 200 && response.data) { return response.data }
    else {
      alert('Not Ready Yet - Try Again Later') // 수정된 부분
      return null
    }
  }
  catch (error) {
    console.log(error)
    alert('An error occurred while fetching the user ID.') // 수정된 부분
    return null
  }
}

const openCreateWebIDEPopup = async () => {
  if (import.meta.env.VITE_RUNNING_LOCAL === 'true') {
    // 로컬 실행 환경일 때
    userName.value = 'testName';
    userId.value = 'xxxxxxxxxxxx';
  } else {
    // Docker 배포 환경일 때
    userName.value = await fetchUserName();
    userId.value = await fetchUserId();
  }

  console.log(userName)
  if (userName.value) {
    const fullName = await fetchIdeConfig();
    endpointURL.value = `${wettyBaseURL}${fullName}/`
    createWebIDEVisible.value = true
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console
    console.log(endpointURL.value)
  }
  else { alert(`${userName.value}: CLI Terminal이 실행 중인지 확인 바랍니다`) }
}


// 버튼이 비활성화되었을 때 실행할 함수
const deleteWebIDE = async () => {
  // WebIDE 삭제 로직
  console.log('WebIDE 삭제 로직 실행');
  userName.value = await fetchUserName()
  nameSpaceName.value = 'part-rde'

  if (!confirm('정말 삭제하시겠습니까?')) {
    return; // 사용자가 'Cancel'을 선택한 경우
  }

  const fullName = await fetchIdeConfig()
  const ns = nameSpaceName.value // 적절한 namespace 값을 설정하세요
  const name = userName.value // 사용자 이름을 이름으로 사용

  const ideConfigApiUrl = `${wettyBaseURL}api/ide-configs/custom-resource?namespace=${ns}&name=${fullName}`
  const vscodeRouteApiUrl = `${wettyBaseURL}api/route/vscode?namespace=${ns}&name=${name}&wsName=${ideConfigSpec.value?.wsName}&appName=${ideConfigSpec.value?.appName}`

  try {
    await axios.delete(ideConfigApiUrl)
    await axios.delete(vscodeRouteApiUrl)
    alert('삭제가 성공했습니다.')
    buttonDisabled.value = false
    // 성공 후 필요한 추가 로직 (예: 상태 업데이트, UI 변경 등)
  } catch (error) {
    console.log(error)
    alert('fetch Ideconfig 호출 중 에러가 발생했습니다.')
  }
}

const checkVscodeAvailability = async () => {
  console.log('checkVscodeAvailability: buttonDisabled: ' + buttonDisabled.value + ' / loading: ' + loading.value);

  userName.value = await fetchUserName();
  const fullName = await fetchIdeConfig();
  const vscodeEndpoints = [
    `${wettyBaseURL}${fullName}/vscode`,
    `${wettyBaseURL}${fullName}/cli`,
    `${wettyBaseURL}${fullName}/jupyter`
  ];

  for (let i = 0; i < vscodeEndpoints.length; i++) {
    try {
      const response = await axios.get(vscodeEndpoints[i]);
      if (response.status === 200) {
        console.log(`checkVscodeAvailability:axios.get() 200 OK at ${vscodeEndpoints[i]} buttonDisabled: ` + buttonDisabled.value + ' / loading: ' + loading.value);
        buttonDisabled.value = true;
        loading.value = false;
        return; // 성공 시 나머지 요청 중단
      }
    } catch (error) {
      console.error(`Error fetching : `);
      // 에러 발생 시 다음 endpoint 시도
    }
  }

  // 모든 요청이 실패했을 경우
  console.log('모든 사용자 환경 생성 시도가 실패했습니다.');
  buttonDisabled.value = false; // 최종 상태를 disabled로 설정
};


const handleIdeCreationSuccess = (success: boolean) => {
  if (success === true) {
    console.log('handleIdeCreationSuccess: buttonDisabled: ' + buttonDisabled.value + ' / loading: ' + loading.value);
    loading.value = true; // IDE 생성 성공시 로딩 시작
    let timeoutId: number | undefined;

    const interval = window.setInterval(async () => {
      await checkVscodeAvailability();
      if (buttonDisabled.value) {
        clearInterval(interval);
        clearTimeout(timeoutId); // 버튼 활성화시 타임아웃 취소
      }
    }, 1000); // 1초마다 확인

    // 3분 후 타임아웃 설정
    timeoutId = window.setTimeout(() => {
      clearInterval(interval); // 인터벌 정지
      loading.value = false; // 로딩 상태 비활성화
      alert('타임아웃: 개발 환경 구성이 지연되고 있습니다. 문제가 지속되면 관리자에게 문의하세요.');
    }, 180000); // 180초(3분) 후 타임아웃
  }
  else {
    loading.value = false;
  }
};

onMounted(async () => {
  checkVscodeAvailability()
})
const openK9S = () => {
  window.open(k9sURL, '_blank')
  popupVisible.value = false
}

/*
const openCLI = () => {
  window.open(cliURL, '_blank')
  popupVisible.value = false
}
 */
const openCLI = async () => {
  userName.value = await fetchUserName();
  const checkName = await fetchIdeConfig()
  let cliURL

  if (checkName) {
    cliURL = `${wettyBaseURL}${checkName}/cli/`
    try {
      const response = await axios.get(cliURL)
      if (response.status === 200)
        window.open(cliURL, '_blank')
      else
        throw new Error(`${checkName}: CLI Terminal이 실행 중인지 확인 바랍니다`)
    }
    catch (error) {
      alert(`${checkName}: CLI Terminal이 실행 중인지 확인 바랍니다`)
    }
  }
  else {
    alert(`${checkName}: CLI Terminal이 실행 중인지 확인 바랍니다`)
  }

  popupVisible.value = false
}

const openVscode = async () => {
  userName.value = await fetchUserName();
  const checkName = await fetchIdeConfig()
  let vscodeURL

  if (checkName) {
    vscodeURL = `${wettyBaseURL}${checkName}/vscode/`
    try {
      const response = await axios.get(vscodeURL)
      if (response.status === 200)
        window.open(vscodeURL, '_blank')
      else
        throw new Error(`${checkName}: VSCODE가 실행 중인지 확인 바랍니다`)
    }
    catch (error) {
      alert(`${checkName}: VSCODE가 실행 중인지 확인 바랍니다`)
    }
  }
  else {
    alert(`${checkName}: VSCODE가 실행 중인지 확인 바랍니다`)
  }

  popupVisible.value = false
}

const openNotebook = async () => {
  userName.value = await fetchUserName();
  const checkName = await fetchIdeConfig()
  let jupyterURL

  if (checkName) {
    jupyterURL = `${wettyBaseURL}${checkName}/jupyter/`
    try {
      const response = await axios.get(jupyterURL)
      if (response.status === 200)
        window.open(jupyterURL, '_blank')
      else
        throw new Error(`${checkName}: Jupyter가 실행 중인지 확인 바랍니다`)
    }
    catch (error) {
      alert(`${checkName}: Jupyter가 실행 중인지 확인 바랍니다`)
    }
  }
  else {
    alert(`${checkName}: Jupyter가 실행 중인지 확인 바랍니다`)
  }

  popupVisible.value = false
}

const closeIframe = () => {
  iframeVisible.value = false
}

const updateButtonDisabled = (value: boolean) => {
  console.log('updateButtonDisabled: ' + value)
  buttonDisabled.value = value
}
</script>

<template>
  <main class="main-container">
    <div class="content">
      <!-- 로딩 이미지 -->
      <img v-if="loading" src="../assets/loading.gif" alt="Loading..." class="loading-image" />
      <div class="workspace-header">
        <input type="text" :value="`workspace / devplace.local.${nameSpaceName.valueOf()}.${userName.valueOf()}`" disabled size="200" class="workspace-name"/>
      </div>
        <!-- 이미지 섹션 -->
      <div class="image-section">
        <!--img src="../assets/dev-container.png" alt="Remote Development Environment" /-->
        <img src="../assets/start-base.png" alt="Remote Development Environment" class="responsive" />
      </div>
    <!--/div-->
      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button class="open-popup-button"
                :class="{ 'delete-button': buttonDisabled }"
                :disabled="loading"
                @click="buttonDisabled ? deleteWebIDE() : openCreateWebIDEPopup()">
          {{ buttonDisabled ? 'WebIDE 삭제' : 'Web IDE 생성' }}
        </button>
        <button class="open-popup-button"
                :disabled="!buttonDisabled || loading"
                @click="openPopup">
          Web IDE 열기
        </button>
      </div>
    </div>


    <!-- 버튼 및 CreateWebIDE 컴포넌트 섹션 -->
    <section class="button-and-create-section">
      <!-- CreateWebIDE 컴포넌트 -->
      <CreateWebIDE
          v-if="createWebIDEVisible"
          :endpoint="endpointURL"
          :user-name="userName"
          :user-id="userId"
          @success="handleIdeCreationSuccess"
          @close-popup="closeCreateWebIDEPopup"
          @update-button-disabled="updateButtonDisabled"
      />
    </section>
    <!-- 팝업 모달 -->
    <div v-if="popupVisible" class="modal">
      <button @click="openCLI">
        Open CLI RDE
      </button>
      <button @click="openVscode">
        Open VSCode RDE
      </button>
      <button @click="openNotebook">
        Open Notebook RDE
      </button>
      <button @click="closePopup">
        닫기
      </button>
    </div>
  </main>
</template>

<style>
/* 전체 컨테이너 스타일 */
.main-container {
  max-width: 100%;
  width: 100%;
  height: auto;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
  margin-right: 20px;
}

.content {
  //flex: 1;
  //padding: 30px;
  align-items: center;
  //flex-direction: column;
  max-width: 100%;
  width: 100%;
  height: auto;
}

.workspace-header {
  width: 100%;
  background-color: #f8f9fa; /* or any color you prefer */
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e1e4e8; /* for the separator line */
}

.workspace-name {
  font-weight: bold;
  font-size: 1.2em;
  font-family: 'Roboto', sans-serif;
  /* Add more styling if needed */
}

.image-section {
  position: relative; /* 워크스페이스 이름 위치 조정을 위해 relative 설정 */
  //display: block;
  display: flex;
  width: 100%;
  margin: auto;
}

/* 이미지 섹션 스타일 */
.image-section img {
  max-width: 90%; /* 이미지가 부모 컨테이너 너비를 넘지 않도록 설정 */
  width: 90%; /* 이미지가 컨테이너 전체 너비를 채우도록 설정 */
  height: auto; /* 이미지의 비율을 유지 */
}

img.responsive {
  max-width: 100%; /* 이미지의 최대 너비를 부모 요소의 100%로 제한합니다. */
  width: 100%; /* 이미지의 너비를 부모 요소의 100%로 설정합니다. */
  height: auto; /* 이미지의 높이를 자동으로 설정하여 비율을 유지합니다. */
  display: block; /* 이미지를 블록 레벨 요소로 만들어 줄 바꿈을 추가합니다. */
}


/* 버튼 그룹 스타일 */
.button-group {
  display: flex;
  align-items: center;
  gap: 20px; /* 두 버튼 사이의 간격 */
  margin-top: 40px; /* 이미지와 버튼 사이의 간격 추가 */
}

/* 버튼 및 CreateWebIDE 섹션 스타일 */
.button-and-create-section {
  max-width: 100%;
  width: 100%;
  //display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px; /* 이미지와 버튼 사이의 여백 */
}

/* ... your existing styles ... */

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.open-popup-button {
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.7em;
}

.open-popup-button, .delete-button {
  padding: 20px 30px; /* Increase button size */
}

.open-popup-button:active {
  transform: scale(0.95); /* 약간의 축소 효과를 줍니다. */
  background-color: #0056b3; /* 조금 더 진한 색으로 변경 */
}
.open-popup-button:disabled {
  background-color: #ccc; /* 회색 배경 */
  cursor: not-allowed; /* 비활성화된 버튼의 커서 스타일 */
}

.open-popup-button:disabled:active {
  transform: none;  /* 축소 효과 제거 */
}

.delete-button {
  background-color: #ff0000; /* 붉은색 배경 */
  /* 기타 필요한 스타일 */
}
.loading-image {
  position: absolute; /* 절대 위치 설정 */
  top: 50%; /* 상단에서 50% 위치 */
  left: 50%; /* 좌측에서 50% 위치 */
  transform: translate(-50%, -50%); /* 중앙 정렬 */
  z-index: 10; /* 다른 요소 위에 위치하도록 z-index 설정 */
}

/* Making the main content scrollable */
main {
  overflow-y: auto;
}
</style>

