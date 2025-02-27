import { Link } from '@tanstack/react-router';
import { usePolls } from '../hooks/usePolls';
import { isPollEnded } from '../utils/pollUtils';
import { VStack, Button, Heading, Text, Box, Badge, HStack, Spacer, IconButton, Separator } from '@chakra-ui/react';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Poll } from '../types/poll';

const PollList = () => {
  const { data: polls, isLoading, error } = usePolls(3000);
  const [showOlderPolls, setShowOlderPolls] = useState(false);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>투표 목록을 불러오는데 실패했습니다.</div>;
  }

  if (!polls) {
    return <div>투표가 없습니다.</div>;
  }

  const currentTime = new Date('2025-02-27T10:08:20+09:00');
  const tenMinutesAgo = new Date(currentTime.getTime() - 10 * 60 * 1000);

  const activePolls = polls.filter(poll => !isPollEnded(poll));
  const recentlyEndedPolls = polls.filter(poll => 
    isPollEnded(poll) && 
    poll.expiresAt && 
    poll.expiresAt.toDate() >= tenMinutesAgo
  );
  const olderEndedPolls = polls.filter(poll => 
    isPollEnded(poll) && 
    poll.expiresAt && 
    poll.expiresAt.toDate() < tenMinutesAgo
  );

  const PollBox = ({ poll }: { poll: Poll  }) => {
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
          p={8}
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
          <VStack align="flex-start" gap={5}>
            <HStack width="100%">
              <Badge colorScheme={isEnded ? 'gray' : 'green'} fontSize="sm" px={2} py={1}>
                {isEnded ? '종료됨' : '진행중'}
              </Badge>
              <Spacer />
              <Text fontSize="sm" color={isEnded ? 'gray.500' : 'gray.600'}>
                {!isEnded && poll.expiresAt && (
                  '마감: ' + poll.expiresAt.toDate().toLocaleString()
                )}
              </Text>
            </HStack>

            <Box width="100%">
              <Heading 
                size="xl" 
                mb={3}
                color={isEnded ? 'gray.700' : 'black'} 
                fontWeight={700}
                lineHeight="1.4"
                textAlign="left"
              >
                {poll.title}
              </Heading>
              {poll.description && (
                <Text 
                  color={isEnded ? 'gray.500' : 'gray.600'} 
                  maxLines={2} 
                  fontSize="md"
                  lineHeight="1.6"
                  textAlign="left"
                >
                  {poll.description}
                </Text>
              )}
            </Box>

            <HStack width="100%" gap={6}>
              <Text fontSize="md" color={isEnded ? 'gray.500' : 'gray.600'} fontWeight="medium">
                선택지 {poll.options.length}개
              </Text>
              <Text fontSize="md" color={isEnded ? 'gray.500' : 'gray.600'} fontWeight="medium">
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
  };

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="stretch" gap={2}>
        <Heading size="lg">투표 현황</Heading>
        <Text color="gray.600">
          진행중인 투표 {activePolls.length}개 / 종료된 투표 {recentlyEndedPolls.length + olderEndedPolls.length}개
        </Text>
      </VStack>

      <Link to="/polls/new">
        <Button colorScheme="blue" size="md" w="100%" mb={4}>새 투표 만들기</Button>
      </Link>

      {activePolls.length > 0 && (
        <VStack gap={4} width="100%">
          <Heading size="md" alignSelf="flex-start">진행중인 투표</Heading>
          <VStack gap="20px" width="100%">
            {activePolls.map((poll) => (
              <PollBox key={poll.id} poll={poll} />
            ))}
          </VStack>
        </VStack>
      )}

      {recentlyEndedPolls.length > 0 && (
        <>
          <Separator />
          <VStack gap={4} width="100%">
            <Heading size="md" alignSelf="flex-start">최근 종료된 투표</Heading>
            <VStack gap="20px" width="100%">
              {recentlyEndedPolls.map((poll) => (
                <PollBox key={poll.id} poll={poll} />
              ))}
            </VStack>
          </VStack>
        </>
      )}

      {olderEndedPolls.length > 0 && (
        <>
          <Separator />
          <VStack gap={4} width="100%">
            <HStack width="100%">
              <Heading size="md">이전 종료된 투표</Heading>
              <IconButton
                aria-label={showOlderPolls ? "접기" : "펼치기"}
                variant="ghost"
                onClick={() => setShowOlderPolls(!showOlderPolls)}
              >
                {showOlderPolls ? <FaChevronUp /> : <FaChevronDown />}
              </IconButton>
            </HStack>
            {showOlderPolls && (
              <VStack gap="20px" width="100%">
                {olderEndedPolls.map((poll) => (
                  <PollBox key={poll.id} poll={poll} />
                ))}
              </VStack>
            )}
          </VStack>
        </>
      )}
    </VStack>
  );
};

export default PollList;
