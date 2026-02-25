import { Badge } from './ui/badge';
import { Shield } from 'lucide-react';

export default function ReliabilityBadge({ label }) {
  const colors = {
    Low: 'bg-red-500 text-white border-red-600',
    Moderate: 'bg-yellow-500 text-white border-yellow-600',
    High: 'bg-green-500 text-white border-green-600'
  };

  return (
    <Badge className={`${colors[label] || colors.Moderate} font-medium px-2 py-0.5 text-xs flex items-center gap-1`}>
      <Shield className="w-3 h-3" />
      {label}
    </Badge>
  );
}
