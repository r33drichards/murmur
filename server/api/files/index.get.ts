import { eq } from 'drizzle-orm';

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  
  // Fetch files from your database
  const files = await useDB().select().from(tables.files).where(eq(tables.files.userId, user.id)).all();
  const config = await useRuntimeConfig(event);
  // Fetch transcriptions from NocoDB
  const nocodbResponse = await $fetch('https://nocodb-production-7b27.up.railway.app/api/v2/tables/mvjv4skq7qyynxa/records', {
    method: 'GET',
    params: {
      offset: '0',
      limit: '500',
      where: '',
      viewId: 'vwrrvvm1st1mdwxj'
    },
    headers: {
      'xc-token': config.nocodbToken,
    }
  });

  // Extract the transcription data
  const transcriptions = nocodbResponse.list; // Assuming the list of records is under the 'list' key in the response
  // Match transcriptions with files based on name
  const result = files.map(file => {
    const matchingTranscription = transcriptions.find(transcription => transcription.name === file.data.name);
    return {
      ...file,
      transcription: matchingTranscription ? matchingTranscription.transcription : "Transcribing, please wait... " + timeSinceCreationMinutesSeconds(file.createdAt),
      // timeSinceCreation: 
    };
  });

  return result;
});


function timeSinceCreationMinutesSeconds(createdAt) {
  const now = Date.now();
  const diff = now - createdAt;

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  // Ensure minutes and seconds are two digits
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}
