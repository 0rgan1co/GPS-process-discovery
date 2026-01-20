
import React, { useState, useEffect, useRef } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  targetId?: string;
  position: 'center' | 'left' | 'right' | 'top' | 'bottom';
  icon: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: "Bienvenido a GPS Discovery",
    description: "La plataforma de Process Mining impulsada por IA diseñada para transformar el flujo de tu negocio en una ventaja competitiva.",
    position: 'center',
    icon: "🚀"
  },
  {
    title: "Selección de Datos",
    description: "Aquí puedes alternar entre nuestros Datasets de demostración o cargar tu propio archivo CSV con la estructura Case ID, Activity y Timestamp.",
    targetId: "tour-data-selector",
    position: 'right',
    icon: "📊"
  },
  {
    title: "Smart Context",
    description: "Comparte el contexto estratégico de tu negocio con nuestra IA. Cuanto mejor sea el contexto, más profundos serán los hallazgos del motor ejecutivo.",
    targetId: "tour-smart-context",
    position: 'right',
    icon: "🧠"
  },
  {
    title: "Mapa de Flujo Dinámico",
    description: "Visualiza el recorrido real de tus procesos. Los grosores indican volumen y los tokens animados representan el flujo de trabajo en tiempo real.",
    targetId: "tour-flow-map",
    position: 'top', // Movido a top para despejar el centro del gráfico
    icon: "🗺️"
  },
  {
    title: "Análisis Multicapa",
    description: "Navega entre el mapa visual, las estadísticas detalladas del proceso y la gestión de colaboradores para un análisis integral.",
    targetId: "tour-tabs",
    position: 'bottom',
    icon: "⚡"
  },
  {
    title: "Generación de Reportes",
    description: "Utiliza nuestro motor de reportes IA para generar Decks ejecutivos en PDF. Ideal para presentar diagnósticos y proyecciones de ROI a gerencia.",
    targetId: "tour-tools",
    position: 'left',
    icon: "💎"
  }
];

interface Props {
  onClose: () => void;
}

const Onboarding: React.FC<Props> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});

  const step = STEPS[currentStep];

  useEffect(() => {
    const updatePosition = () => {
      const el = step.targetId ? document.getElementById(step.targetId) : null;
      const rect = el ? el.getBoundingClientRect() : null;
      setTargetRect(rect);

      const newStyle: React.CSSProperties = {
        position: 'absolute',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 520,
      };

      const cardWidth = 420;
      const cardHeight = 280; // Altura estimada reducida

      if (!rect || step.position === 'center') {
        newStyle.top = '50%';
        newStyle.left = '50%';
        newStyle.transform = 'translate(-50%, -50%) scale(1.1)';
      } else {
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + 24;
            left = rect.left + rect.width / 2 - cardWidth / 2;
            if (top + cardHeight > window.innerHeight) {
              top = rect.top - cardHeight - 24;
            }
            break;
          case 'top':
            // Para el mapa de flujo, queremos que esté lo más arriba posible sin tapar las pestañas
            top = rect.top + 40; 
            left = rect.left + rect.width / 2 - cardWidth / 2;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - cardHeight / 2;
            left = rect.right + 24;
            if (left + cardWidth > window.innerWidth) {
              left = rect.left - cardWidth - 24;
            }
            break;
          case 'left':
            top = rect.top + rect.height / 2 - cardHeight / 2;
            left = rect.left - cardWidth - 24;
            break;
        }

        // Clampar a los bordes de la pantalla con padding de seguridad
        newStyle.top = Math.max(80, Math.min(top, window.innerHeight - cardHeight - 40));
        newStyle.left = Math.max(40, Math.min(left, window.innerWidth - cardWidth - 40));
        newStyle.transform = 'none';
      }

      setCardStyle(newStyle);
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 100); // Pequeño delay para asegurar que el DOM esté listo
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timer);
    };
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-all duration-500"
        onClick={onClose}
      />
      
      {/* Spotlight */}
      {targetRect && (
        <div 
          className="absolute border-2 border-[#5c56f1] rounded-[32px] shadow-[0_0_0_9999px_rgba(15,23,42,0.5)] transition-all duration-500 pointer-events-none z-[510]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
        />
      )}

      {/* Tarjeta de Onboarding */}
      <div 
        ref={cardRef}
        className="bg-white w-full max-w-[420px] rounded-[40px] p-8 shadow-2xl border border-slate-200"
        style={cardStyle}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              {step.icon}
            </div>
            <button 
              onClick={onClose}
              className="text-[9px] font-black text-slate-300 hover:text-slate-900 uppercase tracking-widest transition"
            >
              Saltar Guía
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-tight">
              {step.title}
            </h3>
            <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex flex-col gap-5 pt-1">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentStep ? 'w-6 bg-[#5c56f1]' : 'w-1.5 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="flex-1 py-3.5 bg-slate-100 rounded-xl font-black text-[9px] text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition"
                >
                  Atrás
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex-[2] py-3.5 bg-[#5c56f1] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-[#4f46e5] active:scale-95 transition-all"
              >
                {currentStep === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
