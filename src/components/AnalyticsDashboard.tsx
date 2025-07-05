import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface Animal {
  id: string;
  birthdate: string;
  status: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [animalData, setAnimalData] = useState<Animal[]>([]);
  const [medicalData, setMedicalData] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch animals and medical records
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Animals
      const animalsSnap = await getDocs(collection(db, 'users', user.uid, 'animals'));
      const animals: Animal[] = animalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
      setAnimalData(animals);
      // Medical records (all animals)
      let allMedical: MedicalRecord[] = [];
      for (const animal of animals) {
        const medSnap = await getDocs(collection(db, 'users', user.uid, 'animals', animal.id, 'medicalRecords'));
        allMedical = allMedical.concat(medSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord)));
      }
      setMedicalData(allMedical);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Animal count over time (by month)
  const animalCountByMonth = (() => {
    const counts: { [month: string]: number } = {};
    animalData.forEach(animal => {
      const month = animal.birthdate?.slice(0, 7); // YYYY-MM
      if (month) counts[month] = (counts[month] || 0) + 1;
    });
    // Cumulative count
    const months = Object.keys(counts).sort();
    let total = 0;
    return months.map(month => {
      total += counts[month];
      return { month, count: total };
    });
  })();

  // Health events per month
  const healthEventsByMonth = (() => {
    const counts: { [month: string]: number } = {};
    medicalData.forEach(rec => {
      const month = rec.date?.slice(0, 7); // YYYY-MM
      if (month) counts[month] = (counts[month] || 0) + 1;
    });
    const months = Object.keys(counts).sort();
    return months.map(month => ({ month, events: counts[month] }));
  })();

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Analytics & Reports</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Animal Count Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={animalCountByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Health Events Per Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={healthEventsByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="events" fill="#f59e42" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 