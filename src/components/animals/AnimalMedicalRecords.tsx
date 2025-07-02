import React, { useEffect, useState } from 'react';
import { Animal } from '../../types';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  medication?: string;
  dosage?: string;
  diagnosis?: string;
  vet?: string;
  notes?: string;
}

interface Props {
  animal: Animal;
  userId: string;
}

export const AnimalMedicalRecords: React.FC<Props> = ({ animal, userId }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalRecord | null>(null);
  const [form, setForm] = useState<Omit<MedicalRecord, 'id'>>({
    date: '',
    type: '',
    medication: '',
    dosage: '',
    diagnosis: '',
    vet: '',
    notes: ''
  });

  // Load records from Firestore
  useEffect(() => {
    const colRef = collection(db, 'users', userId, 'animals', animal.id, 'medicalRecords');
    const unsub = onSnapshot(colRef, snap => {
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord)));
    });
    return unsub;
  }, [animal.id, userId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ date: '', type: '', medication: '', dosage: '', diagnosis: '', vet: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (rec: MedicalRecord) => {
    setEditing(rec);
    setForm({ ...rec });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    await deleteDoc(doc(db, 'users', userId, 'animals', animal.id, 'medicalRecords', id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const colRef = collection(db, 'users', userId, 'animals', animal.id, 'medicalRecords');
    if (editing) {
      await updateDoc(doc(colRef, editing.id), form);
    } else {
      await addDoc(colRef, form);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Medical Records</h3>
        <button onClick={openAdd} className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Add Record</button>
      </div>
      {records.length === 0 ? (
        <div className="text-gray-500">No medical records yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Medication</th>
                <th className="p-2">Dosage</th>
                <th className="p-2">Diagnosis</th>
                <th className="p-2">Vet</th>
                <th className="p-2">Notes</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{rec.date}</td>
                  <td className="p-2 whitespace-nowrap">{rec.type}</td>
                  <td className="p-2 whitespace-nowrap">{rec.medication}</td>
                  <td className="p-2 whitespace-nowrap">{rec.dosage}</td>
                  <td className="p-2 whitespace-nowrap">{rec.diagnosis}</td>
                  <td className="p-2 whitespace-nowrap">{rec.vet}</td>
                  <td className="p-2 whitespace-nowrap">{rec.notes}</td>
                  <td className="p-2 whitespace-nowrap flex gap-2">
                    <button onClick={() => openEdit(rec)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(rec.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold mb-2">{editing ? 'Edit' : 'Add'} Medical Record</h4>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border rounded px-3 py-2" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>
                <option value="">Select type</option>
                <option>Vaccination</option>
                <option>Treatment</option>
                <option>Illness</option>
                <option>Injury</option>
                <option>Checkup</option>
                <option>Other</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Medication</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Dosage</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Diagnosis</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Vet</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.vet} onChange={e => setForm(f => ({ ...f, vet: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 