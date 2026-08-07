import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils'; // Assuming cn exists, else fallback to template literal

interface BannerSectionProps {
  imageUrl: string;
  title?: ReactNode;
  description?: ReactNode;
  heightClass?: string;
  overlay?: boolean;
  priority?: boolean;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function BannerSection({
  imageUrl,
  title,
  description,
  heightClass = 'min-h-[320px] md:min-h-[400px] lg:min-h-[480px]',
  overlay = true,
  priority = false,
  children,
  className,
  contentClassName,
}: BannerSectionProps) {
  return (
    <div 
      className={cn(
        "relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-md group mb-8 md:mb-12",
        heightClass,
        className
      )}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={typeof title === 'string' ? title : "Banner image"}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none" />
      )}

      {/* Content Container */}
      <div className={cn("absolute inset-0 p-6 md:p-12 flex flex-col justify-center", contentClassName)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl w-full"
        >
          {title && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md">
              {title}
            </h2>
          )}
          
          {description && (
            <div className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-sm font-medium">
              {description}
            </div>
          )}

          {children}
        </motion.div>
      </div>
    </div>
  );
}
