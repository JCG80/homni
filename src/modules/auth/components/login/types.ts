
import { z } from 'zod';

// Schema for login form validation
export const loginSchema = z.object({
  email: z.string().email('Vennligst skriv inn en gyldig e-post'),
  password: z.string().min(6, 'Passordet må være minst 6 tegn')
});

export type LoginFormValues = z.infer<typeof loginSchema>;
