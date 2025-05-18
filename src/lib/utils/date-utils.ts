
import { format, parseISO, isValid } from "date-fns";
import { nb } from "date-fns/locale";

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Ukjent dato';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Ugyldig dato';
    
    return format(date, 'PPP', { locale: nb });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Feil ved formatering av dato';
  }
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Ukjent tidspunkt';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Ugyldig tidspunkt';
    
    return format(date, 'PPP HH:mm', { locale: nb });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Feil ved formatering av tidspunkt';
  }
};

export const formatTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Ukjent tid';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Ugyldig tid';
    
    return format(date, 'HH:mm', { locale: nb });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Feil ved formatering av tid';
  }
};
