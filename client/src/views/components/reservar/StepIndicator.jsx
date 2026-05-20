const STEPS = [
  { number: 1, label: 'Seleccionar fechas' },
  { number: 2, label: 'Datos personales'  },
  { number: 3, label: 'Pago'              },
  { number: 4, label: 'Confirmación'      },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between">
        {STEPS.map(({ number, label }, index) => {
          const isActive    = number === currentStep;
          const isCompleted = number < currentStep;
          const isLast      = index === STEPS.length - 1;

          return (
            <div key={number} className="flex items-center flex-1 last:flex-none">
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1e3a6e] text-white shadow-md'
                      : isCompleted
                      ? 'bg-[#1e3a6e] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    number
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? 'text-[#1e3a6e]' : isCompleted ? 'text-[#1e3a6e]' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-3 mb-5">
                  <div className="h-0.5 w-full bg-gray-200 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#1e3a6e] transition-all duration-500"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar below */}
      <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1e3a6e] rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
