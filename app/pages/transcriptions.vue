<script setup>
definePageMeta({
  middleware: 'auth'
})
const loading = ref(false)
const newTodo = ref('')
const newTodoInput = ref(null)
const { handleFileInput, files } = useFileStorage()

const toast = useToast()
const { user, clear } = useUserSession()
const { data: transcriptions, refresh } = await useFetch('/api/files')

async function uploadFile() {


  loading.value = true
  console.log("submitting files")

  try {

    const todo = await $fetch('/api/files', {
      method: 'POST',
      body: {
        files: files.value
      }
    })
    todos.value.push(todo)
    await refresh()
    toast.add({ title: `Transcriptions for "${todo.title}" created.` })
    fileInput.value.value = '' // Clear the file input
  }
  catch (err) {
    if (err.data?.data?.issues) {
      const title = err.data.data.issues.map(issue => issue.message).join('\n')
      toast.add({ title, color: 'red' })
    } else {
      toast.add({ title: 'Error uploading file', color: 'red' })
    }
  }
  loading.value = false
}

async function addTodo() {
  if (!newTodo.value.trim()) return uploadFile()

  loading.value = true

  try {
    const todo = await $fetch('/api/todos', {
      method: 'POST',
      body: {
        title: newTodo.value,
        completed: 0
      }
    })
    todos.value.push(todo)
    await refresh()
    toast.add({ title: `Todo "${todo.title}" created.` })
    newTodo.value = ''
    nextTick(() => {
      newTodoInput.value?.input?.focus()
    })
  }
  catch (err) {
    if (err.data?.data?.issues) {
      const title = err.data.data.issues.map(issue => issue.message).join('\n')
      toast.add({ title, color: 'red' })
    }
  }
  loading.value = false
}

async function toggleTodo(todo) {
  todo.completed = Number(!todo.completed)
  await $fetch(`/api/todos/${todo.id}`, {
    method: 'PATCH',
    body: {
      completed: todo.completed
    }
  })
  await refresh()
}

async function deleteTodo(todo) {
  await $fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
  todos.value = todos.value.filter(t => t.id !== todo.id)
  await refresh()
  toast.add({ title: `Todo "${todo.title}" deleted.` })
}

const items = [[{
  label: 'Logout',
  icon: 'i-heroicons-arrow-left-on-rectangle',
  click: clear
}]]
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UDropdown v-if="user" :items="items">
          <UButton color="white" trailing-icon="i-heroicons-chevron-down-20-solid">
            <UAvatar :src="`https://github.com/${user.login}.png`" :alt="user.login" size="3xs" />
            {{ user.login }}
          </UButton>
        </UDropdown>
      </div>
    </template>

    <div class="flex items-center gap-4 p-4">
      <UInput type="file" size="xl" icon="i-heroicons-folder" placeholder="Upload a file" :ui="{ wrapper: 'flex-1' }"
        ref="fileInput" @input="handleFileInput" />
      <UButton type="submit" icon="i-heroicons-cloud-arrow-up-20-solid" :loading="loading" size="xl"
        @click="uploadFile" />
    </div>

    <ul class="divide-y divide-gray-200 dark:divide-gray-800 ">

      <li v-for="transcript of transcriptions" :key="transcript.id" class="flex items-center gap-4 py-2 truncate	">
        <div>

          <UButton color="red" variant="ghost" size="2xs" icon="i-heroicons-x-mark-20-solid"
            @click="deleteTodo(todo)" />

          <UButton color="" variant="" size="2xs" icon="i-heroicons-clipboard-20-solid" @click="() => {
            // if (!navigator.clipboard) return alert(transcript.transcription)
            // navigator.clipboard.writeText(transcript.transcription)
            if (navigator && navigator.clipboard) {
              navigator.clipboard.writeText(transcript.transcription)
            } else {
              console.log(transcript.transcription)
            }
            toast.add({ title: 'Copied to clipboard' })
          }" />
        </div>

        <span class="flex-1 font-dark">
          {{ transcript.fileName }}</span>
        <p truncate class="flex-1 font-light" variant="ghost">
          {{ transcript.transcription }}</p>
      </li>
    </ul>
  </UCard>
</template>