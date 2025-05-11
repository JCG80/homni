
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

interface ComparisonItem {
  id: string;
  name: string;
  price: number;
  features: string[];
  highlight?: boolean;
  label?: string;
}

interface PriceComparisonProps {
  title: string;
  description?: string;
  items: ComparisonItem[];
  onSelect?: (id: string) => void;
  currency?: string;
}

export function PriceComparison({
  title,
  description,
  items,
  onSelect,
  currency = 'kr'
}: PriceComparisonProps) {
  // Sort items by price
  const sortedItems = [...items].sort((a, b) => a.price - b.price);
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          {description && <TableCaption>{description}</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Leverandør</TableHead>
              <TableHead>Detaljer</TableHead>
              <TableHead className="text-right">Pris</TableHead>
              <TableHead className="text-right w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item, index) => (
              <TableRow 
                key={item.id} 
                className={item.highlight ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
              >
                <TableCell className="font-medium">
                  <div className="flex items-start gap-2">
                    {index === 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Billigst
                      </Badge>
                    )}
                    {item.label && item.label !== 'Billigst' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {item.label}
                      </Badge>
                    )}
                    <div className="mt-1">{item.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {item.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-right font-medium text-lg">
                  {item.price} {currency}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onSelect && onSelect(item.id)}
                    variant={item.highlight ? "default" : "outline"}
                    size="sm"
                    className={item.highlight ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    Velg
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
