import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

// Novels
export const getNovels = async (userId: string, lastDoc?: QueryDocumentSnapshot<DocumentData>) => {
  const novelsRef = collection(db, 'novels');
  const q = lastDoc
    ? query(
        novelsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(10)
      )
    : query(
        novelsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

  const snapshot = await getDocs(q);
  return {
    novels: snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
};

export const getNovel = async (novelId: string) => {
  const docRef = doc(db, 'novels', novelId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

export const createNovel = async (novelData: any) => {
  const novelsRef = collection(db, 'novels');
  const docRef = await addDoc(novelsRef, {
    ...novelData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const updateNovel = async (novelId: string, novelData: any) => {
  const docRef = doc(db, 'novels', novelId);
  await updateDoc(docRef, {
    ...novelData,
    updatedAt: new Date()
  });
};

export const deleteNovel = async (novelId: string) => {
  const docRef = doc(db, 'novels', novelId);
  await deleteDoc(docRef);
};

// Characters
export const getCharacters = async (novelId: string) => {
  const charactersRef = collection(db, 'novels', novelId, 'characters');
  const q = query(charactersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createCharacter = async (novelId: string, characterData: any) => {
  const charactersRef = collection(db, 'novels', novelId, 'characters');
  const docRef = await addDoc(charactersRef, {
    ...characterData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// World Elements
export const getWorldElements = async (novelId: string) => {
  const elementsRef = collection(db, 'novels', novelId, 'worldElements');
  const q = query(elementsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createWorldElement = async (novelId: string, elementData: any) => {
  const elementsRef = collection(db, 'novels', novelId, 'worldElements');
  const docRef = await addDoc(elementsRef, {
    ...elementData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}; 