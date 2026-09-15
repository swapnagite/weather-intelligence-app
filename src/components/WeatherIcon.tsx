import React from 'react';
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  CloudHail,
  Wind,
  Umbrella,
  Shirt,
  Compass,
  Sparkles,
  Thermometer,
  Eye,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-6 h-6', size }) => {
  const iconProps = { className, size };

  switch (name) {
    case 'Sun':
      return <Sun {...iconProps} />;
    case 'SunDim':
      return <SunDim {...iconProps} />;
    case 'CloudSun':
      return <CloudSun {...iconProps} />;
    case 'Cloud':
      return <Cloud {...iconProps} />;
    case 'CloudFog':
      return <CloudFog {...iconProps} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...iconProps} />;
    case 'CloudRain':
      return <CloudRain {...iconProps} />;
    case 'CloudRainWind':
      return <CloudRainWind {...iconProps} />;
    case 'CloudSnow':
      return <CloudSnow {...iconProps} />;
    case 'Snowflake':
      return <Snowflake {...iconProps} />;
    case 'CloudLightning':
      return <CloudLightning {...iconProps} />;
    case 'CloudHail':
      return <CloudHail {...iconProps} />;
    case 'Wind':
      return <Wind {...iconProps} />;
    case 'Umbrella':
      return <Umbrella {...iconProps} />;
    case 'Shirt':
      return <Shirt {...iconProps} />;
    case 'Compass':
      return <Compass {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    case 'Thermometer':
      return <Thermometer {...iconProps} />;
    case 'Eye':
      return <Eye {...iconProps} />;
    case 'Droplets':
      return <Droplets {...iconProps} />;
    case 'AlertTriangle':
      return <AlertTriangle {...iconProps} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...iconProps} />;
    case 'Info':
      return <Info {...iconProps} />;
    default:
      return <Cloud {...iconProps} />;
  }
};
