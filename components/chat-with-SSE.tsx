'use client';

import { useChat, type Message, type CreateMessage } from 'ai/react'
import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { ChatList } from '@/components/chat-list';
import { ChatPanel } from '@/components/chat-panel';
import { EmptyScreen } from '@/components/empty-screen';
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview';

// export interface CreateMessage {
//   id: string;
//   content: string;
//   role: string;
// }

export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
  initialMessages?: Message[]
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>('ai-token', null)
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const [jobId, setJobId] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // This useEffect sets up the EventSource connection
  useEffect(() => {
    if (jobId) {
      const newEventSource = new EventSource(`/api/stream/${jobId}`);
      console.log(`Established EventSource connection with jobId: ${jobId}`);
      setEventSource(newEventSource);

      newEventSource.onmessage = (e) => {
        const newMessage = JSON.parse(e.data);
        setMessages((prevMessages) => [
          ...prevMessages,
          newMessage,
        ]);
      };

      newEventSource.onerror = (e) => {
        if (e instanceof MessageEvent) {
          console.error('EventSource failed:', e.data);
        } else {
          console.error('EventSource encountered an error:', e);
        }
        toast.error('Error connecting to chat updates.');
        setIsLoading(false);
        newEventSource.close();
      };
      

      return () => {
        newEventSource.close();
        console.log(`Closed EventSource connection with jobId: ${jobId}`);
      };
    }
  }, [jobId]);

  // Handlers for chat actions
  const handleStop = () => {
    setIsLoading(false)
  }

  // Append function to send a message to the server
  const append = async (message: Message | CreateMessage): Promise<string | null> => {
    const { content, role } = message;
    
    // Log the request content before sending
    console.log(`Sending message to backend: `, message);
    
    setInput(''); // This will immediately hide EmptyScreen when the user sends a message

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include Authorization only if previewToken is used by the backend
          ...(previewToken ? { 'Authorization': `Bearer ${previewToken}` } : {}),
        },
        body: JSON.stringify({ message: content }), // Backend expects key 'message'
      });

      const responseBody = await response.json();

      // Log the response received from the backend
      console.log(`Received response from backend:`, responseBody);

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      // Use optional chaining in case job_id doesn't exist in the response
      const job_id = responseBody?.job_id;
      if (job_id) {
        // If job_id is present, log success and add to state
        console.log('Message sent successfully with job_id:', job_id);
        setJobId(job_id);
        setInput('');
        return job_id; // Assuming job_id is a string
      } else {
        // Handle case where job_id is not present in the response
        toast.error('Backend response does not contain job_id.');
        console.error('Backend response does not contain job_id:', responseBody);
        return null;
      }
    } catch (error) {
      // If an error occurs, log and show an error message
      console.error('Error sending message:', error);
      toast.error('Message sending failed.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reload function to refresh the chat history from the server
  const reload = async (): Promise<string | null | undefined> => {
    console.log('Reloading chat history...');
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/history?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${previewToken}`
        }
      });
  
      if (response.ok) {
        const history = await response.json();
        setMessages(history);
        console.log('Chat history reloaded successfully.');
        return null; // Return null to indicate success without a specific result
      } else {
        toast.error('Failed to reload chat history.');
        return undefined; // Return undefined to indicate failure
      }
    } catch (error) {
      console.error('Failed to reload chat history:', error);
      toast.error('Failed to reload chat history.');
      return undefined; // Return undefined to indicate failure
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={handleStop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              Please enter your OpenAI API key to access the chat. Your token will be securely stored.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
          <Button
            onClick={(e) => {
              console.log(`Saving OpenAI API token... Event type: ${e.type}`);
              if (previewTokenInput) {
                setPreviewToken(previewTokenInput);
                console.log('Token saved successfully.');
                setPreviewTokenDialog(false);
              } else {
                console.error('Token input is empty.');
              }
            }}
          >
            Save Token
          </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}