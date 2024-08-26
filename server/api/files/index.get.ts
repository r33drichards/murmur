import { eq } from 'drizzle-orm';

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  
  // Fetch files from your database
  const files = await useDB().select().from(tables.files).where(eq(tables.files.userId, user.id)).all();
  const config = await useRuntimeConfig();
  // Fetch transcriptions from NocoDB
  const nocodbResponse = await $fetch('https://nocodb-production-7b27.up.railway.app/api/v2/tables/mvjv4skq7qyynxa/records', {
    method: 'GET',
    params: {
      offset: '0',
      limit: '25',
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
      transcription: matchingTranscription ? matchingTranscription.transcription : "Transcribing, please wait..."
    };
  });

  return result;
});
