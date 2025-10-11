// src/data/teamSpaces.js
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
  getDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db, TS } from '../lib/firebase';

// Team Spaces Collection
const teamSpacesCollection = collection(db, 'teamSpaces');

// Team Members Collection
const teamMembersCollection = collection(db, 'teamMembers');

// Team Tasks Collection
const teamTasksCollection = collection(db, 'teamTasks');

// Team Notes Collection
const teamNotesCollection = collection(db, 'teamNotes');

// Team Events Collection
const teamEventsCollection = collection(db, 'teamEvents');

// Team Invitations Collection
const teamInvitationsCollection = collection(db, 'teamInvitations');

// ===== TEAM SPACES =====

export function watchTeamSpaces(userId, cb) {
  // Get teams where user is a member
  const q = query(
    teamMembersCollection,
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  
  return onSnapshot(q, async (memberSnap) => {
    const memberDocs = memberSnap.docs;
    const teamIds = memberDocs.map(doc => doc.data().teamId);
    
    if (teamIds.length === 0) {
      cb([]);
      return;
    }
    
    // Get team space details - use 'in' query for better performance
    const teamQuery = query(
      teamSpacesCollection,
      where('__name__', 'in', teamIds)
    );
    
    const teamSnap = await getDocs(teamQuery);
    const teams = teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    cb(teams);
  });
}

export async function createTeamSpace(ownerId, teamData) {
  const teamRef = await addDoc(teamSpacesCollection, {
    name: teamData.name,
    description: teamData.description || '',
    color: teamData.color || 'blue',
    ownerId,
    createdAt: TS(),
    updatedAt: TS(),
  });
  
  // Add owner as team member
  await addDoc(teamMembersCollection, {
    teamId: teamRef.id,
    userId: ownerId,
    role: 'owner',
    status: 'active',
    joinedAt: TS(),
  });
  
  return teamRef.id;
}

export async function updateTeamSpace(teamId, updates) {
  const teamRef = doc(db, 'teamSpaces', teamId);
  return updateDoc(teamRef, {
    ...updates,
    updatedAt: TS(),
  });
}

export async function deleteTeamSpace(teamId) {
  // Delete team space
  const teamRef = doc(db, 'teamSpaces', teamId);
  await deleteDoc(teamRef);
  
  // Delete all team members
  const membersQuery = query(teamMembersCollection, where('teamId', '==', teamId));
  const membersSnap = await getDocs(membersQuery);
  const deletePromises = membersSnap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  // Delete all team tasks
  const tasksQuery = query(teamTasksCollection, where('teamId', '==', teamId));
  const tasksSnap = await getDocs(tasksQuery);
  const deleteTaskPromises = tasksSnap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deleteTaskPromises);
  
  // Delete all team notes
  const notesQuery = query(teamNotesCollection, where('teamId', '==', teamId));
  const notesSnap = await getDocs(notesQuery);
  const deleteNotePromises = notesSnap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deleteNotePromises);
  
  // Delete all team events
  const eventsQuery = query(teamEventsCollection, where('teamId', '==', teamId));
  const eventsSnap = await getDocs(eventsQuery);
  const deleteEventPromises = eventsSnap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deleteEventPromises);
  
  // Delete all team invitations
  const invitationsQuery = query(teamInvitationsCollection, where('teamId', '==', teamId));
  const invitationsSnap = await getDocs(invitationsQuery);
  const deleteInvitationPromises = invitationsSnap.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deleteInvitationPromises);
}

// ===== TEAM MEMBERS =====

export function watchTeamMembers(teamId, cb) {
  const q = query(
    teamMembersCollection,
    where('teamId', '==', teamId),
    where('status', '==', 'active'),
    orderBy('joinedAt', 'asc')
  );
  
  return onSnapshot(q, (snap) => {
    const members = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(members);
  });
}

export async function addTeamMember(teamId, userId, role = 'member') {
  return addDoc(teamMembersCollection, {
    teamId,
    userId,
    role,
    status: 'active',
    joinedAt: TS(),
  });
}

export async function updateTeamMemberRole(teamId, userId, newRole) {
  const memberQuery = query(
    teamMembersCollection,
    where('teamId', '==', teamId),
    where('userId', '==', userId)
  );
  const memberSnap = await getDocs(memberQuery);
  
  if (memberSnap.empty) {
    throw new Error('Team member not found');
  }
  
  const memberRef = memberSnap.docs[0].ref;
  return updateDoc(memberRef, {
    role: newRole,
    updatedAt: TS(),
  });
}

export async function removeTeamMember(teamId, userId) {
  const memberQuery = query(
    teamMembersCollection,
    where('teamId', '==', teamId),
    where('userId', '==', userId)
  );
  const memberSnap = await getDocs(memberQuery);
  
  if (memberSnap.empty) {
    throw new Error('Team member not found');
  }
  
  const memberRef = memberSnap.docs[0].ref;
  return updateDoc(memberRef, {
    status: 'inactive',
    leftAt: TS(),
  });
}

// ===== TEAM TASKS =====

export function watchTeamTasks(teamId, cb) {
  const q = query(
    teamTasksCollection,
    where('teamId', '==', teamId),
    where('status', '==', 'open'),
    orderBy('dueAt', 'asc'),
    orderBy('priority', 'desc')
  );
  
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(tasks);
  });
}

