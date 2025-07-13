import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

const STATUS_COLORS = {
  Active: '#10b981', // emerald
  Sold: '#f59e42',  // orange
  Deceased: '#ef4444', // red
};

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [animalData, setAnimalData] = useState<Animal[]>([]);
  const [medicalData, setMedicalData] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

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

  // Animal status pie chart data
  const animalStatusData = (() => {
    const counts: { [status: string]: number } = {};
    animalData.forEach(animal => {
      counts[animal.status] = (counts[animal.status] || 0) + 1;
    });
    return Object.keys(counts).map(status => ({ name: status, value: counts[status] }));
  })();

  // Health event type pie chart data
  const healthTypeData = (() => {
    const counts: { [type: string]: number } = {};
    medicalData.forEach(rec => {
      counts[rec.type] = (counts[rec.type] || 0) + 1;
    });
    return Object.keys(counts).map(type => ({ name: type, value: counts[type] }));
  })();

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Analytics & Reports</h2>
      {!showAnalytics && (
        <div className="flex flex-col items-center justify-center py-12">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-lg transition-all duration-200"
            onClick={() => setShowAnalytics(true)}
          >
            Generate Analytics
          </button>
          <p className="text-gray-500 mt-4 text-center">Click to generate and view your farm's analytics as beautiful pie charts.</p>
        </div>
      )}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <h3 className="font-semibold mb-2 text-emerald-700">Animal Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={animalStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {animalStatusData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#8884d8'} />
                  ))}
                </Pie>
            <Tooltip />
                <Legend />
              </PieChart>
        </ResponsiveContainer>
      </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <h3 className="font-semibold mb-2 text-emerald-700">Health Event Types</h3>
        <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {healthTypeData.map((entry, idx) => (
                    <Cell key={`cell-health-${idx}`} fill={["#10b981", "#f59e42", "#ef4444", "#6366f1", "#a3e635"][idx % 5]} />
                  ))}
                </Pie>
            <Tooltip />
            <Legend />
              </PieChart>
        </ResponsiveContainer>
      </div>
        </div>
      )}
    </div>
  );
}; 