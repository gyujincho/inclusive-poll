import { useState } from 'react';
import type { ChoicePoll } from '../../types/poll';
import { useAddOption, useIntervalInvalidatePoll, useVote } from '../../hooks/usePolls';
import { VStack, HStack, Button, Heading, Text, Input } from '@chakra-ui/react';
import { VoteItem } from '../VoteItem';

interface VoteFormProps {
  poll: ChoicePoll;
  userId: string;
  onVoteComplete?: () => void;
}

const VoteForm = ({ poll, userId, onVoteComplete }: VoteFormProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const addOptionMutation = useAddOption();
  const voteMutation = useVote();

  useIntervalInvalidatePoll(poll.id, 800);

  const isSingleSelect = poll.minOptionsPerVote === 1 && poll.maxOptionsPerVote === 1;

  const handleVote = (optionId: string) => {
    const isSelected = selectedOptions.includes(optionId);

    if (isSingleSelect) {
      // 단일 선택 모드에서는 이전 선택을 해제하고 새로운 선택만 유지
      setSelectedOptions([optionId]);
    } else {
      // 다중 선택 모드
      if (isSelected) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else if (selectedOptions.length < (poll.maxOptionsPerVote ?? 1)) {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await voteMutation.mutateAsync({
        pollId: poll.id,
        userId,
        optionIds: selectedOptions
      });
      setSelectedOptions([]); // 선택 초기화
      onVoteComplete?.(); // 투표 완료 후 콜백 호출
    } catch (error) {
      console.error('투표 중 오류 발생:', error);
    }
  };

  const handleAddOption = async () => {
    if (!newOption.trim()) return;

    await addOptionMutation.mutateAsync({
      pollId: poll.id,
      optionText: newOption.trim(),
      userId,
    });

    setNewOption('');
  };

  return (
    <VStack gap={4} w="100%">
      <Heading as="h3" size="xl" mb={6} textAlign="center">투표하기</Heading>
      <VStack gap={4} w="100%">
        {poll.options.map(option => (
          <VoteItem
            key={option.id}
            choice={{ name: option.text }}
            selected={selectedOptions.includes(option.id)}
            onVote={() => handleVote(option.id)}
          />
        ))}
      </VStack>

      {poll.allowOptionCreation && (
        <HStack w="100%" justify="space-between">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="새 옵션 추가"
          />
          <Button
            variant="outline"
            onClick={handleAddOption}
            disabled={addOptionMutation.isPending || !newOption.trim()}
          >
            옵션 추가
          </Button>
        </HStack>
      )}

      <VStack gap={2} w="100%">
        <Text>
          {poll.minOptionsPerVote === poll.maxOptionsPerVote
            ? `${poll.minOptionsPerVote}개 선택`
            : `${poll.minOptionsPerVote}~${poll.maxOptionsPerVote}개 선택`}
        </Text>
        <Text>
          현재 선택: {selectedOptions.length}개
          {poll.minOptionsPerVote === poll.maxOptionsPerVote 
            ? ` / ${poll.minOptionsPerVote}개`
            : ` (${poll.minOptionsPerVote}~${poll.maxOptionsPerVote}개)`}
        </Text>
      </VStack>

      <Button
        colorScheme="blue"
        w="100%"
        size="lg"
        onClick={handleSubmit}
        disabled={
          selectedOptions.length === 0 ||
          !(selectedOptions.length >= poll.minOptionsPerVote && selectedOptions.length <= poll.maxOptionsPerVote)
        }
        loading={voteMutation.isPending}
      > 
        {voteMutation.isPending ? '투표 중...' : '투표하기'}
      </Button>
    </VStack>
  );
};

export default VoteForm;
