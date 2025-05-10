
import { Property } from "../types/propertyTypes";
import { PropertyCard } from "./PropertyCard";

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
}

export const PropertyList = ({ properties, isLoading = false }: PropertyListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 border rounded-lg bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium">Ingen eiendommer</h3>
        <p className="text-muted-foreground mt-2">Du har ikke lagt til noen eiendommer ennå.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
