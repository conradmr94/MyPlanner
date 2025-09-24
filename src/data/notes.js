// src/data/notes.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, TS } from '../lib/firebase';

function col(uid, name) {
  return collection(db, 'users', uid, name);
}

export function watchNotes(uid, cb) {
  const q = query(
    col(uid, 'notes'),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

export async function createNote(uid, note) {
  // note: { title, content, tags?, linkedTasks?, isPinned? }
  return addDoc(col(uid, 'notes'), {
    title: note.title || 'Untitled Note',
    content: note.content || '',
    tags: note.tags || [],
    linkedTasks: note.linkedTasks || [],
    isPinned: note.isPinned || false,
    createdAt: TS(),
    updatedAt: TS(),
  });
}

export async function updateNote(uid, id, updates) {
  const ref = doc(db, 'users', uid, 'notes', id);
  return updateDoc(ref, {
    ...updates,
    updatedAt: TS(),
  });
}

export async function deleteNote(uid, id) {
  const ref = doc(db, 'users', uid, 'notes', id);
  return deleteDoc(ref);
}

export async function togglePinNote(uid, id, isPinned) {
  const ref = doc(db, 'users', 'notes', id);
  return updateDoc(ref, {
    isPinned,
    updatedAt: TS(),
  });
}

export async function addNoteTag(uid, id, tag) {
  const ref = doc(db, 'users', uid, 'notes', id);
  // This would need to be done with a transaction in a real app
  // For now, we'll handle it in the component
  return updateDoc(ref, {
    updatedAt: TS(),
  });
}

export async function linkNoteToTask(uid, noteId, taskId) {
  const ref = doc(db, 'users', uid, 'notes', noteId);
  // This would need to be done with a transaction in a real app
  // For now, we'll handle it in the component
  return updateDoc(ref, {
    updatedAt: TS(),
  });
}
