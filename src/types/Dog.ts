export interface Dog {
  id: string;
  name: string;
  breed: string;
  photoUri?: string;
  metLocationText?: string;
  notes?: string;
  metAt: string; // ISO datetime string
}
