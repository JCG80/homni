
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="rounded-lg border">
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
            {items.map((item) => (
              <TableRow key={item.id} className={item.highlight ? 'bg-accent/30' : ''}>
                <TableCell className="font-medium">
                  {item.name}
                  {item.label && (
                    <Badge variant="outline" className="ml-2">
                      {item.label}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {item.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.price} {currency}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onSelect && onSelect(item.id)}
                    variant={item.highlight ? "default" : "outline"}
                    size="sm"
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
