import { Loader2Icon } from 'lucide-react';

interface LoadingIndicatorProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingIndicator({ 
  text = 'Cargando más noticias...', 
  size = 'md',
  className = '' 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className="flex items-center gap-3">
        <Loader2Icon className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        <span className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </span>
      </div>
      <div className="flex gap-1 mt-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Componente de loading en línea para cuando se está cargando dentro de una lista
export function InlineLoadingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando...</span>
      </div>
    </div>
  );
}

// Componente para mostrar cuando no hay más contenido
export function EndOfListIndicator({ 
  text = '🎉 Has visto todas las noticias disponibles',
  className = '' 
}: { 
  text?: string; 
  className?: string; 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <div className="text-2xl mb-2">📰</div>
        <p className="text-gray-600 font-medium mb-1">{text}</p>
        <p className="text-sm text-gray-500">Vuelve más tarde para ver nuevas noticias</p>
      </div>
      <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
  );
}
