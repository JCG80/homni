# UX – Visitor Flow (Startside 3-stegs)

1) **Velg rolle**: Privat/Bedrift
2) **Velg produkt**: (Privat) Strøm/Mobil/Forsikring/Bredbånd · (Bedrift) Energi/Forsikring/Flåte/Plassadm
3) **Kontekst**: postnr/forbruk/ansatte
4) **Kontakt**: e-post + samtykke → opprett lead + light user (dev OTP)

## A11y
- Fokusrekkefølge, label/aria, kontrast
- Progresjonsindikator leveres til skjermleser

## Analytics
- `visitor_role_selected`, `visitor_step_view`, `visitor_lead_submitted`

## Resultat
- Bekreftelse + neste steg
- Backend trigger: `distribute_new_lead(lead_id)` → marketplace-flyt