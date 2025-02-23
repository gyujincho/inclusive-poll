import { collection, doc, getDoc, getDocs, addDoc, runTransaction, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Poll, ChoicePoll, ChoiceOption, ChoiceVote } from '../types/poll';
import { nanoid } from 'nanoid';
import { Timestamp } from 'firebase/firestore';

export async function getPoll(pollId: string) {
  const pollRef = doc(db, 'polls', pollId);
  const pollSnap = await getDoc(pollRef);
  
  if (!pollSnap.exists()) {
    throw new Error('투표를 찾을 수 없습니다.');
  }
  
  return pollSnap.data() as Poll;
}

export async function getPolls() {
  const pollsRef = collection(db, 'polls');
  const q = query(pollsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (Poll & { id: string })[];
}

export async function createPoll(pollData: Omit<ChoicePoll, 'id'>) {
  try {
    // 문서 생성
    const docRef = await addDoc(collection(db, 'polls'), pollData);

    // 생성된 문서의 ID를 문서의 필드로 업데이트
    await updateDoc(docRef, { id: docRef.id });

    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
}

export async function addOption(pollId: string, optionText: string, userId: string) {
  const pollRef = doc(db, 'polls', pollId);
  
  await runTransaction(db, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);
    if (!pollDoc.exists()) {
      throw new Error('투표를 찾을 수 없습니다.');
    }

    const poll = pollDoc.data() as ChoicePoll;
    if (poll.type !== 'choice') {
      throw new Error('선택형 투표가 아닙니다.');
    }

    const newOption: ChoiceOption = {
      id: nanoid(),
      type: 'choice',
      text: optionText.trim(),
      createdBy: userId,
      createdAt: Timestamp.now()
    };

    transaction.update(pollRef, {
      options: [...poll.options, newOption]
    });
  });

  return (await getDoc(pollRef)).data() as Poll;
}

export async function vote(pollId: string, optionIds: string[], userId: string) {
  const pollRef = doc(db, 'polls', pollId);
  
  await runTransaction(db, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);
    if (!pollDoc.exists()) {
      throw new Error('투표를 찾을 수 없습니다.');
    }

    const poll = pollDoc.data() as ChoicePoll;
    if (poll.type !== 'choice') {
      throw new Error('선택형 투표가 아닙니다.');
    }

    // 기존 투표 제거
    const existingVoteIndex = poll.votes.findIndex(vote => vote.userId === userId);
    const filteredVotes = existingVoteIndex >= 0 
      ? poll.votes.filter(vote => vote.userId !== userId)
      : poll.votes;

    const newVote: ChoiceVote = {
      id: nanoid(),
      type: 'choice',
      userId,
      optionIds,
      createdAt: Timestamp.now()
    };

    transaction.update(pollRef, {
      votes: [...filteredVotes, newVote]
    });
  });

  return (await getDoc(pollRef)).data() as Poll;
}

export async function endPoll(pollId: string, buffer: number = 0 /* 초 */) {
  try {
    const pollRef = doc(db, 'polls', pollId);
    await updateDoc(pollRef, {
      expiresAt: Timestamp.fromDate(new Date(Date.now() + buffer * 1000)) // Convert buffer seconds to milliseconds
    });
  } catch (error) {
    console.error('투표 종료 중 오류 발생:', error);
    throw error;
  }
}
