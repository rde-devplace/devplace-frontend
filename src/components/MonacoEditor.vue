<template>
  <div style="display: flex; flex-direction: column; height: calc(100% - 2.5rem);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <label>
        Dark Mode:
        <input type="checkbox" v-model="isDark" />
      </label>
      <button @click="postCodeToBackend" class="send-button">보내기</button>
    </div>
    <div style="display: flex; flex: 4;margin-left: 100px;">
      <div ref="container" style="width: 100%; background-color: white;" />
    </div>
    <div style="display: flex; flex-direction: column; flex: 1;">
      <div style="margin-bottom: 10px;">처리 결과</div>
      <pre style="width: 90%; margin-left: 100px; background-color: #f5f5f5; overflow: auto; padding: 1rem;">{{ output }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRefs, watch, reactive } from 'vue'
import { useDebounceFn, useResizeObserver, useStorage } from '@vueuse/core'
import axios from 'axios'

import * as monaco from 'monaco-editor'

import { StorageName, initialEditorValue, useDarkGlobal } from '../utils'

const backendURL = import.meta.env.VITE_KUBE_BACKEND_URL;


const output = ref('') // 결과를 저장할 ref를 추가합니다.
const isDark = ref(true);
//const isDark = useDarkGlobal()

async function postCodeToBackend() {
  const resourceType = activeTab.value
  const url = `${backendURL}/kube/${activeTab.value}`; // URL을 변수로 저장

  try {
    const response = await axios.post(url, {
      data: editor.getValue()
    })
    output.value = `URL: ${url}\n\nResponse:\n${JSON.stringify(response.data, null, 2)}`;
  } catch (error) {
    output.value = `URL: ${url}\n\nError: ${(error as Error).message}`;
    
  }
}


const props = defineProps<{
  activeTab: string
}>()

const emit = defineEmits<(e: 'change', payload: typeof editorValue.value) => void>()


const container = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor
const { activeTab } = toRefs(props)
const editorState = useStorage<Record<string, any>>(StorageName.EDITOR_STATE, {})
const editorValue = useStorage<Record<string, any>>(StorageName.EDITOR_VALUE, initialEditorValue)

onMounted(() => {
  editor = monaco.editor.create(container.value!, {
    language: activeTab.value,
    theme: isDark.value ? 'vs-dark' : 'vs',
  })
  emit('change', editorValue.value)
  editor.onDidChangeModelContent(
    useDebounceFn(() => {
      if (editorValue.value[activeTab.value] !== editor.getValue()!) {
        editorValue.value[activeTab.value] = editor.getValue()!
        emit('change', editorValue.value)
      }
    }, 500),
  )
  if (editorValue.value[activeTab.value]) {
    editor.setValue(editorValue.value[activeTab.value])
    editor.restoreViewState(editorState.value[activeTab.value])
  }
})

watch(activeTab, (currentTab, prevTab) => {
  monaco.editor.setModelLanguage(editor.getModel()!, currentTab)
  editorState.value[prevTab] = editor.saveViewState()
  if (editorValue.value[currentTab])
    editor.setValue(editorValue.value[currentTab])
  else
    editor.setValue('')
  if (editorState.value[currentTab]) {
    editor.restoreViewState(editorState.value[currentTab]!)
    editor.focus()
  }
})

watch(isDark, (value) => {
  editor.updateOptions({
    theme: value ? 'vs-dark' : 'vs',
  })
})

const editorObserver = useResizeObserver(container, () => {
  editor.layout()
})

watch(editorValue, () => {
  postCodeToBackend()
})

onUnmounted(() => {
  editor?.dispose()
  editorObserver.stop()
})
</script>

<!--template>
  <div ref="container" style="height: calc(100% - 2.5rem)" />
</template-->

<!--template>
  <div style="display: flex; flex-direction: column; height: calc(100% - 2.5rem);">
    <div style="display: flex; flex: 1;">
      <div ref="container" style="flex: 1; background-color: black;" />
      <pre style="flex: 1; background-color: #f5f5f5; overflow: auto; padding: 1rem;">{{ output }}</pre>
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
      <button @click="postCodeToBackend" style="background-color: #007BFF; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 1.1em;">보내기</button>
    </div>
  </div>
</template-->


<style>
  .send-button {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.1em;
  }
  .send-button:active {
    transform: scale(0.95); /* 약간의 축소 효과를 줍니다. */
    background-color: #0056b3; /* 조금 더 진한 색으로 변경 */
  }
</style>


