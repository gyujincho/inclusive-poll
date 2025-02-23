import { useAuth } from '../contexts/auth';
import type { User } from 'firebase/auth';

/**
 * Protected 라우트에서만 사용되는 훅으로, 로그인된 user가 보장됩니다.
 * 라우트 보호로 인해 user가 null이 될 수 없기 때문에 non-null assertion을 안전하게 사용할 수 있습니다.
 */
export function useProtectedUser(): User {
  const { user } = useAuth();
  return user!;
}
