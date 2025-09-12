import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Eye, RefreshCw, Upload, Download, Wand2, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import the status content directly
import statusMd from '@/content/status/status-latest.md?raw';

// Legacy HTML to Markdown converter
const convertHtmlToMarkdown = (html: string): string => {
  // Basic HTML to Markdown conversion
  let markdown = html;
  
  // Headers
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g, (_, level, content) => {
    const hashes = '#'.repeat(parseInt(level));
    return `${hashes} ${content.replace(/<[^>]+>/g, '')}\n\n`;
  });
  
  // Lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gs, (_, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gs) || [];
    return items.map(item => `- ${item.replace(/<[^>]+>/g, '').trim()}`).join('\n') + '\n\n';
  });
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gs, (_, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gs) || [];
    return items.map((item, index) => `${index + 1}. ${item.replace(/<[^>]+>/g, '').trim()}`).join('\n') + '\n\n';
  });
  
  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gs, '$1\n\n');
  
  // Bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gs, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gs, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gs, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gs, '*$1*');
  
  // Tables
  markdown = markdown.replace(/<table[^>]*>(.*?)<\/table>/gs, (_, tableContent) => {
    const rows = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
    if (rows.length === 0) return '';
    
    let tableMarkdown = '';
    rows.forEach((row, index) => {
      const cells = row.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/gs) || [];
      const cellContent = cells.map(cell => cell.replace(/<[^>]+>/g, '').trim()).join(' | ');
      tableMarkdown += `| ${cellContent} |\n`;
      
      if (index === 0) {
        const separator = cells.map(() => '---').join(' | ');
        tableMarkdown += `| ${separator} |\n`;
      }
    });
    
    return tableMarkdown + '\n';
  });
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n\n\n+/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
};

export default function AdminStatusPage() {
  const [src, setSrc] = useState(statusMd);
  const [isDev] = useState(() => import.meta.env.DEV);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState('');

  const handleReset = useCallback(() => {
    setSrc(statusMd);
    setConversionMessage('');
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([src], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'status-latest.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [src]);

  const handleFileImport = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsConverting(true);
    setConversionMessage('Konverterer fil...');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.type === 'text/html' || file.name.endsWith('.html')) {
        const converted = convertHtmlToMarkdown(content);
        setSrc(converted);
        setConversionMessage(`✅ HTML-fil konvertert til Markdown: ${file.name}`);
      } else if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        setSrc(content);
        setConversionMessage(`📄 Markdown-fil importert: ${file.name}`);
      } else {
        setConversionMessage(`⚠️ Filtype ikke støttet: ${file.type}`);
      }
      
      setIsConverting(false);
    };
    
    reader.onerror = () => {
      setConversionMessage(`❌ Feil ved lesing av fil: ${file.name}`);
      setIsConverting(false);
    };
    
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileImport,
    accept: {
      'text/html': ['.html', '.htm'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt']
    },
    multiple: false,
    disabled: !isDev
  });

  const handleAutoStructure = useCallback(() => {
    setIsConverting(true);
    setConversionMessage('Strukturerer innhold...');
    
    setTimeout(() => {
      // Add status emojis and structure to existing content
      let structured = src;
      
      // Add phase status section if not present
      if (!structured.includes('## 📍 **NÅVÆRENDE FASE-STATUS**')) {
        const phaseSection = `
## 📍 **NÅVÆRENDE FASE-STATUS**
**Fase 2B: Repository Standardization** (Q1 2025)
- ✅ Dokumentasjonskonsolidering: 95% ferdig
- 🔄 Code Quality: 78% ferdig (ESLint ✅, TypeScript: 0 feil, Testing: 89%)
- ⏳ Performance Optimization: 45% ferdig
- 🔄 Security Hardening: Pågår (Supabase linter warnings)

`;
        structured = structured.replace(/^(# [^\n]+\n)/, `$1${phaseSection}`);
      }
      
      // Structure existing sections with better formatting
      structured = structured.replace(/^### /gm, '## ');
      structured = structured.replace(/^## /gm, '### ');
      structured = structured.replace(/^# /gm, '## ');
      structured = structured.replace(/^## 📍/gm, '## 📍');
      
      setSrc(structured);
      setConversionMessage('✅ Innhold strukturert med emojis og statusindikatorer');
      setIsConverting(false);
    }, 1000);
  }, [src]);

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
            {/* Legacy Import Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Legacy Dokumentimport
                </CardTitle>
                <CardDescription>
                  Dra og slipp HTML-filer eller Markdown-dokumenter for automatisk konvertering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive 
                      ? 'Slipp filen her...' 
                      : 'Dra HTML/Markdown-filer hit, eller klikk for å velge'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Støtter: .html, .htm, .md, .txt
                  </p>
                </div>
                
                {conversionMessage && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{conversionMessage}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Live Editor Card */}
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
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Tilbakestill
                  </Button>
                  <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Eksporter
                  </Button>
                  <Button 
                    onClick={handleAutoStructure} 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    disabled={isConverting}
                  >
                    <Wand2 className="h-4 w-4" />
                    {isConverting ? 'Strukturerer...' : 'Auto-strukturer'}
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