import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ExamDocument } from './types/naskah';

const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the exact database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Operation types for strict Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection validation on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
      return false;
    }
    // Any permission or missing doc response proves the server is reached
    return true;
  }
}

// Firestore Helper API for Exam Documents
const EXAM_DOCS_COLLECTION = 'exam_documents';

export async function fetchAllExamDocuments(): Promise<ExamDocument[]> {
  try {
    const q = query(collection(db, EXAM_DOCS_COLLECTION));
    const snapshot = await getDocs(q);
    const docs: ExamDocument[] = [];
    snapshot.forEach((d) => {
      docs.push(d.data() as ExamDocument);
    });
    return docs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, EXAM_DOCS_COLLECTION);
  }
}

export async function saveExamDocumentToFirestore(examDoc: ExamDocument): Promise<void> {
  const path = `${EXAM_DOCS_COLLECTION}/${examDoc.id}`;
  try {
    await setDoc(doc(db, EXAM_DOCS_COLLECTION, examDoc.id), examDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExamDocumentFromFirestore(id: string): Promise<void> {
  const path = `${EXAM_DOCS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, EXAM_DOCS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToExamDocuments(
  onUpdate: (docs: ExamDocument[]) => void,
  onError?: (err: Error) => void
) {
  const path = EXAM_DOCS_COLLECTION;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const docs: ExamDocument[] = [];
      snapshot.forEach((d) => {
        docs.push(d.data() as ExamDocument);
      });
      // Sort newest first
      docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      onUpdate(docs);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (err: any) {
        if (onError) {
          onError(err);
        }
      }
    }
  );
}
