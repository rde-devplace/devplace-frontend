<script lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { keycloakBaseURL, wettyBaseURL } from '../config'

export default {
  name: 'App',
  setup() {
    const username = ref('none')

    const fetchUserName = async () => {
      try {
        if (import.meta.env.VITE_APP_RUNNING_LOCAL === 'true') {
          // 로컬 실행 환경일 때
          username.value = 'testName'
          return
        }
        const response = await axios.get(`${wettyBaseURL}user/name`)
        if (response.status === 200 && response.data)
          username.value = response.data
        else
          alert('Not Ready Yet - Try Again Later')
      }
      catch (error) {
        console.error(error)
        alert('An error occurred while fetching the user name.')
      }
    }

    const displayInPopup = ({ htmlContent }: { htmlContent: any }) => {
      const popupWindow = window.open('', 'logout', 'width=600,height=400')

      if (popupWindow && popupWindow.document) {
        popupWindow.document.write(htmlContent)
        popupWindow.document.close()

        // 팝업 창이 닫혔는지 확인하는 로직
        const checkPopupClosed = setInterval(() => {
          if (popupWindow.closed) {
            clearInterval(checkPopupClosed)
            window.location.href = `${wettyBaseURL}console/` // 팝업이 닫히면 URL 변경
          }
        }, 1000) // 1초 간격으로 확인
      } else {
        alert('Popup blocked! Please allow popups for this site and try again.')
      }
    }

    const logout = async () => {
      try {
        // const response = await axios.post(`${keycloakBaseURL}logout?redirect_uri=${wettyBaseURL}list`)
        const response = await axios.get(`${wettyBaseURL}logout`)
        if (response.status === 200) {
          displayInPopup({htmlContent: response.data})
          window.location.href = `${wettyBaseURL}console/`
        } else
          alert('Not Ready Yet - Try Again Later')
      }
      catch (error) {
        console.error(error)
        alert('An error occurred during logout.')
      }
    }

    onMounted(fetchUserName)

    return {
      username,
      logout,
    }
  },
}
</script>

<template>
  <div id="app" class="app-container">
    <div class="top-bar">
      <div class="logo">
        <!-- Insert your logo here -->
        <img src="@/assets/dev.svg" alt="DEVPlace Logo">
        <span>DEVPlace</span>
      </div>
      <!-- Logout button container on the right side of the top bar -->
      <div class="logout-container">
        <button class="logout-button" @click="logout">
          {{ username || 'login' }}
        </button>
      </div>
    </div>
    <!-- Horizontal flex container for sidebar and content -->
    <div class="horizontal-flex-container">
      <div class="sidebar">
        <ul>
          <li>
            <router-link to="/">
              <div class="logo">
                <!--img src="@/assets/terminal-svgrepo-com.svg" alt="Terminal Icon" class="menu-icon"-->
                <img src="@/assets/terminal-svgrepo-com.svg" alt="Terminal Icon">
              <span>개인 개발환경</span>
              </div>
            </router-link>
          </li>
        </ul>
      </div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.app-container {
  display: flex;
  flex-direction: column; /* Stack top-bar and the horizontal flex-container */
  height: 100vh;
}

/* Horizontal container for sidebar and content */
.horizontal-flex-container {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 60px); /* Subtract the height of the top-bar */
}

.top-bar {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #232d35; /* Match with the sidebar */
  font-size: 17px;
  font-family: 'Roboto', sans-serif;
  color: #fff;
}

