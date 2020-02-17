export interface UserData {
  uid?: string|null,
  displayName: string|undefined,
  email: string|undefined,
  password?: string,
  phoneNumber?: string,
  photoURL?: string,
  role: string
  emailVerified?: boolean,
  disabled?: boolean
}