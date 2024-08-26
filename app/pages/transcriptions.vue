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


const refreshing = ref(false)
async function refreshData() {
  refreshing.value = true
  await refresh()
  refreshing.value = false
}

// every 3 seconds refresh the data
onNuxtReady(async () => {
  setInterval(refresh, 3000)
})

async function uploadFile() {

  if (!files.value.length) {
    return toast.add({ title: 'No files selected', color: 'red' })
  }


  loading.value = true
  console.log("submitting files")

  try {

    const file = await $fetch('/api/files', {
      method: 'POST',
      body: {
        files: files.value
      }
    })
    await refresh()
    // console.log(file)
    toast.add({ title: `Transcriptions for "${file[0].fileName}" created.` })
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


async function deleteTranscript(transcript) {
  await $fetch(`/api/files/${transcript.id}`, { method: 'DELETE' })
  transcriptions.value = transcriptions.value.filter(t => t.id !== transcript.id)
  await refresh()
  toast.add({ title: `Transcription for "${transcript.fileName}" deleted.` })
}

const items = [[{
  label: 'Logout',
  icon: 'i-heroicons-arrow-left-on-rectangle',
  click: clear
}]]


async function setClipboard(text) {
  const type = "text/plain";
  const blob = new Blob([text], { type });
  const data = [new ClipboardItem({ [type]: blob })];
  await navigator.clipboard.write(data);
}
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

    <!-- align refresh button to the right -->
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
            @click="deleteTranscript(transcript)" />

          <UButton color="" variant="" size="2xs" icon="i-heroicons-clipboard-20-solid" @click="async () => {
            // if (!navigator.clipboard) return alert(transcript.transcription)
            // navigator.clipboard.writeText(transcript.transcription)
            await setClipboard(transcript.transcription)
            toast.add({ title: 'Copied to clipboard' })
          }" />
        </div>

        <span class="flex-1 font-dark">
          {{ transcript.fileName }}</span>
        <p truncate class="flex-1 font-light " variant="ghost">
          {{ transcript.transcription }}</p>
      </li>
    </ul>
  </UCard>
</template>