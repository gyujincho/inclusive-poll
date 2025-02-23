import { Timestamp } from 'firebase/firestore';

// 기본 인터페이스들
export interface BaseOption {
  id: string;
  text: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface BasePoll {
  id: string;
  title: string;
  description: string | null;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  showVoters: boolean;
  allowOptionCreation: boolean;
  targetVoterCount: number | null;
}

// 선택형 투표
export interface ChoiceOption extends BaseOption {
  type: 'choice';
}

export interface ChoiceVote {
  id: string;
  type: 'choice';
  userId: string;
  createdAt: Timestamp;
  optionIds: string[];
}

export interface ChoicePoll extends BasePoll {
  type: 'choice';
  options: ChoiceOption[];
  votes: ChoiceVote[];
  minOptionsPerVote: number; // default 1
  maxOptionsPerVote: number; // default 1
}

// 점수형 투표
export interface ScoreOption extends BaseOption {
  type: 'score';
  minScore: number;
  maxScore: number;
  step: number;
}

export interface ScoreVote {
  id: string;
  type: 'score';
  userId: string;
  createdAt: Timestamp;
  scores: Array<{
    optionId: string;
    score: number;
  }>;
}

export interface ScorePoll extends BasePoll {
  type: 'score';
  options: ScoreOption[];
  votes: ScoreVote[];
  requireAllOptions: boolean;
  allowSameScores: boolean;
}

// 통합 타입
export type Poll = ChoicePoll | ScorePoll;
export type PollOption = ChoiceOption | ScoreOption;
export type Vote = ChoiceVote | ScoreVote;

// 투표 결과 인터페이스
export interface BaseOptionResult {
  option: PollOption;
  voters: string[];
}

export interface ChoiceOptionResult extends BaseOptionResult {
  type: 'choice';
  voteCount: number;
}

export interface ScoreOptionResult extends BaseOptionResult {
  type: 'score';
  averageScore: number;
  scoreDistribution: { [score: number]: number };
  totalVotes: number;
}

export interface BasePollResult {
  totalParticipants: number;
  participationRate: number | null;
}

export interface ChoicePollResult extends BasePollResult {
  type: 'choice';
  options: ChoiceOptionResult[];
}

export interface ScorePollResult extends BasePollResult {
  type: 'score';
  options: ScoreOptionResult[];
  averageTotal: number;
}

export type PollResult = ChoicePollResult | ScorePollResult;