export async function createTeamTask(teamId, taskData, createdBy) {
  return addDoc(teamTasksCollection, {
    teamId,
    title: taskData.title,
    description: taskData.description || '',
    priority: taskData.priority || 'medium',
    status: 'open',
    dueAt: taskData.dueAt || null,
    assigneeId: taskData.assigneeId || null,
    createdBy,
    createdAt: TS(),
    updatedAt: TS(),
  });
}

export async function updateTeamTask(taskId, updates) {
  const taskRef = doc(db, 'teamTasks', taskId);
  return updateDoc(taskRef, {
    ...updates,
    updatedAt: TS(),
  });
}

export async function completeTeamTask(taskId, completed = true) {
  const taskRef = doc(db, 'teamTasks', taskId);
  return updateDoc(taskRef, {
    status: completed ? 'done' : 'open',
    completedAt: completed ? TS() : null,
    updatedAt: TS(),
  });
}

export async function deleteTeamTask(taskId) {
  const taskRef = doc(db, 'teamTasks', taskId);
  return deleteDoc(taskRef);
}

// ===== TEAM NOTES =====

export function watchTeamNotes(teamId, cb) {
  const q = query(
    teamNotesCollection,
    where('teamId', '==', teamId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(notes);
  });
}

export async function createTeamNote(teamId, noteData, createdBy) {
  return addDoc(teamNotesCollection, {
    teamId,
    title: noteData.title || 'Untitled Note',
    content: noteData.content || '',
    tags: noteData.tags || [],
    isPinned: noteData.isPinned || false,
    createdBy,
    createdAt: TS(),
    updatedAt: TS(),
  });
}

export async function updateTeamNote(noteId, updates) {
  const noteRef = doc(db, 'teamNotes', noteId);
  return updateDoc(noteRef, {
    ...updates,
    updatedAt: TS(),
  });
}

export async function deleteTeamNote(noteId) {
  const noteRef = doc(db, 'teamNotes', noteId);
  return deleteDoc(noteRef);
}

// ===== TEAM EVENTS =====

export function watchTeamEvents(teamId, cb) {
  const q = query(
    teamEventsCollection,
    where('teamId', '==', teamId),
    orderBy('date', 'asc')
  );
  
  return onSnapshot(q, (snap) => {
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(events);
  });
}

export async function createTeamEvent(teamId, eventData, createdBy) {
  return addDoc(teamEventsCollection, {
    teamId,
    title: eventData.title,
    description: eventData.description || '',
    date: eventData.date,
    duration: eventData.duration || 60,
    type: eventData.type || 'meeting',
    color: eventData.color || 'blue',
    guests: eventData.guests || [],
    recurring: eventData.recurring || null,
    createdBy,
    createdAt: TS(),
    updatedAt: TS(),
  });
}

export async function updateTeamEvent(eventId, updates) {
  const eventRef = doc(db, 'teamEvents', eventId);
  return updateDoc(eventRef, {
    ...updates,
    updatedAt: TS(),
  });
}

export async function deleteTeamEvent(eventId) {
  const eventRef = doc(db, 'teamEvents', eventId);
  return deleteDoc(eventRef);
}

// ===== TEAM INVITATIONS =====

export async function createTeamInvitation(teamId, email, invitedBy, role = 'member') {
  return addDoc(teamInvitationsCollection, {
    teamId,
    email,
    role,
    invitedBy,
    status: 'pending',
    createdAt: TS(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
}

export function watchTeamInvitations(teamId, cb) {
  const q = query(
    teamInvitationsCollection,
    where('teamId', '==', teamId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snap) => {
    const invitations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(invitations);
  });
}

export async function acceptTeamInvitation(invitationId, userId) {
  const invitationRef = doc(db, 'teamInvitations', invitationId);
  const invitationSnap = await getDoc(invitationRef);
  
  if (!invitationSnap.exists()) {
    throw new Error('Invitation not found');
  }
  
  const invitationData = invitationSnap.data();
  
  // Add user to team
  await addTeamMember(invitationData.teamId, userId, invitationData.role);
  
  // Update invitation status
  return updateDoc(invitationRef, {
    status: 'accepted',
    acceptedAt: TS(),
    acceptedBy: userId,
  });
}

export async function declineTeamInvitation(invitationId) {
  const invitationRef = doc(db, 'teamInvitations', invitationId);
  return updateDoc(invitationRef, {
    status: 'declined',
    declinedAt: TS(),
  });
}

export async function cancelTeamInvitation(invitationId) {
  const invitationRef = doc(db, 'teamInvitations', invitationId);
  return updateDoc(invitationRef, {
    status: 'cancelled',
    cancelledAt: TS(),
  });
}

// ===== UTILITY FUNCTIONS =====

export async function getUserTeamRole(teamId, userId) {
  const memberQuery = query(
    teamMembersCollection,
    where('teamId', '==', teamId),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  
  const memberSnap = await getDocs(memberQuery);
  
  if (memberSnap.empty) {
    return null;
  }
  
  return memberSnap.docs[0].data().role;
}

export async function canUserAccessTeam(teamId, userId) {
  const role = await getUserTeamRole(teamId, userId);
  return role !== null;
}

export async function canUserManageTeam(teamId, userId) {
  const role = await getUserTeamRole(teamId, userId);
  return role === 'owner' || role === 'admin';
}
