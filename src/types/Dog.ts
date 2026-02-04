export interface Dog {
  id: string;
  name: string;
  breed: string;
  photoUri?: string;
  metLocationText?: string;
  notes?: string;
  metAt: string; // ISO datetime string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  isMine?: boolean; // Flag to distinguish "My Dogs" (true) from "Met Dogs" (undefined/false)
}
