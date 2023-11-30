<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { wettyBaseURL } from '../../config'

import CreateWebIDE from './CreateWebIDE.vue' // 새로운 컴포넌트 불러오기

const buttonDisabled = ref(true) // 버튼의 활성화 상태를 저장하기 위한 변수

const popupVisible = ref(false) // For showing the popup
const iframeVisible = ref(false) // For showing the iframe
const createWebIDEVisible = ref(false) // For showing the createWebIDE
const endpointURL = ref('') // For showing the endpointURL
const userName = ref('') // For showing the userName
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
  //userName.value = await fetchUserName()
  //userId.value = await fetchUserId()
  // test code YWYI
   userName.value = 'himang10'
   userId.value = 'xxxxxxxxxxxx'
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
  <main class="border-t border-gray-200 dark:border-gray-700">
    <div class="flex flex-row h-full" style=" height: 80vh;">
      <div id="split-0" class="w-full">
        <!-- Button to open the popup -->
        <!-- 버튼을 수평으로 배열하기 위해 flexbox 사용 -->
        <div class="button-group">
          <button class="open-popup-button" :disabled="buttonDisabled" @click="openCreateWebIDEPopup">
            Web IDE 생성
          </button>
          <button class="open-popup-button" @click="openPopup">
            Web IDE 열기
          </button>
        </div>
        <!-- 새로운 컴포넌트를 템플릿에 포함 -->
        <!-- YWYI -->
        <CreateWebIDE
            v-if="createWebIDEVisible"
            :endpoint="endpointURL"
            :user-name="userName"
            :user-id="userId"
            @closePopup="closeCreateWebIDEPopup"
            @updateButtonDisabled="updateButtonDisabled"
        />
        <!--CreateWebIDE
          v-if="createWebIDEVisible"
          :endpoint="endpointURL"
          :user-name="userName"
          :user-id="userId"
          @closePopup="closeCreateWebIDEPopup"
        /-->
        <!-- Popup for selecting open method -->
        <div v-if="popupVisible" class="modal">
          <!-- button @click="openK9S">
            Open k9s Terminal
          </button -->
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

        <!-- iFrame for the terminal -->
        <iframe v-if="iframeVisible" class="terminal-iframe" :src="wettyURL" frameborder="0" />
        <button v-if="iframeVisible" class="iframe-close-button" style="background-color: #007BFF; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 1.1em;" @click="closeIframe">
          Close Terminal
        </button>
      </div>
    </div>
  </main>
</template>

<style>
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

/* 버튼 그룹 스타일 */
.button-group {
  display: flex;
  align-items: center;
  gap: 10px; /* 두 버튼 사이의 간격 */
}

/* Making the main content scrollable */
main {
  overflow-y: auto;
}
</style>

