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

      // 팝업 창이 제대로 열렸는지 확인
      if (popupWindow && popupWindow.document) {
        popupWindow.document.write(htmlContent)
        popupWindow.document.close()
      }
      else {
        alert('Popup blocked! Please allow popups for this site and try again.')
      }
    }

    const logout = async () => {
      try {
        // const response = await axios.post(`${keycloakBaseURL}logout?redirect_uri=${wettyBaseURL}list`)
        const response = await axios.get(`${wettyBaseURL}logout`)
        if (response.status === 200)
          displayInPopup({ htmlContent: response.data })
        else
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
    <div class="sidebar">
      <!-- 제목 표시 -->
      <button @click="logout">
        {{ username || 'login' }}
      </button> <!-- 로그인된 사용자 이름 표시 및 클릭 이벤트 바인딩 -->
      <!-- 구분선 추가 -->
      <div class="divider" />
      <ul>
        <li>
          <router-link to="/">
            <img src="@/assets/terminal-svgrepo-com.svg" alt="Terminal Icon" class="menu-icon">
            Digital Workplace
          </router-link>
        </li>
        <li>
          <router-link to="/kube">
            <img src="@/assets/kubernetes.256x249.svg" class="menu-icon">
            Kubernetes
          </router-link>
        </li>
      </ul>
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar-header {
  color: #fff; /* 텍스트를 흰색으로 설정 */
  background-color: #007BFF; /* 배경색을 파란색으로 설정 */
  padding: 10px; /* 패딩을 추가하여 텍스트 주위에 공간을 만듭니다 */
  font-size: 1.5em;
  margin-bottom: 10px;
  font-weight: bold;
  border-radius: 4px; /* 모서리를 둥글게 합니다 */
}

/* 구분선 스타일 */
.divider {
  height: 2px; /* 선 두께 */
  background-color: #fff; /* 선 색상 */
  margin-bottom: 20px; /* 메뉴와의 간격 */
}

.sidebar {
  width: 200px;
  height: 100%;
  background-color: #000;
  padding: 10px;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
  /* 추가: flexbox 속성 */
  display: flex;
  flex-direction: column;
  vertical-align: middle;
  /* align-items: flex-start; */
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.sidebar a {
  color: #fff; /* 메뉴 텍스트를 흰색으로 변경 */
  text-decoration: none;
  font-weight: bold;
}

.sidebar a:hover {
  text-decoration: underline;
  color: yellow;
}

.content {
  flex: 1;
  margin-top: 20px;
  overflow: auto;
  /* margin-left: 200px; */
  padding: 30px;
}

/* 메뉴 아이콘 스타일 */
.menu-icon {
  height: 18px;    /* 아이콘의 높이를 조절하고 */
  width: auto;     /* 가로 세로 비율을 유지 */
  margin-right: 5px; /* 텍스트와의 간격 */
  display: inline-block; /* 이미지와 Text를 한 라인으로 */
  vertical-align: middle; /* 이미지와 텍스트를 수직 중앙 정렬 */
}
</style>

