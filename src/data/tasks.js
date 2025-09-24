// src/data/tasks.js
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
  } from 'firebase/firestore';
  import { db, TS } from '../lib/firebase';
  
  function col(uid, name) {
    return collection(db, 'users', uid, name);
  }
  
  export function watchOpenTasks(uid, cb) {
    const q = query(
      col(uid, 'tasks'),
      where('status', '==', 'open'),
      orderBy('dueAt', 'asc'),
      orderBy('priority', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(items);
    });
  }
  
  export async function createTask(uid, task) {
    // task: { title, priority, dueAt?, nlp?, labels? }
    return addDoc(col(uid, 'tasks'), {
      title: task.title,
      notes: task.notes ?? '',
      priority: task.priority ?? 'medium',
      status: 'open',
      dueAt: task.dueAt ?? null,
      estimateMin: task.estimateMin ?? null,
      labels: task.labels ?? [],
      links: task.links ?? [],
      nlp: task.nlp ?? null,
      createdAt: TS(),
      updatedAt: TS(),
    });
  }
  
  export async function completeTask(uid, id, done = true) {
    const ref = doc(db, 'users', uid, 'tasks', id);
    return updateDoc(ref, {
      status: done ? 'done' : 'open',
      completedAt: done ? TS() : null,
      updatedAt: TS(),
    });
  }
  
  export async function deleteTaskDoc(uid, id) {
    const ref = doc(db, 'users', uid, 'tasks', id);
    return deleteDoc(ref);
  }
  