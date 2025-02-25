import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { Timestamp } from 'firebase/firestore';
import type { ChoicePoll, ChoiceOption } from '../types/poll';
import { useProtectedUser } from '../hooks/useProtectedUser';
import { usePoll, useUpdatePoll } from '../hooks/usePolls';
import { Button, Input, Text, Textarea, VStack, HStack, Heading, Field, Separator } from '@chakra-ui/react';
import { Switch } from './ui/switch';

const EditPoll = ({ pollId }: { pollId: string }) => {
  const user = useProtectedUser();
  const navigate = useNavigate();
  const { data: poll, isLoading, error: loadError } = usePoll(pollId);
  const updatePollMutation = useUpdatePoll();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [extensionMinutes, setExtensionMinutes] = useState(0);
  const [showVoters, setShowVoters] = useState(false);
  const [allowOptionCreation, setAllowOptionCreation] = useState(false);
  const [allowMultipleSelection, setAllowMultipleSelection] = useState(false);
  const [minOptionsPerVote, setMinOptionsPerVote] = useState(1);
  const [maxOptionsPerVote, setMaxOptionsPerVote] = useState(1);
  const [targetVoterCount, setTargetVoterCount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (poll && poll.type === 'choice') {
      setTitle(poll.title);
      setDescription(poll.description || '');
      setOptions(poll.options.map(opt => opt.text));
      setShowVoters(poll.showVoters);
      setAllowOptionCreation(poll.allowOptionCreation);
      setAllowMultipleSelection(poll.maxOptionsPerVote > 1);
      setMinOptionsPerVote(poll.minOptionsPerVote);
      setMaxOptionsPerVote(poll.maxOptionsPerVote);
      setTargetVoterCount(poll.targetVoterCount || '');
    }
  }, [poll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const pollOptions: ChoiceOption[] = options
        .filter(opt => opt.trim())
        .map((text, index) => {
          const existingOption = poll?.options[index];
          return {
            id: existingOption?.id || nanoid(),
            type: 'choice',
            text: text.trim(),
            createdBy: existingOption?.createdBy || user.uid,
            createdAt: existingOption?.createdAt || Timestamp.now(),
          };
        });

      if (pollOptions.length < 2) {
        throw new Error('최소 2개의 옵션이 필요합니다.');
      }

      const updates: Partial<ChoicePoll> = {
        title,
        description: description || null,
        options: pollOptions,
        showVoters,
        allowOptionCreation,
        minOptionsPerVote: allowMultipleSelection ? minOptionsPerVote : 1,
        maxOptionsPerVote: allowMultipleSelection ? maxOptionsPerVote : 1,
        targetVoterCount: targetVoterCount || null,
      };

      if (extensionMinutes > 0) {
        const currentExpiryTime = poll!.expiresAt.toDate();
        updates.expiresAt = Timestamp.fromDate(
          new Date(currentExpiryTime.getTime() + extensionMinutes * 60 * 1000)
        );
      }

      await updatePollMutation.mutateAsync({ pollId, updates });
      navigate({ to: '/polls/$pollId', params: { pollId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '투표 수정 중 오류가 발생했습니다.');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => options.length > 2 && setOptions(options.filter((_, i) => i !== index));

  if (isLoading) {
    return <Text>로딩 중...</Text>;
  }

  if (loadError || !poll) {
    return <Text color="red.500">투표를 불러오는데 실패했습니다.</Text>;
  }

  if (poll.createdBy !== user.uid) {
    return <Text color="red.500">투표 수정 권한이 없습니다.</Text>;
  }

  return (
    <>
      <Heading as="h2" size="xl" mb={6} textAlign="center">투표 수정하기</Heading>
      {error && <Text color="red.500" mb={4}>{error}</Text>}

      <form onSubmit={handleSubmit}>
        <VStack gap={6}>
          <Field.Root>
            <Field.Label>제목</Field.Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="투표 제목을 입력하세요"/>
          </Field.Root>

          <Field.Root>
            <Field.Label>설명 (선택사항)</Field.Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="투표에 대한 설명을 입력하세요"/>
          </Field.Root>

          <Separator/>

          <Field.Root>
            <Field.Label>투표 옵션 (수정 불가)</Field.Label>
            <VStack gap={3} w="100%">
              {options.map((option, index) => (
                <HStack key={index} w="100%">
                  <Input 
                    value={option} 
                    onChange={(e) => handleOptionChange(index, e.target.value)} 
                    placeholder={`옵션 ${index + 1}`}
                    disabled
                  />
                  {options.length > 2 && (
                    <Button 
                      size="sm" 
                      colorScheme="red" 
                      variant="ghost" 
                      onClick={() => removeOption(index)}
                      disabled
                    >삭제</Button>
                  )}
                </HStack>
              ))}
              <Button 
                size="sm" 
                w="100%" 
                colorScheme="blue" 
                variant="surface" 
                onClick={addOption}
                disabled
              >+ 옵션 추가</Button>
              {poll && (
                <Text fontSize="sm" color="gray.500">
                  이미 투표가 시작된 설문의 옵션은 수정할 수 없습니다.
                </Text>
              )}
            </VStack>
          </Field.Root>

          <Separator />

          <Field.Root>
            <Field.Label>종료 시간 연장 (분)</Field.Label>
            <Input 
              type="number" 
              min="0" 
              value={extensionMinutes} 
              onChange={(e) => setExtensionMinutes(Number(e.target.value))}
              placeholder="연장할 시간을 분 단위로 입력하세요 (0 = 연장하지 않음)" 
            />
            {poll && (
              <Text fontSize="sm" color="gray.500" mt={1}>
                현재 종료 시간: {poll.expiresAt.toDate().toLocaleString()}
                {extensionMinutes > 0 && (
                  <><br />연장 후 종료 시간: {new Date(poll.expiresAt.toDate().getTime() + extensionMinutes * 60 * 1000).toLocaleString()}</>
                )}
              </Text>
            )}
          </Field.Root>

          <Separator />

          <VStack gap={3} w="100%">
            <HStack w="100%" justify="space-between">
              <Switch checked={showVoters} onChange={(e) => setShowVoters((e.target as HTMLInputElement).checked)}>투표자 공개</Switch>
            </HStack>
            <HStack w="100%" justify="space-between">
              <Switch checked={allowOptionCreation} onChange={(e) => setAllowOptionCreation((e.target as HTMLInputElement).checked)}>참여자 옵션 추가 허용</Switch>
            </HStack>
            <HStack w="100%" justify="space-between">
              <Switch checked={allowMultipleSelection} onChange={(e) => {
                  const isChecked = (e.target as HTMLInputElement).checked;
                  setAllowMultipleSelection(isChecked);
                  if (!isChecked) {
                    setMinOptionsPerVote(1);
                    setMaxOptionsPerVote(1);
                  }
              }}>다중 선택 허용</Switch>
            </HStack>

            {allowMultipleSelection && (
              <VStack gap={3} w="100%">
                <Field.Root>
                  <Field.Label>최소 선택 개수</Field.Label>
                  <Input type="number" min="1" value={minOptionsPerVote} onChange={(e) => setMinOptionsPerVote(Number(e.target.value))}/>
                </Field.Root>

                <Field.Root>
                  <Field.Label>최대 선택 개수</Field.Label>
                  <Input type="number" min={minOptionsPerVote} value={maxOptionsPerVote} onChange={(e) => setMaxOptionsPerVote(Number(e.target.value))}/>
                </Field.Root>
              </VStack>
            )}

            <Field.Root css={{ marginTop: '20px' }}>
              <Field.Label>목표 투표자 수 (선택사항)</Field.Label>
              <Input type="number" min="1" value={targetVoterCount} onChange={(e) => setTargetVoterCount(Number(e.target.value) || '')}/>
            </Field.Root>
          </VStack>

          <Button type="submit" colorScheme="blue" size="lg" w="100%" loading={updatePollMutation.isPending}>수정 완료</Button>
        </VStack>
      </form>
    </>
  );
};

export default EditPoll;
