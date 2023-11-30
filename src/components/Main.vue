<script setup lang="ts">
import { ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import Tabs from './Tabs.vue'

const backendURL = import.meta.env.VITE_KUBE_BACKEND_URL

const items = ref([
  { text: 'HTML', value: 'html' },
  { text: 'CSS', value: 'css' },
  { text: 'JS', value: 'javascript' },
  { text: 'YAML', value: 'yaml' },
])

const k8sResourceTypes = ref([
  { text: 'Pod', value: 'pod.yaml' },
  { text: 'Service', value: 'service.yaml' },
  { text: 'Deployment', value: 'deployment.yaml' },
])

const buttonToggled = ref(false)
const toggleButtonStyle = () => { // 추가: 버튼 상태를 변경하는 함수
  buttonToggled.value = !buttonToggled.value
}

const yamlData = ref('')
const selectedK8sResource = ref(k8sResourceTypes.value[0])
const currentTab = ref('yaml') // 추가: 현재 탭을 나타내는 ref 변수
</script>

<template>
  <main class="border-t border-gray-200 dark:border-gray-700">
    <div class="flex flex-row h-full height: 80vh" style=" height: 80vh;">
      <div id="split-0" class="w-full">
        <Tabs v-model="currentTab" :items="items" />
        <span class="gray-backgroud-label">Resource Type &nbsp;&nbsp;&nbsp;   </span>
        <select v-model="selectedK8sResource">
          <option v-for="resource in k8sResourceTypes" :value="resource">
            {{ resource.text }}
          </option>
        </select>

        <MonacoEditor :active-tab="currentTab" :content="yamlData" />
      </div>
    </div>
  </main>
</template>

<style>
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

.gray-backgroud-label {
  margin-right: 10px;  /* or any other value you find suitable */
  margin-left: 20px;  /* or any other value you find suitable */
  background-color: #cccccc; /* 회색 배경색 */
  padding: 2px 6px; /* 옵션: 텍스트 주위에 패딩 추가 */
}

/* Making the main content scrollable */
main {
  overflow-y: auto;
}
</style>

