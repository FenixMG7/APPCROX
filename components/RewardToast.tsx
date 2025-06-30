import React from 'react';

interface RewardToastProps {
  reward: { amount: number } | null;
}

const RewardToast: React.FC<RewardToastProps> = ({ reward }) => {
  if (!reward) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-[100]">
      <div className="reward-toast-animation text-8xl md:text-9xl font-bold text-amber-400" style={{ textShadow: '0 0 25px #f59e0b, 0 0 10px #f97316' }}>
        +{reward.amount} €
      </div>
      <style>{`
        @keyframes reward-toast-keyframes {
          0% { transform: scale(0.5) translateY(50px); opacity: 0; }
          30% { transform: scale(1.2) translateY(0); opacity: 1; }
          80% { transform: scale(1.1) translateY(0); opacity: 1; }
          100% { transform: scale(1.5) translateY(-20px); opacity: 0; }
        }
        .reward-toast-animation {
          animation: reward-toast-keyframes 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RewardToast;
