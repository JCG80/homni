import { LeadWizardData } from '../components/SmartLeadCapture/SmartLeadWizard';

export const validateLeadData = async (data: LeadWizardData, step: number): Promise<Record<string, string>> => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1: // Basic Info Step
      if (!data.title?.trim()) {
        errors.title = 'Tittel er påkrevd';
      } else if (data.title.length < 5) {
        errors.title = 'Tittel må være minst 5 tegn';
      }

      if (!data.description?.trim()) {
        errors.description = 'Beskrivelse er påkrevd';
      } else if (data.description.length < 20) {
        errors.description = 'Beskrivelse må være minst 20 tegn for best resultat';
      }

      if (!data.category?.trim()) {
        errors.category = 'Kategori er påkrevd';
      }
      break;

    case 2: // Contact Step
      if (!data.customer_name?.trim()) {
        errors.customer_name = 'Navn er påkrevd';
      }

      if (!data.customer_email?.trim()) {
        errors.customer_email = 'E-post er påkrevd';
      } else if (!isValidEmail(data.customer_email)) {
        errors.customer_email = 'Ugyldig e-postadresse';
      }

      if (data.customer_phone && !isValidPhoneNumber(data.customer_phone)) {
        errors.customer_phone = 'Ugyldig telefonnummer';
      }

      // If phone is preferred contact method, phone number is required
      if (data.preferred_contact === 'phone' && !data.customer_phone?.trim()) {
        errors.customer_phone = 'Telefonnummer er påkrevd når telefon er foretrukket kontaktmetode';
      }
      break;

    case 3: // Service Details Step
      if (!data.service_type?.trim()) {
        errors.service_type = 'Type tjeneste er påkrevd';
      }
      break;

    case 4: // Review Step
      // Validate all previous steps
      const allErrors = await validateLeadData(data, 1);
      Object.assign(allErrors, await validateLeadData(data, 2));
      Object.assign(allErrors, await validateLeadData(data, 3));
      return allErrors;
  }

  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
  // Norwegian phone number validation (simplified)
  const phoneRegex = /^(\+47|0047|47)?[2-9]\d{7}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  return phoneRegex.test(cleanPhone);
};

export const calculateLeadScore = (data: LeadWizardData): number => {
  let score = 0;
  
  // Basic completeness (40 points)
  if (data.title) score += 10;
  if (data.description && data.description.length > 50) score += 15;
  else if (data.description && data.description.length > 20) score += 10;
  if (data.category) score += 10;
  if (data.service_type) score += 5;

  // Contact quality (30 points)
  if (data.customer_name) score += 10;
  if (data.customer_email) score += 10;
  if (data.customer_phone) score += 10;

  // Detail richness (30 points)
  if (data.urgency && data.urgency !== 'medium') score += 5; // Non-default urgency
  if (data.budget_range) score += 5;
  if (data.property_type) score += 5;
  if (data.property_address) score += 5;
  if (data.project_timeline) score += 5;
  if (data.additional_info) score += 5;

  return Math.min(100, score);
};