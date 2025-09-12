import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Eye, RefreshCw } from 'lucide-react';

// Import the status content directly
import statusMd from '@/content/status/status-latest.md?raw';

export default function AdminStatusPage() {
  const [src, setSrc] = useState(statusMd);
  const [isDev] = useState(() => import.meta.env.DEV);

  const handleReset = () => {
    setSrc(statusMd);
  };

  const handleExport = () => {
    const blob = new Blob([src], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'status-latest.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Systemstatus & endringslogg</h1>
            <p className="text-muted-foreground">
              Kilde: <code className="bg-muted px-2 py-1 rounded text-sm">src/content/status/status-latest.md</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              Markdown
            </Badge>
            {isDev && (
              <Badge variant="secondary">Dev Mode</Badge>
            )}
          </div>
        </div>
      </header>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Forhåndsvisning
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2" disabled={!isDev}>
            <Edit className="h-4 w-4" />
            Rediger {!isDev && '(kun dev)'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Status Dashboard
              </CardTitle>
              <CardDescription>
                Live status og endringslogg for Homni-plattformen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children, ...props }) => (
                      <h1 className="text-3xl font-bold mb-6 border-b pb-4" {...props}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children, ...props }) => (
                      <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary" {...props}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }) => (
                      <h3 className="text-xl font-medium mt-6 mb-3" {...props}>
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4 bg-muted/50 py-2 rounded-r" {...props}>
                        {children}
                      </blockquote>
                    ),
                    code: ({ className, children, ...props }) => (
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ),
                    ul: ({ children, ...props }) => (
                      <ul className="list-disc ml-6 space-y-1" {...props}>
                        {children}
                      </ul>
                    ),
                    li: ({ children, ...props }) => (
                      <li className="text-foreground" {...props}>
                        {children}
                      </li>
                    ),
                  }}
                >
                  {src}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isDev && (
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Live Editor (Development)
                </CardTitle>
                <CardDescription>
                  Endre Markdown-innholdet midlertidig for testing. Endringer lagres ikke permanent i prod.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Tilbakestill
                  </Button>
                  <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Eksporter
                  </Button>
                </div>
                <Textarea
                  className="min-h-[500px] font-mono text-sm"
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  placeholder="Lim inn Markdown-innhold her..."
                  aria-label="Markdown editor"
                />
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                  <strong>Merk:</strong> Endringer her lagres ikke til fil i produksjon. 
                  For permanente endringer, oppdater <code>src/content/status/status-latest.md</code> via PR.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}