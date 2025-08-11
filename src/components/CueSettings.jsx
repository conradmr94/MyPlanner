// src/components/CueSettings.jsx
import React, { useMemo, useState } from 'react';
import { getUserCues, addUserCue, removeUserCue, saveUserCues } from '../nlp/userCues';

export default function CueSettings({ isOpen, onClose }) {
  const [cues, setCues] = useState(() => getUserCues());
  const [phrase, setPhrase] = useState('');
  const [level, setLevel] = useState('high'); // default to "nudge toward high"

  const canAdd = useMemo(() => phrase.trim().length > 0, [phrase]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!canAdd) return;
    const updated = addUserCue(phrase.trim(), level);
    setCues(updated);
    setPhrase('');
    setLevel('high');
  };

  const handleRemove = (p) => {
    const updated = removeUserCue(p);
    setCues(updated);
  };

  const handleLevelChange = (idx, newLevel) => {
    const next = cues.map((c, i) => (i === idx ? { ...c, level: newLevel } : c));
    const saved = saveUserCues(next);
    setCues(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Priority Cues</h2>
          <button onClick={onClose} className="rounded-md px-3 py-1 text-sm hover:bg-gray-100">
            Close
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-600">
          Add keywords that should nudge a task’s priority. Choose whether the keyword pushes toward
          <strong> High</strong>, <strong> Medium</strong>, or <strong> Low</strong>.
        </p>

        {/* Add form */}
        <div className="mb-4 grid grid-cols-12 gap-2">
          <input
            className="col-span-7 rounded-lg border px-3 py-2"
            placeholder='e.g., "blocker"'
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />
          <select
            className="col-span-4 rounded-lg border px-3 py-2"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Priority nudge"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="col-span-1 rounded-lg bg-black px-3 py-2 text-white disabled:opacity-40"
            title="Add cue"
          >
            +
          </button>
        </div>

        {/* List */}
        <div className="max-h-64 overflow-auto rounded-lg border">
          {cues.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No custom cues yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Keyword</th>
                  <th className="px-3 py-2 text-left">Priority nudge</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {cues.map((c, idx) => (
                  <tr key={c.phrase} className="border-t">
                    <td className="px-3 py-2">{c.phrase}</td>
                    <td className="px-3 py-2">
                      <select
                        className="rounded border px-2 py-1"
                        value={c.level}
                        onChange={(e) => handleLevelChange(idx, e.target.value)}
                      >
                        <option value="high">Nudge toward High</option>
                        <option value="medium">Nudge toward Medium</option>
                        <option value="low">Nudge toward Low</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleRemove(c.phrase)}
                        className="rounded-md px-2 py-1 hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Matching is case-insensitive and uses word boundaries (e.g., “blocker” won’t match “blockers”).
        </div>
      </div>
    </div>
  );
}
