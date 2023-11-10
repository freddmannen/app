import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface ParsedMetadataEntry {
  index: number;
  title: string;
  link: string;
  extraInfo: string;
  extraInfoType: string;
  publishedDate: Date;
}
