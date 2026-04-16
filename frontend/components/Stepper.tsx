import React from "react";

interface StepperProps {
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, title: "Client Info", description: "Sender & Receiver" },
    { number: 2, title: "Items", description: "Search & Add items" },
    { number: 3, title: "Review", description: "Review & Print" },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              {/* Step */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-4 text-center">
                  <p
                    className={`text-sm font-bold ${isActive ? "text-indigo-600" : "text-slate-900"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 -mt-10 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: isCompleted ? "100%" : isActive ? "0%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
