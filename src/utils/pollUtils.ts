import { 
  Poll, 
  PollResult, 
  ChoiceVote, 
  ScoreVote, 
  Vote, 
  ScorePoll, 
  ChoicePoll 
} from '../types/poll';
import { Timestamp } from 'firebase/firestore';

export function calculateResults(poll: Poll): PollResult {
  const baseResult = {
    totalParticipants: new Set(poll.votes.map(v => v.userId)).size,
    participationRate: poll.targetVoterCount
      ? (poll.votes.length / poll.targetVoterCount) * 100
      : null,
  };

  if (poll.type === 'choice') {
    return {
      ...baseResult,
      type: 'choice',
      options: poll.options.map(option => ({
        type: 'choice',
        option,
        voters: poll.showVoters
          ? poll.votes
              .filter(v => v.type === 'choice' && v.optionIds.includes(option.id))
              .map(v => v.userId)
          : [],
        voteCount: poll.votes.filter(
          v => v.type === 'choice' && v.optionIds.includes(option.id)
        ).length
      }))
    };
  } else {
    const optionResults = poll.options.map(option => {
      const optionVotes = poll.votes
        .filter(v => v.type === 'score')
        .map(v => v.scores.find(s => s.optionId === option.id)?.score)
        .filter((score): score is number => score !== undefined);

      const distribution = optionVotes.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
      }, {} as { [score: number]: number });

      return {
        type: 'score' as const,
        option,
        voters: poll.showVoters
          ? poll.votes
              .filter(v => v.type === 'score' && 
                v.scores.some(s => s.optionId === option.id))
              .map(v => v.userId)
          : [],
        averageScore: optionVotes.length > 0
          ? optionVotes.reduce((a, b) => a + b, 0) / optionVotes.length
          : 0,
        scoreDistribution: distribution,
        totalVotes: optionVotes.length
      };
    });

    return {
      ...baseResult,
      type: 'score',
      options: optionResults,
      averageTotal: optionResults.reduce((sum, opt) => sum + opt.averageScore, 0) / 
                   optionResults.length
    };
  }
}

export function isPollEnded(poll: Poll): boolean {
  return Timestamp.now().seconds >= poll.expiresAt.seconds;
}

export function canUserVote(poll: Poll, userId: string): boolean {
  if (isPollEnded(poll)) return false;
  
  // 이미 투표했는지 확인
  const hasVoted = poll.votes.some(v => v.userId === userId);
  return !hasVoted;
}

export function validateVote(poll: Poll, vote: Vote): boolean {
  if (isPollEnded(poll)) return false;
  
  if (poll.type === 'choice' && vote.type === 'choice') {
    return validateChoiceVote(poll, vote);
  }
  
  if (poll.type === 'score' && vote.type === 'score') {
    return validateScoreVote(poll, vote);
  }

  return false;
}

function validateChoiceVote(poll: ChoicePoll, vote: ChoiceVote): boolean {
  // 선택한 옵션이 없으면 실패
  if (vote.optionIds.length === 0) return false;

  // 최대 선택 가능 옵션 수 체크
  if (poll.maxOptionsPerVote && vote.optionIds.length > poll.maxOptionsPerVote) return false;

  // 모든 선택한 옵션이 실제 존재하는지 체크
  return vote.optionIds.every(
    id => poll.options.some(opt => opt.id === id)
  );
}

function validateScoreVote(poll: ScorePoll, vote: ScoreVote): boolean {
  // 모든 옵션에 대한 응답이 필요한 경우
  if (poll.requireAllOptions && vote.scores.length !== poll.options.length) return false;

  // 중복 점수 체크
  if (!poll.allowSameScores) {
    const scores = vote.scores.map(s => s.score);
    if (new Set(scores).size !== scores.length) return false;
  }

  // 각 점수가 유효한지 체크
  return vote.scores.every(score => {
    const option = poll.options.find(opt => opt.id === score.optionId);
    if (!option) return false;

    return (
      score.score >= option.minScore &&
      score.score <= option.maxScore &&
      (score.score - option.minScore) % option.step === 0
    );
  });
}