.sidebar {
  width: 270px; /* 사이드바의 너비를 270픽셀로 설정 */
  height: 100%; /* 사이드바의 높이를 부모 요소의 100%로 설정하여 전체 높이를 차지하도록 함 */
  background-color: #232d35; /* 사이드바의 배경색을 어두운 회색/푸른색으로 설정 */
  padding: 10px; /* 사이드바 내부의 모든 내용에 대해 상하좌우로 10픽셀의 여백을 설정 */
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1); /* 사이드바에 그림자 효과를 주어 입체감을 더함 */
  display: flex; /* 플렉스박스 레이아웃을 사용하여 내부 요소를 배치함 */
  flex-direction: column; /* 플렉스박스 내부의 요소들이 세로 방향으로 쌓이도록 함 */
  vertical-align: middle; /* 세로 정렬을 중앙으로 설정, flexbox에서는 사용되지 않는 속성 */
  font-size: 13px; /* 사이드바 내부 텍스트의 폰트 크기를 13픽셀로 설정 */
  font-family: 'Roboto', sans-serif; /* 폰트 스타일을 'Roboto'로 설정, 해당 폰트가 없을 경우 기본 산세리프 폰트 사용 */
  //align-items: flex-start; /* 플렉스 아이템들을 시작점(왼쪽)에 정렬 */
}

.sidebar ul {
  list-style: none; /* 목록의 기본 스타일(점 등)을 제거 */
  padding: 0; /* 목록 내부에 상하좌우 여백을 없앰 */
}

.sidebar li {
  margin-bottom: 10px; /* 각 목록 항목 아래에 10픽셀의 여백을 설정하여 간격을 둠 */
  display: flex; /* 플렉스박스 레이아웃을 사용하여 내부 요소를 배치 */
  align-items: center; /* 목록 항목 내부의 요소들을 중앙에 정렬 */
}


.sidebar a {
  color: #fff; /* 링크의 텍스트 색상을 흰색으로 설정 */
  text-decoration: none; /* 링크의 밑줄을 제거 */
  font-weight: bold; /* 링크 텍스트를 굵게 표시 */
}

.sidebar a:hover {
  text-decoration: underline; /* 마우스를 올렸을 때 링크 텍스트에 밑줄을 추가 */
  color: blue; /* 마우스를 올렸을 때 링크 텍스트 색상을 노란색으로 변경 */
}

.content {
  //flex: 1; /* flex-grow를 1로 설정, 사용 가능한 공간을 차지하도록 함 */
  //margin-top: 20px; /* 상단 여백 */
  overflow: hidden;
  //overflow: auto; /* 내용이 넘치면 스크롤바가 생기도록 설정 */
  //padding: 30px; /* 내부 패딩 */
  align-items: center; /* 내용을 수직으로 중앙에 정렬 */

  /* 최소 너비를 설정하여 내용이 너무 작아지는 것을 방지 */
  min-width: 0; /* 또는 콘텐츠에 따라 적절한 최소 너비를 설정할 수 있습니다. */
  max-width: 100%; /* 최대 너비를 설정하여 내용이 너무 커지는 것을 방지 */
  width: 100%; /* 너비를 부모 컨테이너에 맞춤 */
  height: auto; /* 높이를 자동으로 설정하여 내용의 비율을 유지 */
}

.logo {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.5em;
}

.logo img {
  height: 30px; /* Adjust size as needed */
  margin-right: 10px;
}

.logout-container {
  order: 2; /* Ensures the container is positioned to the right */
}

.account-info button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1em;
}

/* 로그아웃 버튼에 적용될 스타일 */
.logout-button {
  background-color: #232d35; /* 버튼 색깔 */
  color: #fff; /* 텍스트 색깔 */
  border: none; /* 테두리 없음 */
  padding: 10px; /* 패딩 값 */
  text-align: left; /* 텍스트 왼쪽 정렬 */
  font-size: 17px; /* 폰트 크기 */
  cursor: pointer; /* 커서 포인터 */
  width: 100%; /* 너비를 부모 컨테이너에 맞춤 */
  box-sizing: border-box; /* 패딩과 테두리가 너비에 포함되도록 설정 */
}

/* 구분선 스타일 */
.divider {
  height: 2px; /* 높이 */
  background-color: #fff; /* 색상 */
  margin: 20px 0; /* 상하 여백 */
}


</style>

