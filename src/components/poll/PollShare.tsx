import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePoll } from '../../hooks/usePolls';
import { useCountdown } from '../../hooks/useCountdown';
import {
  VStack,
  Box,
  Heading,
  Text,
} from '@chakra-ui/react';
import { ClipboardButton, ClipboardRoot } from "@/components/ui/clipboard"


interface PollShareProps {
  pollId: string;
}

export default function PollShare({ pollId }: PollShareProps) {
  const { data: poll, isLoading } = usePoll(pollId);
  const [pollUrl, setPollUrl] = useState('');
  const remainingTime = useCountdown(poll?.expiresAt ?? null);

  useEffect(() => {
    // 현재 도메인 + /polls/:id 형태의 URL 생성
    const url = new URL(`/polls/${pollId}`, window.location.origin);
    setPollUrl(url.toString());
  }, [pollId]);

  if (isLoading || !poll) {
    return <div>로딩 중...</div>;
  }

  return (
    <VStack gap={8} align="stretch">
      <VStack gap={2}>
        <Heading size="xl">투표가 생성되었습니다!</Heading>
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

        <ClipboardRoot value="pollUrl" timeout={1000}>
          <ClipboardButton />
        </ClipboardRoot>
      </VStack>

      <VStack gap={4} p={6} borderRadius="lg">
        <Heading size="md">{poll.title} 투표</Heading>
        <Text fontWeight="bold" color={remainingTime.includes('곧 종료') ? 'red.500' : 'blue.600'} fontSize="3xl">
          {remainingTime}
        </Text>
      </VStack>
    </VStack>
  );
}
