import { kv } from '@vercel/kv';
import { auth } from '@/auth';
import { nanoid } from '@/lib/utils';
import { parseMetadata } from '@/lib/utils';
import { ParsedMetadataEntry } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  let json;
  try {
    json = await req.json();
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return new Response('Bad request', { status: 400 });
  }

  const { message } = json;

  const session = await auth();

  if (!session?.user) {
    console.error('Unauthorized request: No session user found.');
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  const id = json.id ?? nanoid();

  // Compose the backend chat endpoint URL
  const backendChatUrl = `${process.env.REACT_APP_BACKEND_URL}/chat`;

  try {
    console.log(`[${new Date().toISOString()}] Sending chat message from user ${userId}:`, message);

    const chatResponse = await fetch(backendChatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!chatResponse.ok) {
      throw new Error(`Backend failed to process chat message with status ${chatResponse.status}`);
    }

    const responseBody = await chatResponse.json();
    console.log(`[${new Date().toISOString()}] Received response from backend:`, responseBody);

    const job_id = responseBody.job_id;
    const responseContent = responseBody.response?.response || responseBody.response;
    // Process formattedMetadata on the server-side
    let structuredMetadata: ParsedMetadataEntry[] = [];

    if (responseBody.formatted_metadata) {
      structuredMetadata = parseMetadata(responseBody.formatted_metadata);
      
      console.log('Parsed metadata:', structuredMetadata);
      console.log('parsedEntries:', JSON.stringify(structuredMetadata, null, 2));

    }

    console.log(`[${new Date().toISOString()}] Chat message sent and recorded with job id ${job_id}`);

    const createdAt = Date.now();
    const chatRecord = { id, title: message.substring(0, 100), userId, createdAt, job_id };

    await kv.set(`chat:${id}`, JSON.stringify(chatRecord));
    await kv.zadd(`user:chat:${userId}`, { score: createdAt, member: `chat:${id}` });

   // Return to the client server-processed metadata along with job_id and content
   return new Response(JSON.stringify({id, job_id, response: responseContent, structured_metadata: structuredMetadata, role:'assistant'}), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });

  } catch (error: unknown) {
    console.error(`[${new Date().toISOString()}] Error on POST /api/chat for user ${userId}:`, error);

    let status = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error && 'status' in error) {
      status = (error as any).status || 500;
      errorMessage = error.message || errorMessage;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: status
    });
  }
}