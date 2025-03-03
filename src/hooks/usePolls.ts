import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPoll, getPolls, createPoll, addOption, vote, endPoll, updatePoll } from '../api/polls';
import type { ChoicePoll } from '../types/poll';
import { useInterval } from '@toss/react';

export function usePolls(interval?: number) { 
  return useQuery({
    queryKey: ['polls'],
    queryFn: getPolls,
    refetchInterval: interval
  });
}

export function usePoll(pollId: string, interval?: number) {
  return useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => getPoll(pollId),
    refetchInterval: interval
  });
}

export function useIntervalInvalidatePoll(pollId: string, interval: number | null = 5000) {
  const queryClient = useQueryClient();
  
  const invalidate = () => {
    return queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
  };

  useInterval(invalidate, { delay: interval });

  return { invalidate };
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pollData: Omit<ChoicePoll, 'id'>) => createPoll(pollData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    }
  });
}

export function useAddOption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pollId, optionText, userId }: { pollId: string; optionText: string; userId: string }) =>
      addOption(pollId, optionText, userId),
    onSuccess: (_, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    }
  });
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, userId, optionIds }: { pollId: string; userId: string; optionIds: string[] }) =>
      vote(pollId, optionIds, userId),
    onSuccess: (_, { pollId }) => {
      // 투표 후 해당 투표와 투표 목록을 갱신
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    },
  });
}

export function useEndPoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, buffer }: { pollId: string; buffer?: number}) => endPoll(pollId, buffer),
    onSuccess: (_, { pollId }) => {
      // 투표 종료 후 해당 투표와 투표 목록을 갱신
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    },
  });
}

export function useUpdatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, updates }: { pollId: string; updates: Partial<ChoicePoll> }) =>
      updatePoll(pollId, updates),
    onSuccess: (_, { pollId }) => {
      // 투표 수정 후 해당 투표와 투표 목록을 갱신
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
    },
  });
}
