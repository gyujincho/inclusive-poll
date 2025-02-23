import type { ChoicePoll } from '../../types/poll';
import { VStack, HStack, Heading, Text, Button, Icon } from '@chakra-ui/react';
import { FaCheck } from "react-icons/fa6";
import { useIntervalInvalidatePoll } from '../../hooks/usePolls';


interface MyVoteProps {
  poll: ChoicePoll;
  userId: string;
  onRevote?: () => void;
}

const MyVote = ({ poll, userId, onRevote }: MyVoteProps) => {
  const myVote = poll.votes.find(vote => vote.userId === userId);

  useIntervalInvalidatePoll(poll.id, 800);

  return (
    <VStack gap={4} w="100%">
      <Heading as="h3" size="lg" mb={4} textAlign="center">내 투표</Heading>
      <VStack gap={2} w="100%">
        {poll.options.map(option => {
          const isSelected = myVote?.optionIds.includes(option.id);
          return (
            <HStack key={option.id} w="100%" justify="space-between" p={2} bg={isSelected ? 'blue.50' : 'transparent'} borderRadius="md">
              <Text>{option.text}</Text>
              {isSelected && <Icon as={FaCheck} color="blue.500" />}
            </HStack>
          );
        })}
      </VStack>
      
      <HStack w="100%" justify="space-between">
        <Text>투표 시간:</Text>
        <Text>{myVote?.createdAt.toDate().toLocaleString()}</Text>
      </HStack>

      <Button 
        colorScheme="blue" 
        variant="outline" 
        size="md" 
        w="100%" 
        onClick={onRevote}
      >
        다시 투표하기
      </Button>
    </VStack>
  );
};

export default MyVote;
