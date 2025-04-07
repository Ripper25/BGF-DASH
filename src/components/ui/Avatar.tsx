'use client';

import React, { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import Image from 'next/image';

interface AvatarProps {
  url?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  url,
  size = 'md',
  className = '',
  alt = 'User avatar'
}) => {
  const [imageError, setImageError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageError(false);
    setAvatarUrl(url || null);
  }, [url]);

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 48,
    xl: 64
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center bg-bgf-burgundy text-cream ${sizeClasses[size]} ${className}`}>
      {avatarUrl && !imageError ? (
        <Image
          src={avatarUrl}
          alt={alt}
          width={size === 'xl' ? 128 : size === 'lg' ? 96 : size === 'md' ? 48 : 32}
          height={size === 'xl' ? 128 : size === 'lg' ? 96 : size === 'md' ? 48 : 32}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <FiUser size={iconSizes[size]} />
      )}
    </div>
  );
};

export default Avatar;
