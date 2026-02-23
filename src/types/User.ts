export type User = {
  _id: string;
  name: string;
  email: string;
  phone: number;
  company?: string;
  defaultWaAccountId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}