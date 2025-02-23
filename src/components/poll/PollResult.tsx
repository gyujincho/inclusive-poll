import type { ChoicePoll } from '../../types/poll';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  
  Badge,
} from '@chakra-ui/react';
import { Tooltip } from '../ui/tooltip';
import { Progress } from '../ui/progress';

interface PollResultProps {
  poll: ChoicePoll;
}

const PollResult = ({ poll }: PollResultProps) => {
  // 가장 많은 표를 받은 옵션 찾기
  const maxVotes = Math.max(
    ...poll.options.map(option =>
      poll.votes.filter(vote => vote.optionIds.includes(option.id)).length
    )
  );

  return (
    <VStack gap={6} align="stretch" w="100%">
      <Heading as="h2" size="xl" textAlign="center">투표 결과</Heading>
      
      <VStack gap={4} align="stretch">
        {poll.options.map(option => {
          const voteCount = poll.votes.filter(vote => 
            vote.optionIds.includes(option.id)
          ).length;
          const percentage = poll.votes.length > 0 
            ? Math.round((voteCount / poll.votes.length) * 100) 
            : 0;
          const isWinning = voteCount === maxVotes && voteCount > 0;

          return (
            <Box
              key={option.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={isWinning ? "green.200" : "gray.200"}
              bg={isWinning ? "green.50" : "white"}
              transition="all 0.2s"
              _hover={{ shadow: "md" }}
            >
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">
                    {option.text}
                    {isWinning && (
                      <Badge ml={2} colorScheme="green">
                        최다 득표
                      </Badge>
                    )}
                  </Text>
                  <Text fontWeight="bold" color={isWinning ? "green.500" : "gray.600"}>
                    {voteCount}표
                  </Text>
                </HStack>

                <Tooltip content={`${percentage}%`}>
                  <Progress
                    value={percentage}
                    colorScheme={isWinning ? "green" : "blue"}
                    size="lg"
                    borderRadius="full"
                    bg="gray.100"
                  />
                </Tooltip>

                <HStack justify="space-between" color="gray.600">
                  <Text fontSize="sm">{percentage}%</Text>
                  {poll.showVoters && (
                    <Text fontSize="sm" maxLines={1}>
                      투표자: {poll.votes
                        .filter(vote => vote.optionIds.includes(option.id))
                        .map(vote => vote.userId)
                        .join(', ')}
                    </Text>
                  )}
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </VStack>

      <Box
        mt={4}
        p={4}
        borderRadius="lg"
        bg="gray.50"
        textAlign="center"
      >
        <Text fontSize="lg" fontWeight="bold">
          총 투표수: {poll.votes.length}
          {poll.targetVoterCount && (
            <Text as="span" color="gray.600">
              {' '}/ 목표: {poll.targetVoterCount}
            </Text>
          )}
        </Text>
        {poll.targetVoterCount && (
          <Progress
            mt={2}
            value={(poll.votes.length / poll.targetVoterCount) * 100}
            colorScheme="blue"
            size="sm"
            borderRadius="full"
          />
        )}
      </Box>
    </VStack>
  );
};

export default PollResult;
