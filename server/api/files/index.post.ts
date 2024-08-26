import { User } from "#auth-utils";
import { v4 as uuidv4 } from 'uuid';

// Configurations
const table_id = 'm8tznx3ib22iy6w';
// const xc_token = '<Auth Token>';
const baseUrl = 'https://nocodb-production-7b27.up.railway.app/api/v2';

// Function to insert image
async function insertImage(file: File) {
  console.log('inserting file:', file.name);
  // Parses a data URL and returns an object with the binary data and the file extension.
  const { binaryString, ext } = parseDataUrl(file.content)
  const formData = new FormData();
  formData.append('file', new Blob([binaryString],), file.name);

  const config = await useRuntimeConfig();
  try {
    const response = await $fetch(`${baseUrl}/storage/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'xc-token':  config.nocodbToken,
      },
      // query: { path: "somePath" }
    });
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Function to insert record with attachment
async function uploadFile(file: File, user: User) {
  const name = uuidv4();
  const config = await useRuntimeConfig();

  try {
    let attachmentData = await insertImage(file);
    let row = {
      name,
      "user": user.id,
      "recording": attachmentData
    };
    const resp = await $fetch(`${baseUrl}/tables/${table_id}/records`, {
      method: 'POST',
      body: row,
      headers: {
        // 'xc-token': xc_token
        'xc-token': config.nocodbToken,
      }
    });
    return {resp, name};
  } catch (error) {
    console.error('Error uploading file to NocoDB:', error);
    throw error;
  }
}

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { files } = await readBody(event);
  const results = [];

  console.log(user.id)

  for (const file of files) {
    try {
      console.log('Uploading file:', file.name);
      const result = await uploadFile(file, user);
      const db = await useDB();
      const item = await db.insert(tables.files).values(
        {
          id: uuidv4(),
          userId: user.id,  
          fileName: file.name,
          data: result,
          createdAt: new Date()
        }
      ).returning().get()
      results.push(item);
    } catch (error) {
      results.push({ file: file.name, status: 'failed', error: error.message });
    }
  }


  console.log('Upload results:', results);
  return results;
});

interface File {
  name: string;
  content: string;
}