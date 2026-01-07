import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Quiz, QuizResult } from './types';

export interface SavedQuiz extends Quiz {
  userId: string;
  createdAt: Timestamp;
}

export async function saveQuizToHistory(userId: string, quiz: Quiz) {
  try {
    const docRef = await addDoc(collection(db, 'quizzes'), {
      ...quiz,
      userId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}

export async function getUserQuizzes(userId: string) {
  const q = query(
    collection(db, 'quizzes'), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SavedQuiz[];
}

export async function getQuizById(quizId: string) {
  const docRef = doc(db, 'quizzes', quizId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SavedQuiz;
  } else {
    return null;
  }
}
