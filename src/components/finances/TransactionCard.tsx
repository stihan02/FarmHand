import React from 'react';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { TrendingUp, TrendingDown, MapPin, Trash2 } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  onRemove: (transaction: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onRemove }) => {
  const isIncome = transaction.type === 'Income';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}>
            {isIncome ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
            <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
          </div>
        </div>
        <button
          onClick={() => onRemove(transaction)}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {transaction.location && (
            <div className="flex items-center space-x-1 text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{transaction.location}</span>
            </div>
          )}
        </div>
        <div className={`font-bold text-lg ${
          isIncome ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
      </div>
    </div>
  );
};