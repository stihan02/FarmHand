import { useEffect, useState } from 'react';
import { Animal, Transaction, Task, Camp, InventoryItem, Event } from '../types';

export const calculateAge = (birthdate: string): string => {
  try {
    const birth = new Date(birthdate);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(ageInDays / 365);
    const months = Math.floor((ageInDays % 365) / 30);
    
    if (years > 0) {
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months}m`;
    } else {
      return `${ageInDays}d`;
    }
  } catch {
    return 'Unknown';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return date;
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that need quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportAnimalsReport = (animals: Animal[]) => {
  const reportData = animals.map(animal => ({
    'Tag Number': animal.tagNumber,
    'Type': animal.type,
    'Breed': animal.breed || 'Unknown',
    'Status': animal.status,
    'Camp': animal.campId || 'Unassigned',
    'Birthdate': animal.birthdate,
    'Sale Date': animal.saleDate || '',
    'Sale Price': animal.salePrice || 0,
    'Sex': animal.sex
  }));
  
  exportToCSV(reportData, 'animals_report');
};

export const exportFinancialReport = (transactions: Transaction[]) => {
  const reportData = transactions.map(transaction => ({
    'Date': transaction.date,
    'Type': transaction.type,
    'Description': transaction.description,
    'Amount': transaction.amount,
    'Location': transaction.location || ''
  }));
  
  exportToCSV(reportData, 'financial_report');
};

export const exportInventoryReport = (inventory: InventoryItem[]) => {
  const reportData = inventory.map(item => ({
    'Item Name': item.name,
    'Category': item.category,
    'Current Stock': item.quantity,
    'Unit': item.unit,
    'Price Per Unit': item.price || 0,
    'Total Value': item.quantity * (item.price || 0),
    'Last Used': item.lastUsed || 'Never'
  }));
  
  exportToCSV(reportData, 'inventory_report');
};

export const exportAllData = (farmData: {
  animals: Animal[];
  transactions: Transaction[];
  tasks: Task[];
  camps: Camp[];
  inventory: InventoryItem[];
  events: Event[];
}) => {
  const backup = {
    ...farmData,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `herdwise_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid backup file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}