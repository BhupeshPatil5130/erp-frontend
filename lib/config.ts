// Declare process to satisfy TypeScript without requiring @types/node in this project setup
declare const process: any

export const API_BASE_URL: string = (process?.env?.NEXT_PUBLIC_API_BASE_URL as string) || "http://localhost:4000"
