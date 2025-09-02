-- Seed insurance companies from Tjenestetorget.no
-- First clear existing test data and insert real companies

-- Helper function to create slug
CREATE OR REPLACE FUNCTION create_slug(input_text TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(input_text, 'ø', 'o', 'g'), 
          'æ', 'ae', 'g'
        ), 
        'å', 'a', 'g'
      ), 
      '[^a-z0-9]+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Delete existing companies to start fresh
DELETE FROM public.insurance_companies;

-- Insert 32 real insurance companies from Tjenestetorget.no
INSERT INTO public.insurance_companies (name, slug, description, is_published, sort_index, website_url, customer_rating, is_featured) VALUES
('Agria', create_slug('Agria'), 'Agria tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 0, 'https://agria.no', 4.2, true),
('Codan', create_slug('Codan'), 'Codan tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 1, 'https://codan.no', 4.1, true),
('DS Försäkring', create_slug('DS Försäkring'), 'DS Försäkring tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 2, 'https://dsforsakring.no', 4.0, true),
('Enter', create_slug('Enter'), 'Enter tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 3, 'https://enter.no', 3.9, true),
('Europeiske', create_slug('Europeiske'), 'Europeiske tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 4, 'https://europeiske.no', 4.3, true),
('Frende', create_slug('Frende'), 'Frende tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 5, 'https://frende.no', 4.4, true),
('Fremtind', create_slug('Fremtind'), 'Fremtind tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 6, 'https://fremtind.no', 4.5, false),
('Gjensidige', create_slug('Gjensidige'), 'Gjensidige tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 7, 'https://gjensidige.no', 4.6, false),
('Gouda', create_slug('Gouda'), 'Gouda tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 8, 'https://gouda.no', 4.0, false),
('Help', create_slug('Help'), 'Help tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 9, 'https://help.no', 3.8, false),
('If', create_slug('If'), 'If tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 10, 'https://if.no', 4.7, false),
('Jernbanepersonalets Bank og Forsikring (JBF)', create_slug('Jernbanepersonalets Bank og Forsikring JBF'), 'JBF tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 11, 'https://jbf.no', 4.2, false),
('Knif', create_slug('Knif'), 'Knif tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 12, 'https://knif.no', 3.9, false),
('Komplett', create_slug('Komplett'), 'Komplett tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 13, 'https://komplett.no', 4.1, false),
('KLP', create_slug('KLP'), 'KLP tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 14, 'https://klp.no', 4.3, false),
('Landkreditt', create_slug('Landkreditt'), 'Landkreditt tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 15, 'https://landkreditt.no', 4.0, false),
('Nemi', create_slug('Nemi'), 'Nemi tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 16, 'https://nemi.no', 4.2, false),
('Nordea', create_slug('Nordea'), 'Nordea tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 17, 'https://nordea.no', 4.4, false),
('NAF', create_slug('NAF'), 'NAF tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 18, 'https://naf.no', 4.1, false),
('Rema', create_slug('Rema'), 'Rema tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 19, 'https://rema.no', 3.8, false),
('Sparebank 1', create_slug('Sparebank 1'), 'Sparebank 1 tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 20, 'https://sparebank1.no', 4.3, false),
('Storebrand', create_slug('Storebrand'), 'Storebrand tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 21, 'https://storebrand.no', 4.5, false),
('Tide', create_slug('Tide'), 'Tide tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 22, 'https://tide.no', 4.0, false),
('Tryg', create_slug('Tryg'), 'Tryg tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 23, 'https://tryg.no', 4.6, false),
('Tennant', create_slug('Tennant'), 'Tennant tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 24, 'https://tennant.no', 3.9, false),
('Troll', create_slug('Troll'), 'Troll tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 25, 'https://troll.no', 3.7, false),
('Tribe', create_slug('Tribe'), 'Tribe tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 26, 'https://tribe.no', 4.1, false),
('Trumf', create_slug('Trumf'), 'Trumf tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 27, 'https://trumf.no', 3.8, false),
('Vardia', create_slug('Vardia'), 'Vardia tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 28, 'https://vardia.no', 4.2, false),
('Volvia', create_slug('Volvia'), 'Volvia tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 29, 'https://volvia.no', 4.0, false),
('Vesta', create_slug('Vesta'), 'Vesta tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 30, 'https://vesta.no', 3.9, false),
('Watercircles', create_slug('Watercircles'), 'Watercircles tilbyr forsikringsløsninger for privatpersoner og bedrifter.', true, 31, 'https://watercircles.no', 4.3, false);

-- Drop the helper function
DROP FUNCTION create_slug(TEXT);