<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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

const defaultPath = 'dev'
const wettyURL = `${wettyBaseURL}${defaultPath}`
const k9sURL = `${wettyURL}/k9/wetty`

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

const fetchUserId = async () => {
  try {
    const response = await axios.get(`${wettyBaseURL}user/id`)
    if (response.status === 200 && response.data) { return response.data }
    else {
      alert('Not Ready Yet - Try Again Later') // 수정된 부분
      return null
    }
  }
  catch (error) {
    console.error(error)
    alert('An error occurred while fetching the user ID.') // 수정된 부분
    return null
  }
}

const openCreateWebIDEPopup = async () => {
  // you had comment out the following two lines to test the code
  userName.value = await fetchUserName()
  userId.value = await fetchUserId()
  // test code YWYI
  // userName.value = 'himang10'
  // userId.value = 'xxxxxxxxxxxx'
  // eslint-disable-next-line no-console
  console.log(userName)
  if (userName.value) {
    endpointURL.value = `${wettyBaseURL}${userName.value}/`
    createWebIDEVisible.value = true
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

  const ns = nameSpaceName.value // 적절한 namespace 값을 설정하세요
  const name = userName.value // 사용자 이름을 이름으로 사용
  const ideConfigApiUrl = `${wettyBaseURL}api/ide-configs/custom-resource?namespace=${ns}&name=${name}`
  const vscodeRouteApiUrl = `${wettyBaseURL}api/route/vscode?namespace=${ns}&name=${name}`

  try {
    await axios.delete(ideConfigApiUrl)
    await axios.delete(vscodeRouteApiUrl)
    alert('삭제가 성공했습니다.')
    buttonDisabled.value = false
    // 성공 후 필요한 추가 로직 (예: 상태 업데이트, UI 변경 등)
  } catch (error) {
    console.error(error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 버튼의 활성화 상태를 확인하는 함수
const checkVscodeAvailability = async () => {
  const checkName = await fetchUserName()
  const vscodeEndpoint = `${wettyBaseURL}${checkName}/vscode/`

  try {
    const response = await axios.get(vscodeEndpoint)
    if (response.status === 200)
      buttonDisabled.value = true
    else
      buttonDisabled.value = false
  }
  catch (error) {
    buttonDisabled.value = false
  }
}

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
  const checkName = await fetchUserName()
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
  const checkName = await fetchUserName()
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

const closeIframe = () => {
  iframeVisible.value = false
}

const updateButtonDisabled = (value: boolean) => {
  buttonDisabled.value = value
}
</script>

<template>
  <main class="main-container">
    <div class="workspace-name-display">
      <input type="text" :value="`workspace:   ws-${nameSpaceName.valueOf()}-${userName.valueOf()}`" disabled size="100" />
    </div>

    <!-- 이미지 섹션 -->
    <div class="image-section">
      <img src="../assets/dev-container.png" alt="Remote Development Environment" />
      <!--img src="../assets/base-rde-image.jpg" alt="Remote Development Environment" /-->
    </div>

    <!-- 버튼 및 CreateWebIDE 컴포넌트 섹션 -->
    <section class="button-and-create-section">
      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button class="open-popup-button"
                :class="{ 'delete-button': buttonDisabled }"
                @click="buttonDisabled ? deleteWebIDE() : openCreateWebIDEPopup()">
          {{ buttonDisabled ? 'WebIDE 삭제' : 'Web IDE 생성' }}
        </button>
        <button class="open-popup-button" :disabled="!buttonDisabled" @click="openPopup">
          Web IDE 열기
        </button>
      </div>

      <!-- CreateWebIDE 컴포넌트 -->
      <CreateWebIDE
          v-if="createWebIDEVisible"
          :endpoint="endpointURL"
          :user-name="userName"
          :user-id="userId"
          @closePopup="closeCreateWebIDEPopup"
          @updateButtonDisabled="updateButtonDisabled"
      />
    </section>

    <!-- 팝업 모달 -->
    <div v-if="popupVisible" class="modal">
      <button @click="openCLI">
        Open CLI Terminal
      </button>
      <button @click="openVscode">
        Open VSCode Developer Environment
      </button>
      <button @click="closePopup">
        닫기
      </button>
    </div>

    <!-- 터미널 iFrame -->
    <iframe v-if="iframeVisible" class="terminal-iframe" :src="wettyURL" frameborder="0"></iframe>
    <button v-if="iframeVisible" class="iframe-close-button" @click="closeIframe">
      Close Terminal
    </button>
  </main>
</template>

<style>
/* 전체 컨테이너 스타일 */
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-section {
  position: relative; /* 워크스페이스 이름 위치 조정을 위해 relative 설정 */
  display: block;
  width: 100%;
}

/* 이미지 섹션 스타일 */
.image-section img {
  width: 100%; /* 이미지가 컨테이너 전체 너비를 채우도록 설정 */
  height: auto; /* 이미지의 비율을 유지 */
}

.workspace-name-display {
  position: absolute;
  top: 40px; /* 상단에서의 위치 */
  left: 250px; /* 오른쪽 끝에서의 위치 */
  transform: translate(0, -100%); /* 요소를 위로 이동 */
}

.button-group-xx {
  position: absolute;
  bottom: 10px; /* 이미지의 하단에서 10px 떨어진 위치에 버튼을 배치 */
  left: 0; /* 이미지의 왼쪽 정렬 */
  margin-left: 10px; /* 왼쪽 여백 추가 */
}

/* 버튼 그룹 스타일 */
.button-group {
  display: flex;
  align-items: center;
  gap: 10px; /* 두 버튼 사이의 간격 */
}

/* 버튼 및 CreateWebIDE 섹션 스타일 */
.button-and-create-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px; /* 이미지와 버튼 사이의 여백 */
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

.iframe-close-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1001;
}


.open-popup-button {
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;
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

/* Making the main content scrollable */
main {
  overflow-y: auto;
}

/* iFrame 스타일 */
.terminal-iframe {
  /* 기존 iFrame 스타일 */
}

.iframe-close-button {
  /* 기존 iFrame 닫기 버튼 스타일 */
}
</style>

