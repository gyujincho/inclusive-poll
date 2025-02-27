import { QRCodeSVG } from 'qrcode.react';
import { usePoll } from '../../hooks/usePolls';
import { useCountdown } from '../../hooks/useCountdown';
import { Link } from '@tanstack/react-router';
import {
  VStack,
  Box,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';
import { ClipboardButton, ClipboardRoot } from "@/components/ui/clipboard"


interface PollShareProps {
  pollId: string;
}

export default function PollShare({ pollId }: PollShareProps) {
  const { data: poll, isLoading } = usePoll(pollId, 1000);
  const remainingTime = useCountdown(poll?.expiresAt ?? null);
  const isExpired = remainingTime === '투표가 종료되었습니다';

  const pollUrl = (new URL(`/polls/${pollId}`, window.location.origin)).toString();

  if (isLoading || !poll) {
    return <div>로딩 중...</div>;
  }

  if (isExpired) {
    return (
      <VStack gap={8} align="stretch">
        <VStack gap={2}>
          <Heading size="xl">{poll.title} 투표가 종료되었습니다</Heading>
          <Text color="gray.600">투표 결과를 확인해보세요</Text>
          <Button
            asChild
            variant="outline"
          >
            <Link to={`/polls/${pollId}`}>투표 결과 보기</Link>
          </Button>
        </VStack>

        <VStack gap={4} p={6} borderRadius="lg">
          <Box
            p={8}
            borderWidth="1px"
            borderRadius="xl"
            borderColor="gray.200"
            bg="white"
            shadow="md"
          >
            <QRCodeSVG
              value={pollUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </Box>
        </VStack>       
      </VStack>
    );
  }

  return (
    <VStack gap={8} align="stretch">
      <VStack gap={2}>
        <Heading size="md">{poll.title} 투표가 시작되었습니다</Heading>
        <Text fontWeight="bold" color={remainingTime.includes('곧 종료') ? 'red.500' : 'green.600'} fontSize="3xl">
          {remainingTime}
        </Text>

        <Text color="gray.600">아래 QR 코드나 링크를 공유하여 투표를 시작하세요</Text>
      </VStack>

      <VStack gap={6}>
        <Box
          p={8}
          borderWidth="1px"
          borderRadius="xl"
          borderColor="gray.200"
          bg="white"
          shadow="md"
        >
          <QRCodeSVG
            value={pollUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </Box>

        <ClipboardRoot value={pollUrl} timeout={1000}>
          <ClipboardButton />
        </ClipboardRoot>
      </VStack>

      <VStack gap={4} p={6} borderRadius="lg">
        <Button
          asChild
          variant="outline"
        >
          <Link to={`/polls/${pollId}`}>투표 상세페이지로 이동</Link>
        </Button>
      </VStack>
    </VStack>
  );
}
