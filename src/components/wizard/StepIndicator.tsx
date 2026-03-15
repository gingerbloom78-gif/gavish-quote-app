import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  steps: string[]
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {steps.map((label, index) => {
        const stepNum = index + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                        ? 'bg-accent text-white shadow-lg shadow-accent/30'
                        : 'bg-gray-200 text-gray-400'
                  }`}
              >
                {isCompleted ? <Check size={18} /> : stepNum}
              </div>
              <span
                className={`text-[0.6rem] mt-1.5 font-medium
                  ${isActive ? 'text-accent' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 mb-5 rounded-full
                  ${stepNum < currentStep ? 'bg-emerald-400' : 'bg-gray-200'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
