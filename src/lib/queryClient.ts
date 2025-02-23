import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 항상 최신 데이터 필요
      // refetchInterval: 1000, // 1초마다 자동 갱신
      retry: 1,
    },
  },
});
