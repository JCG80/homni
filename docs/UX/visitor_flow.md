# UX – Visitor Flow (Startside 3-stegs)

## Flyt
1) **Velg rolle**: Privat/Bedrift (toggle + localStorage)
2) **Velg produkt**: 
   - Privat: Strøm/Mobil/Forsikring/Bredbånd
   - Bedrift: Energi/Forsikring/Flåte/Plassadm
3) **Kontekst**: postnr/forbruk/ansatte (enkle felt)
4) **Kontakt**: e-post + samtykke → opprett lead + light user (dev OTP)

## Progressindikator
- Visuell fremgang (1/3, 2/3, 3/3)
- Tilgjengelig for skjermleser via aria-label
- Mulighet for å gå tilbake

## A11y (WCAG 2.1 AA)
- Fokusrekkefølge logisk (tab-index)
- Label/aria på alle interaktive elementer
- Kontrast ≥ 4.5:1 for normal tekst
- Progresjonsindikator annonseres til skjermleser
- Feilmeldinger koblet til feltene (aria-describedby)

## Analytics (OpenTelemetry events)
- `visitor_role_selected` → { role: 'user'|'company' }
- `visitor_step_view` → { step: 1|2|3, role }
- `visitor_product_selected` → { product, role }
- `visitor_lead_submitted` → { role, product, postnr }

## Resultat (etter innsending)
- Bekreftelsesside med neste steg
- Backend trigger: `distribute_new_lead(lead_id)` → marketplace-flyt
- E-post til bruker med lenke til innlogging (dev: OTP-kode)

## SEO & Performance
- Meta description: "Sammenlign [rolle]-tjenester på 3 enkle steg"
- Structured data: WebPage + Service schema
- Lazy loading av steg 2/3 komponenter
- Bundle size: wizard-chunk ≤ 50 KB gzipped