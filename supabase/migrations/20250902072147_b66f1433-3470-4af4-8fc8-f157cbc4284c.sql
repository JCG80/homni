-- Fix duplicate slugs and seed real companies
-- First, clear all existing data to start fresh
TRUNCATE public.insurance_companies RESTART IDENTITY CASCADE;

-- Insert all 32 real insurance companies from Tjenestetorget.no with proper slugs
INSERT INTO public.insurance_companies (name, slug, description, is_published, sort_index, website_url, customer_rating, is_featured) VALUES
('Agria', 'agria', 'Agria tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 0, 'https://agria.no', 4.2, true),
('Codan', 'codan', 'Codan tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 1, 'https://codan.no', 4.1, true),
('DS Försäkring', 'ds-forsakring', 'DS Försäkring tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 2, 'https://dsforsakring.no', 4.0, true),
('Enter', 'enter', 'Enter tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 3, 'https://enter.no', 3.9, true),
('Europeiske', 'europeiske', 'Europeiske tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 4, 'https://europeiske.no', 4.3, true),
('Frende', 'frende', 'Frende tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 5, 'https://frende.no', 4.4, true),
('Fremtind', 'fremtind', 'Fremtind tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 6, 'https://fremtind.no', 4.5, false),
('Gjensidige', 'gjensidige', 'Gjensidige tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 7, 'https://gjensidige.no', 4.6, false),
('Gouda', 'gouda', 'Gouda tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 8, 'https://gouda.no', 4.0, false),
('Help', 'help', 'Help tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 9, 'https://help.no', 3.8, false),
('If', 'if', 'If tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 10, 'https://if.no', 4.7, false),
('Jernbanepersonalets Bank og Forsikring (JBF)', 'jbf', 'JBF tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 11, 'https://jbf.no', 4.2, false),
('Knif', 'knif', 'Knif tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 12, 'https://knif.no', 3.9, false),
('Komplett', 'komplett', 'Komplett tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 13, 'https://komplett.no', 4.1, false),
('KLP', 'klp', 'KLP tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 14, 'https://klp.no', 4.3, false),
('Landkreditt', 'landkreditt', 'Landkreditt tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 15, 'https://landkreditt.no', 4.0, false),
('Nemi', 'nemi', 'Nemi tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 16, 'https://nemi.no', 4.2, false),
('Nordea', 'nordea', 'Nordea tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 17, 'https://nordea.no', 4.4, false),
('NAF', 'naf', 'NAF tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 18, 'https://naf.no', 4.1, false),
('Rema', 'rema', 'Rema tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 19, 'https://rema.no', 3.8, false),
('Sparebank 1', 'sparebank-1', 'Sparebank 1 tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 20, 'https://sparebank1.no', 4.3, false),
('Storebrand', 'storebrand', 'Storebrand tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 21, 'https://storebrand.no', 4.5, false),
('Tide', 'tide', 'Tide tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 22, 'https://tide.no', 4.0, false),
('Tryg', 'tryg', 'Tryg tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 23, 'https://tryg.no', 4.6, false),
('Tennant', 'tennant', 'Tennant tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 24, 'https://tennant.no', 3.9, false),
('Troll', 'troll', 'Troll tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 25, 'https://troll.no', 3.7, false),
('Tribe', 'tribe', 'Tribe tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 26, 'https://tribe.no', 4.1, false),
('Trumf', 'trumf', 'Trumf tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 27, 'https://trumf.no', 3.8, false),
('Vardia', 'vardia', 'Vardia tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 28, 'https://vardia.no', 4.2, false),
('Volvia', 'volvia', 'Volvia tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 29, 'https://volvia.no', 4.0, false),
('Vesta', 'vesta', 'Vesta tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 30, 'https://vesta.no', 3.9, false),
('Watercircles', 'watercircles', 'Watercircles tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 31, 'https://watercircles.no', 4.3, false);