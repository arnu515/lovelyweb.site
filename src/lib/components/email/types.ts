export interface Attachment {
  name: string;
  size: string;
  type: string;
}

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  isImportant: boolean;
  isSelected: boolean;
  attachments: Attachment[];
  tags: string[];
  avatar: string;
}