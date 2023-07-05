export interface Coordinates {
  x: number | undefined;
  y: number | undefined;
}

export interface Message {
  id: number;
  user_id: string;
  message: string;
}

type Task = {
  id: number;
  userId: string;
  content: string;
  taskId: number;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface Comment {
  id: number;
  userId: string;
  content: string;
  taskId: number;
  parentId: number;
}

export interface Payload<T> {
  type: string;
  event: string;
  payload?: T;
}

export interface User extends Coordinates {
  color: string;
  hue: string;
  isTyping?: boolean;
  roomId?: string;
  message?: string;
}
