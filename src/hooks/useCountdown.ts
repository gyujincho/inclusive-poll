import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';

export function useCountdown(expiresAt: Timestamp | null) {
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const updateRemainingTime = () => {
      const now = new Date();
      const endTime = expiresAt.toDate();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setRemainingTime('투표가 종료되었습니다');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const isNearEnd = diff <= 30000; // 30초 이하 남음

      setRemainingTime(
        `${days > 0 ? `${days}일 ` : ''}${hours}시간 ${minutes}분 ${seconds}초 남음${isNearEnd ? ' (곧 종료)' : ''}`
      );
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return remainingTime;
}
