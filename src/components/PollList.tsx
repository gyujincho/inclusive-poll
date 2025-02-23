import { Link } from '@tanstack/react-router';
import { usePolls } from '../hooks/usePolls';
import { isPollEnded } from '../utils/pollUtils';
import { VStack, Button, Heading, Text, Box, Badge, HStack, Spacer } from '@chakra-ui/react';

const PollList = () => {
  const { data: polls, isLoading, error } = usePolls();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>투표 목록을 불러오는데 실패했습니다.</div>;
  }

  if (!polls) {
    return <div>투표가 없습니다.</div>;
  }

  const activePollCount = polls.filter(poll => !isPollEnded(poll)).length;
  const endedPollCount = polls.length - activePollCount;

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="stretch" gap={2}>
        <Heading size="lg">투표 현황</Heading>
        <Text color="gray.600">
          진행중인 투표 {activePollCount}개 / 종료된 투표 {endedPollCount}개
        </Text>
      </VStack>

      <Link to="/polls/new">
        <Button colorScheme="blue" size="md" w="100%" mb={4}>새 투표 만들기</Button>
      </Link>

      <VStack gap="20px" width="100%">
        {polls.map((poll) => {
          const isEnded = isPollEnded(poll);
          const totalVotes = poll.votes.length;
          const progress = poll.targetVoterCount 
            ? Math.round((totalVotes / poll.targetVoterCount) * 100)
            : null;

          return (
            <Link
              key={poll.id}
              to="/polls/$pollId"
              params={{ pollId: poll.id }}
              style={{ textDecoration: 'none', width: '100%' }}
            >
              <Box
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  borderColor: isEnded ? 'gray.200' : 'blue.200'
                }}
                transition="all 0.2s"
                bg={isEnded ? 'gray.50' : 'white'}
                width="100%"
                opacity={isEnded ? 0.8 : 1}
              >
                <VStack align="stretch" gap={4}>
                  <HStack>
                    <Badge colorPalette={isEnded ? 'gray' : 'green'} fontSize="sm">
                      {isEnded ? '종료됨' : '진행중'}
                    </Badge>
                    <Spacer />
                    <Text fontSize="sm" color={isEnded ? 'gray.500' : 'gray.600'}>
                      {!isEnded && poll.expiresAt && (
                        '마감: ' + poll.expiresAt.toDate().toLocaleString()
                      )}
                    </Text>
                  </HStack>

                  <Box>
                    <Heading size="md" mb={2} color={isEnded ? 'gray.600' : 'black'}>{poll.title}</Heading>
                    {poll.description && (
                      <Text color={isEnded ? 'gray.500' : 'gray.600'} maxLines={2}>{poll.description}</Text>
                    )}
                  </Box>

                  <HStack gap={6}>
                    <Text fontSize="sm" color={isEnded ? 'gray.500' : 'gray.600'}>
                      선택지 {poll.options.length}개
                    </Text>
                    <Text fontSize="sm" color={isEnded ? 'gray.500' : 'gray.600'}>
                      참여 {totalVotes}명
                      {poll.targetVoterCount && (
                        <> / {poll.targetVoterCount}명 ({progress}%)</>
                      )}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </Link>
          );
        })}
      </VStack>
    </VStack>
  );
};

export default PollList;
