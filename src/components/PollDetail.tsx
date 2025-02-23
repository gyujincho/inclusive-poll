import { useProtectedUser } from '../hooks/useProtectedUser';
import { isPollEnded } from '../utils/pollUtils';
import { usePoll, useEndPoll } from '../hooks/usePolls';
import PollResult from './poll/PollResult';
import MyVote from './poll/MyVote';
import VoteForm from './poll/VoteForm';
import { VStack, Heading, Text, Separator, Button } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

const PollDetail = ({ pollId }: { pollId: string }) => {
  const user = useProtectedUser();
  const { data: poll, isLoading, error } = usePoll(pollId);
  const endPollMutation = useEndPoll();
  const [isRevoting, setIsRevoting] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>('');

  useEffect(() => {
    if (!poll?.expiresAt) return;

    const updateRemainingTime = () => {
      const now = new Date();
      const endTime = poll.expiresAt.toDate();
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
  }, [poll?.expiresAt]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error || !poll) {
    return <div>투표를 불러오는데 실패했습니다.</div>;
  }

  if (poll.type !== 'choice') {
    return <div>선택형 투표만 찾을 수 있습니다.</div>;
  }

  const hasVoted = poll.votes.some(vote => vote.userId === user.uid);
  const ended = isPollEnded(poll);
  const isCreator = poll.createdBy === user.uid; // Check if the user is the creator

  const handleEndPoll = async () => {
    try {
      const confirmed = window.confirm(
        '정말 투표를 30초 후에 종료하시겠어요?'
      )
      if (!confirmed) {
        return;
      }
      await endPollMutation.mutateAsync({
        pollId,
        buffer: 30
      });
    } catch (error) {
      console.error('투표 종료 중 오류 발생:', error);
    }
  };

  return (
    <VStack gap={4} w="100%">
      <Heading as="h2" size="xl" mb={6} textAlign="center">{poll.title}</Heading>
      {poll.description && <Text>{poll.description}</Text>}

      <VStack w="100%" justifyContent="center">
        <Text>참여자 수: {poll.votes.length}명 {poll.targetVoterCount && ` / ${poll.targetVoterCount}명`}</Text>
        {poll.targetVoterCount && (
          <Text>참여율: {`${Math.round((poll.votes.length / poll.targetVoterCount) * 100)}%`}</Text>
        )}
        {!ended && poll.expiresAt && (
          <Text 
            color={
              remainingTime.includes('종료되었습니다') 
                ? 'gray.500' 
                : remainingTime.includes('곧 종료') 
                  ? 'red.500' 
                  : 'gray.500'
            } 
            fontWeight="bold"
            fontSize='3xl'
          >
            {remainingTime}
          </Text>
        )}
        {!ended && isCreator && poll.expiresAt && !remainingTime.includes('곧 종료') && (
          <Button colorPalette="red" size="sm" onClick={handleEndPoll}>투표 30초 후에 종료하기</Button>
        )}
      </VStack>

      <Separator w="100%" css={{ margin: '24px 0' }}/>

      {ended ? (
        <PollResult poll={poll} />
      ) : isRevoting || !hasVoted ? (
        <VoteForm 
          poll={poll} 
          userId={user.uid} 
          onVoteComplete={() => setIsRevoting(false)}
        />
      ) : (
        <MyVote 
          poll={poll} 
          userId={user.uid} 
          onRevote={() => setIsRevoting(true)} 
        />
      )}

      
    </VStack>
  );
};

export default PollDetail;