"use client";

import React from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

// Define the props for the Icon component
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

/**
 * Global Icon component that uses Phosphor Icons
 * 
 * Usage:
 * <Icon name="House" size={24} weight="fill" />
 * <Icon name="FileText" size={20} />
 * <Icon name="Bell" weight="duotone" />
 */
const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color, 
  weight = 'regular',
  className = '' 
}) => {
  // Get the icon component from Phosphor Icons
  const IconComponent = PhosphorIcons[name as keyof typeof PhosphorIcons];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Phosphor Icons`);
    return null;
  }

  return (
    <IconComponent 
      size={size} 
      color={color} 
      weight={weight} 
      className={className} 
    />
  );
};

export default Icon;
