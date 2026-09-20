import React from 'react';

export const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=250&q=80';

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_THUMBNAIL;
  }
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const isGitHubPages = typeof window !== 'undefined' && window.location.pathname.includes('/Open-Drama-Platform');
  const base = isGitHubPages ? '/Open-Drama-Platform/' : (import.meta.env.BASE_URL || '/');
  const clean = url.startsWith('/') ? url.slice(1) : url;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${clean}`;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_THUMBNAIL) {
    target.src = DEFAULT_THUMBNAIL;
  }
};
