import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Search,
  ChevronDown,
  Plus,
  Home,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      category: 'Komme i gang',
      questions: [
        {
          question: 'Hvordan fungerer Homni?',
          answer: 'Homni kobler deg med kvalifiserte tjenesteyterne. Du sender en forespørsel, vi finner passende leverandører, og du mottar tilbud direkte.'
        },
        {
          question: 'Er det gratis å bruke Homni?',
          answer: 'Ja, det er helt gratis for privatpersoner å bruke Homni. Du betaler kun hvis du velger å gå videre med en tjenesteyteren.'
        },
        {
          question: 'Hvor lang tid tar det å få svar?',
          answer: 'De fleste forespørsler får svar innen 24-48 timer. Hastesaker kan få raskere respons.'
        }
      ]
    },
    {
      category: 'Forespørsler',
      questions: [
        {
          question: 'Hvilke tjenester kan jeg be om?',
          answer: 'Vi dekker de fleste hjemme- og eiendomstjenester: håndverkere, energi, forsikring, finansiering, og mye mer.'
        },
        {
          question: 'Kan jeg endre eller avbryte en forespørsel?',
          answer: 'Ja, du kan endre eller avbryte forespørsler fra "Mine forespørsler" så lenge de ikke er fullført.'
        }
      ]
    },
    {
      category: 'Eiendommer',
      questions: [
        {
          question: 'Hvorfor skal jeg registrere eiendommer?',
          answer: 'Ved å registrere eiendommene dine får du mer presise og relevante tilbud basert på eiendomstype, størrelse og lokasjon.'
        },
        {
          question: 'Er eiendomsinformasjonen sikker?',
          answer: 'Ja, all eiendomsinformasjon er kryptert og behandles i henhold til GDPR. Vi deler kun nødvendig informasjon med pre-kvalifiserte tjenesteyterne.'
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: 'Live Chat',
      description: 'Få øyeblikkelig hjelp fra vårt supportteam',
      icon: MessageCircle,
      action: 'Start chat',
      available: true
    },
    {
      title: 'Ring oss',
      description: 'Telefonsupport hverdager 09:00-17:00',
      icon: Phone,
      action: '22 12 34 56',
      available: true
    },
    {
      title: 'E-post support',
      description: 'Send oss en e-post, vi svarer innen 24 timer',
      icon: Mail,
      action: 'support@homni.no',
      available: true
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hjelp & Support - Homni</title>
        <meta name="description" content="Få hjelp og support for Homni. Finn svar på vanlige spørsmål eller kontakt vårt supportteam." />
      </Helmet>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Hjelp & Support</h1>
            <p className="text-muted-foreground">
              Finn svar på vanlige spørsmål eller kontakt vårt supportteam
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Søk i hjelpeartiklene..." 
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Kom i gang med Homni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">1. Send forespørsel</h3>
                    <p className="text-sm text-muted-foreground">
                      Beskriv hvilken tjeneste du trenger
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">2. Motta tilbud</h3>
                    <p className="text-sm text-muted-foreground">
                      Få tilbud fra kvalifiserte tjenesteyterne
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">3. Velg og fullfør</h3>
                    <p className="text-sm text-muted-foreground">
                      Velg beste tilbud og fullfør prosjektet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Sections */}
            <div className="space-y-6">
              {faqItems.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                  <CardHeader>
                    <CardTitle>{section.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.questions.map((item, index) => (
                      <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <button className="flex items-center justify-between w-full text-left">
                          <h3 className="font-medium">{item.question}</h3>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <p className="text-sm text-muted-foreground mt-2">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Sendt oss en melding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Navn</label>
                    <Input placeholder="Ditt navn" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-post</label>
                    <Input type="email" placeholder="din@epost.no" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Emne</label>
                  <Input placeholder="Hva gjelder henvendelsen?" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Melding</label>
                  <Textarea 
                    placeholder="Beskriv hvordan vi kan hjelpe deg..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button>Send melding</Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Support Options */}
            <Card>
              <CardHeader>
                <CardTitle>Kontakt oss</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportOptions.map((option, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <option.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{option.title}</h4>
                          {option.available && (
                            <Badge variant="default" className="text-xs">Tilgjengelig</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {option.description}
                        </p>
                        <Button size="sm" variant="outline" className="text-xs">
                          {option.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Nyttige lenker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                >
                  Send ny forespørsel
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/leads')}
                >
                  Mine forespørsler
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/properties')}
                >
                  Mine eiendommer
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  Min profil
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Systemstatus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Alle systemer fungerer normalt
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPage;