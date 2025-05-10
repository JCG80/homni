
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "../types/propertyTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { House, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/propertyUtils";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const navigate = useNavigate();
  
  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <House className="h-5 w-5" />;
      case 'cabin':
        return <House className="h-5 w-5" />;
      case 'rental':
        return <House className="h-5 w-5" />;
      case 'foreign':
        return <House className="h-5 w-5" />;
      default:
        return <House className="h-5 w-5" />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'house':
        return 'Bolig';
      case 'cabin':
        return 'Hytte';
      case 'rental':
        return 'Utleie';
      case 'foreign':
        return 'Utenlandsk';
      default:
        return type;
    }
  };

  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-normal">
            {getPropertyIcon(property.type)}
            <span className="ml-1">{getPropertyTypeLabel(property.type)}</span>
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2">{property.name}</CardTitle>
        <CardDescription className="line-clamp-1">{property.address || 'Ingen adresse angitt'}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          {property.size && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Størrelse:</span>
              <span>{property.size} m²</span>
            </div>
          )}
          
          {property.purchase_date && (
            <div className="flex items-center text-muted-foreground text-xs mt-4">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Kjøpt: {formatDate(property.purchase_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleViewDetails}
        >
          <span>Se detaljer</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};
