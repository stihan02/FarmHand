import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from '@tanstack/react-table';
import { Animal, WeightRecord } from '../../types';
import { calculateAge, formatCurrency, formatDate } from '../../utils/helpers';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Eye, 
  DollarSign, 
  Skull,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Calendar,
  Plus,
  Move,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { differenceInDays, parseISO } from 'date-fns';
import { AnimalModal } from './AnimalModal';
import { WeightTrackingModal } from './WeightTrackingModal';
import { QuickWeightEntry } from './QuickWeightEntry';
import * as XLSX from 'xlsx';
import { isMobile } from 'react-device-detect';
import { useToast } from '../ToastContext';

interface AnimalTableProps {
  animals: Animal[];
  onMarkSold: (animal: Animal) => void;
  onMarkDeceased: (animal: Animal) => void;
  onRemove: (animal: Animal) => void;
  onMoveToCamp: (animalIds: string[], campId: string) => void;
  searchTerm: string;
  statusFilter: string;
  campFilter: string;
  onScheduleEventClick?: (selectedTagNumbers: string[]) => void;
}

const columnHelper = createColumnHelper<Animal>();

// New component for inline camp editing
const CampCellEditor: React.FC<{
  value: string | undefined;
  row: any;
  onSave: (animalId: string, newCampId: string) => void;
}> = ({ value, row, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [campId, setCampId] = useState(value || '');
  const { state: farmState } = useFarm();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCampName, setNewCampName] = useState('');

  const handleSave = () => {
    if (isCreatingNew && newCampName.trim() !== '') {
      // Not supported: creating new camp from here, so just close
      setEditing(false);
      setIsCreatingNew(false);
      setNewCampName('');
    } else if (!isCreatingNew && campId) {
      onSave(row.original.id, campId);
      setEditing(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCampId(e.target.value);
    onSave(row.original.id, e.target.value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
        <select
          value={campId}
          onChange={handleSelectChange}
          onBlur={() => setEditing(false)}
          className="w-full px-2 py-1 text-sm border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          autoFocus
        >
          {farmState.camps.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Show camp name, not id
  const campName = farmState.camps.find(c => c.id === value)?.name || 'Unassigned';

  return (
    <div onClick={e => { e.stopPropagation(); setEditing(true); }} className="cursor-pointer group w-full h-full p-0 m-0">
      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
        {campName}
      </span>
    </div>
  );
};

// Add types for import preview and errors
interface ImportAnimalRow {
  type: string;
  tagNumber: string;
  sex: 'M' | 'F';
  tagColor: string;
  age: string;
  [key: string]: any;
}
interface ImportError {
  row: number;
  error: string;
  data: any;
}

export const AnimalTable: React.FC<AnimalTableProps> = ({
  animals,
  onMarkSold,
  onMarkDeceased,
  onRemove,
  onMoveToCamp,
  searchTerm,
  statusFilter,
  campFilter,
  onScheduleEventClick,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { state: farmState, dispatch } = useFarm();
  const [moveToCampDropdownOpen, setMoveToCampDropdownOpen] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importPreview, setImportPreview] = useState<ImportAnimalRow[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [weightTrackingModalOpen, setWeightTrackingModalOpen] = useState(false);
  const [selectedAnimalForWeight, setSelectedAnimalForWeight] = useState<Animal | null>(null);
  const [quickWeightEntryOpen, setQuickWeightEntryOpen] = useState(false);
  const { showToast } = useToast();

  const typeEmojis: Record<string, string> = {
    Sheep: '🐑',
    Cattle: '🐄',
    Pig: '🐷'
  };

  const statusColors = {
    Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    Sold: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Deceased: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const handleBulkAction = (action: 'sell' | 'deceased' | 'remove') => {
    const selectedAnimals = table.getSelectedRowModel().flatRows.map(row => row.original);
    
    switch (action) {
      case 'sell':
        selectedAnimals.forEach(animal => {
          onMarkSold(animal);
          showToast({ type: 'success', message: `Marked ${animal.tagNumber} as sold.` });
        });
        break;
      case 'deceased':
        selectedAnimals.forEach(animal => {
          onMarkDeceased(animal);
          showToast({ type: 'success', message: `Marked ${animal.tagNumber} as deceased.` });
        });
        break;
      case 'remove':
        selectedAnimals.forEach(animal => {
          onRemove(animal);
          showToast({ type: 'success', message: `Removed ${animal.tagNumber}.` });
        });
        break;
    }
    
    setRowSelection({});
  };

  const handleBulkMove = (campId: string) => {
    const selectedAnimalIds = table.getSelectedRowModel().flatRows.map(row => row.original.id);
    onMoveToCamp(selectedAnimalIds, campId);
    setRowSelection({});
    setMoveToCampDropdownOpen(false);
  };

  const handleUpdateCamp = (animalId: string, newCampId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (animal) {
      dispatch({ type: 'UPDATE_ANIMAL', payload: { ...animal, campId: newCampId } });
    }
  };

  const handleAddWeightRecord = (animalId: string, weightRecord: WeightRecord) => {
    dispatch({ type: 'ADD_WEIGHT_RECORD', payload: { animalId, weightRecord } });
  };

  const getGrazingDuration = (animal: Animal) => {
    // Find the last move to the current camp
    const moveEvents = animal.history
      .filter(e => e.description.includes('Moved from camp'))
      .reverse();
    for (const event of moveEvents) {
      if (event.description.endsWith(`to ${animal.campId || 'Unassigned'}`)) {
        const days = differenceInDays(new Date(), parseISO(event.date));
        return days === 0 ? 'Today' : `${days} day${days !== 1 ? 's' : ''}`;
      }
    }
    return '—';
  };

  // Inbreeding and biosecurity alert logic
  const getInbreedingAlert = (animal: Animal) => {
    if (!animal.campId) return null;
    // Find all animals in the same camp
    const animalsInCamp = farmState.animals.filter(a => a.campId === animal.campId && a.id !== animal.id);
    // Check for parent/offspring
    const parentTags = [animal.motherTag, animal.fatherTag].filter(Boolean);
    const siblingTags = [];
    animalsInCamp.forEach(a => {
      if (a.motherTag && parentTags.includes(a.motherTag)) siblingTags.push(a.tagNumber);
      if (a.fatherTag && parentTags.includes(a.fatherTag)) siblingTags.push(a.tagNumber);
    });
    const offspringInCamp = animalsInCamp.filter(a => animal.offspringTags.includes(a.tagNumber));
    const parentInCamp = animalsInCamp.filter(a => parentTags.includes(a.tagNumber));
    if (siblingTags.length > 0 || offspringInCamp.length > 0 || parentInCamp.length > 0) {
      return `Inbreeding risk: ${[
        siblingTags.length > 0 ? 'Sibling(s)' : null,
        offspringInCamp.length > 0 ? 'Offspring' : null,
        parentInCamp.length > 0 ? 'Parent' : null
      ].filter(Boolean).join(', ')} in same camp.`;
    }
    return null;
  };
  const getBiosecurityAlert = (animal: Animal) => {
    if (!animal.campId) return null;
    // Check for recent disease/treatment events in the camp (last 30 days)
    const animalsInCamp = farmState.animals.filter(a => a.campId === animal.campId);
    const now = new Date();
    const recentDisease = animalsInCamp.some(a =>
      a.health.some(h =>
        (h.type === 'Treatment' || h.type === 'Vaccination') &&
        (now.getTime() - new Date(h.date).getTime()) < 1000 * 60 * 60 * 24 * 30
      )
    );
    if (recentDisease) {
      return 'Biosecurity risk: Recent disease/treatment event in camp.';
    }
    return null;
  };

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <div className="px-1">
          <input
            type="checkbox"
            {...{
              checked: table.getIsAllPageRowsSelected(),
              indeterminate: table.getIsSomePageRowsSelected(),
              onChange: table.getToggleAllPageRowsSelectedHandler(),
            }}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <input
            type="checkbox"
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              onChange: row.getToggleSelectedHandler(),
            }}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
      ),
      size: 40,
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{typeEmojis[getValue()]}</span>
          <span className="font-medium dark:text-gray-200">{getValue()}</span>
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor('tagNumber', {
      header: 'Tag #',
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">#{getValue()}</span>
      ),
      size: 100,
    }),
    columnHelper.accessor('sex', {
      header: 'Sex',
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          getValue() === 'M' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
        }`}>
          {getValue() === 'M' ? 'Male' : 'Female'}
        </span>
      ),
      size: 80,
    }),
    columnHelper.accessor('tagColor', {
      header: 'Tag Color',
      cell: ({ getValue }) => <span className="dark:text-gray-300">{getValue() || 'Not specified'}</span>,
      size: 100,
    }),
    columnHelper.accessor('birthdate', {
      header: 'Age',
      cell: ({ getValue }) => <span className="dark:text-gray-300">{calculateAge(getValue())}</span>,
      size: 80,
    }),
    columnHelper.accessor('birthdate', {
      header: 'Birth Date',
      id: 'birthDate',
      cell: ({ getValue }) => <span className="dark:text-gray-300">{formatDate(getValue())}</span>,
      size: 120,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue, row }) => (
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[getValue()]}`}>
            {getValue()}
          </span>
          {getValue() === 'Sold' && row.original.salePrice && (
            <span className="text-xs text-green-600 font-medium">
              {formatCurrency(row.original.salePrice)}
            </span>
          )}
        </div>
      ),
      size: 150,
    }),
    columnHelper.accessor('campId', {
      header: 'Camp',
      cell: (props) => (
        <CampCellEditor value={props.getValue()} row={props.row} onSave={handleUpdateCamp} />
      ),
      size: 150,
    }),
    columnHelper.display({
      id: 'grazingDuration',
      header: 'Grazing Duration',
      cell: ({ row }) => (
        <span className="dark:text-gray-300">{getGrazingDuration(row.original)}</span>
      ),
      size: 120,
    }),
    columnHelper.display({
      id: 'latestWeight',
      header: 'Latest Weight',
      cell: ({ row }) => {
        const animal = row.original;
        const weightRecords = animal.weightRecords || [];
        const latestWeight = weightRecords.length > 0 
          ? weightRecords[weightRecords.length - 1]
          : null;
        
        return (
          <div className="text-sm">
            {latestWeight ? (
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {latestWeight.weight} kg
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(latestWeight.date).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">No data</span>
            )}
          </div>
        );
      },
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const animal = row.original;
        const dropdownId = `dropdown-${animal.id}`;
        const isOpen = activeDropdown === dropdownId;
        
        return (
          <div className="relative actions-button-wrapper">
            <button
              onClick={e => { e.stopPropagation(); setActiveDropdown(isOpen ? null : dropdownId); }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setActiveDropdown(null)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20 min-w-[160px]">
                  <button
                    onClick={e => { e.stopPropagation(); setActiveDropdown(null); setSelectedAnimal(animal); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 dark:text-gray-200"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={e => { 
                      e.stopPropagation(); 
                      setActiveDropdown(null); 
                      setSelectedAnimalForWeight(animal);
                      setWeightTrackingModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 dark:text-gray-200"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Track Weight</span>
                  </button>
                  {animal.status === 'Active' && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 dark:text-gray-200"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Mark Sold</span>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 dark:text-gray-200"
                      >
                        <Skull className="h-4 w-4" />
                        <span>Mark Deceased</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); setActiveDropdown(null); }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )
      },
      size: 50,
    }),
  ], [activeDropdown, farmState.camps, onMarkSold, onMarkDeceased, onRemove]);

  const table = useReactTable({
    data: animals,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const selectedRowCount = Object.keys(rowSelection).length;
  
  useEffect(() => {
    const filters = [];
    if (searchTerm) {
      // Assuming tagNumber is the primary search field
      filters.push({ id: 'tagNumber', value: searchTerm });
    }
    if (statusFilter && statusFilter !== 'All') {
      filters.push({ id: 'status', value: statusFilter });
    }
    if (campFilter && campFilter !== 'All') {
      filters.push({ id: 'camp', value: campFilter });
    }
    table.setColumnFilters(filters);
  }, [searchTerm, statusFilter, campFilter, table]);


  const handleCreateAndMoveCamp = () => {
    if (newCampName.trim() === '') return;
    
    const selectedAnimalIds = table.getSelectedRowModel().flatRows.map(row => row.original.id);
    
    if (!farmState.camps.find(c => c.name === newCampName.trim())) {
      dispatch({ type: 'ADD_CAMP', payload: { id: newCampName.trim().toLowerCase().replace(/\s+/g, '-'), name: newCampName.trim(), geoJson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] } }, animals: [] } });
    }
    
    onMoveToCamp(selectedAnimalIds, newCampName.trim());
    
    setNewCampName('');
    setRowSelection({});
    setMoveToCampDropdownOpen(false);
  };

  // Template data
  const templateHeaders = ['type', 'tagNumber', 'sex', 'tagColor', 'age'];
  const templateExample = [
    { type: 'Sheep', tagNumber: '123', sex: 'F', tagColor: 'Yellow', age: '2' },
    { type: 'Cattle', tagNumber: '456', sex: 'M', tagColor: 'Blue', age: '3' },
  ];

  function downloadTemplate(format: 'csv' | 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(templateExample, { header: templateHeaders });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Animals');
    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'animal_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      XLSX.writeFile(wb, 'animal_import_template.xlsx');
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!evt.target) return;
      const data = evt.target.result as string | ArrayBuffer;
      let workbook;
      if (file.name.endsWith('.csv')) {
        workbook = XLSX.read(data, { type: 'string' });
      } else {
        workbook = XLSX.read(data, { type: 'binary' });
      }
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as ImportAnimalRow[];
      const valid: ImportAnimalRow[] = [];
      const errors: ImportError[] = [];
      rows.forEach((row, idx) => {
        const missing = templateHeaders.filter(h => !row[h] || row[h].toString().trim() === '');
        if (missing.length > 0) {
          errors.push({ row: idx + 2, error: `Missing: ${missing.join(', ')}`, data: row });
          return;
        }
        // Validate sex
        if (!['M', 'F'].includes(row.sex)) {
          errors.push({ row: idx + 2, error: 'Sex must be M or F', data: row });
          return;
        }
        // Validate age is a number
        if (isNaN(Number(row.age))) {
          errors.push({ row: idx + 2, error: 'Age must be a number', data: row });
          return;
        }
        valid.push(row);
      });
      setImportPreview(valid);
      setImportErrors(errors);
    };
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  }

  function handleImportConfirm() {
    // Add valid animals
    importPreview.forEach(row => {
      const animal = {
        id: Math.random().toString(36).slice(2),
        type: row.type,
        tagNumber: row.tagNumber,
        sex: row.sex,
        tagColor: row.tagColor,
        birthdate: '', // User must edit to set real birthdate if needed
        campId: undefined,
        status: 'Active' as const,
        salePrice: undefined,
        saleDate: undefined,
        deceasedReason: undefined,
        deceasedDate: undefined,
        motherTag: undefined,
        fatherTag: undefined,
        offspringTags: [],
        genetics: { traits: {}, lineage: [], notes: '', animalTagNumbers: [] },
        health: [],
        weightRecords: [],
        history: [{ date: new Date().toISOString().split('T')[0], description: 'Imported' }],
      };
      dispatch({ type: 'ADD_ANIMAL', payload: animal });
      showToast({ type: 'success', message: `Imported animal ${row.tagNumber}` });
    });
    setImportModalOpen(false);
    setImportPreview([]);
    setImportErrors([]);
    setImportFileName('');
  }

  // Long-press logic for mobile
  let longPressTimer: NodeJS.Timeout;
  const handleRowTouchStart = (id: string) => {
    if (!multiSelectMode) {
      longPressTimer = setTimeout(() => {
        setMultiSelectMode(true);
        setSelectedIds([id]);
      }, 400); // 400ms for long-press
    }
  };
  const handleRowTouchEnd = () => {
    clearTimeout(longPressTimer);
  };
  const handleRowClick = (id: string) => {
    if (multiSelectMode) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };
  // Exit multi-select mode if none selected
  useEffect(() => {
    if (multiSelectMode && selectedIds.length === 0) setMultiSelectMode(false);
  }, [selectedIds, multiSelectMode]);

  if (selectedAnimal) {
    console.log('Rendering AnimalModal for:', selectedAnimal);
  }

  return (
    <>
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Bulk action bar: floating above tab bar on mobile, top on desktop */}
      {selectedRowCount > 0 && (
        <div className="sm:static sm:top-auto sm:left-auto sm:right-auto sm:w-auto fixed bottom-20 left-4 right-4 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between p-4 shadow-2xl rounded-2xl transition-all animate-fade-in">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {selectedRowCount} item(s) selected
            </p>
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-emerald-500"
                  onClick={() => setMoveToCampDropdownOpen(!moveToCampDropdownOpen)}
                >
                  <Move className="mr-2 h-5 w-5" />
                  Move to Camp
                  <ChevronDown className="-mr-1 ml-2 h-5 w-5" />
                </button>
              </div>
              {moveToCampDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoveToCampDropdownOpen(false)}></div>
                  <div 
                    className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border dark:border-gray-700"
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {farmState.camps.map(camp => (
                        <button
                          key={camp.id}
                          onClick={() => handleBulkMove(camp.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          {camp.name}
                        </button>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      <div className="p-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="New camp name..."
                            value={newCampName}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setNewCampName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateAndMoveCamp()}
                            className="w-full text-sm px-2 py-1.5 rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                          <button
                            onClick={handleCreateAndMoveCamp}
                            className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                            disabled={!newCampName.trim()}
                          >
                            <Plus className="h-4 w-4"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button
                onClick={() => {
                  const selected = table.getSelectedRowModel().flatRows.map(row => row.original.tagNumber);
                  onScheduleEventClick && onScheduleEventClick(selected);
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:hover:bg-purple-900"
              >
                Schedule Event
              </button>
            <button
              onClick={() => handleBulkAction('sell')}
              className="px-3 py-1.5 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900"
            >
              Mark as Sold
            </button>
            <button
              onClick={() => handleBulkAction('deceased')}
              className="px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900"
            >
              Mark as Deceased
            </button>
            <button
              onClick={() => handleBulkAction('remove')}
              className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Remove
            </button>
            {/* Close button for mobile */}
            <button
              onClick={() => { setSelectedIds([]); setRowSelection({}); }}
              className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
              aria-label="Close bulk action bar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                        className={
                          header.id === 'tagNumber' || header.id === 'camp' || header.id === 'status'
                            ? 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                            : 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell'
                        }
                      style={{ width: header.getSize() }}
                    >
                        <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none flex items-center'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                        >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="w-4 h-4 ml-1" />,
                        desc: <ChevronDown className="w-4 h-4 ml-1" />,
                      }[header.column.getIsSorted() as string] ?? null}
                        </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${row.getIsSelected() ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''} cursor-pointer ${multiSelectMode && selectedIds.includes(row.original.id) ? 'bg-emerald-100 dark:bg-emerald-900' : ''}`}
                  onClick={() => {
                    if (multiSelectMode) {
                      setSelectedIds(prev => prev.includes(row.original.id) ? prev.filter(x => x !== row.original.id) : [...prev, row.original.id]);
                    } else {
                      // Show animal modal with animal info first
                      setSelectedAnimal(row.original);
                    }
                  }}
                  onTouchStart={isMobile ? () => handleRowTouchStart(row.original.id) : undefined}
                  onTouchEnd={isMobile ? handleRowTouchEnd : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id} 
                        className={
                          cell.column.id === 'tagNumber' || cell.column.id === 'camp' || cell.column.id === 'status'
                            ? 'px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300'
                            : 'px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell'
                        }
                    onClick={e => {
                      if (cell.column.id === 'select' || cell.column.id === 'actions' || cell.column.id === 'camp') {
                        e.stopPropagation();
                      }
                    }}
                  >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  {multiSelectMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.original.id)}
                        readOnly
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page{' '}
              <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
              <span className="font-medium">{table.getPageCount()}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
                <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
                <ChevronsRight className="h-5 w-5" />
          </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

      <div className="flex justify-end mb-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700" onClick={() => setImportModalOpen(true)}>
          Import Animals (CSV/Excel)
        </button>
      </div>

      {importModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Import Animals</h2>
            <div className="mb-2 flex gap-2">
              <button className="text-blue-600 underline" onClick={() => downloadTemplate('csv')}>Download CSV Template</button>
              <button className="text-blue-600 underline" onClick={() => downloadTemplate('xlsx')}>Download Excel Template</button>
            </div>
            <input type="file" accept=".csv,.xlsx" onChange={handleImportFile} className="mb-2" />
            {importFileName && <div className="mb-2 text-sm text-gray-700">Selected: {importFileName}</div>}
            {importPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Valid Rows:</div>
                <table className="w-full text-xs border mb-2">
                  <thead><tr>{templateHeaders.map(h => <th key={h} className="border px-1">{h}</th>)}</tr></thead>
                  <tbody>
                    {importPreview.map((row, i) => (
                      <tr key={i}>{templateHeaders.map(h => <td key={h} className="border px-1">{row[h]}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {importErrors.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1 text-red-600">Invalid Rows:</div>
                <ul className="text-xs text-red-700">
                  {importErrors.map((err, i) => (
                    <li key={i}>Row {err.row}: {err.error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setImportModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300" onClick={handleImportConfirm} disabled={importPreview.length === 0}>Import</button>
            </div>
          </div>
        </div>
      )}

      {selectedAnimal && (
        <div style={{ zIndex: 99999, position: 'relative' }}>
          <AnimalModal
            animal={selectedAnimal}
            onClose={() => setSelectedAnimal(null)}
            onUpdate={updated => {
              dispatch({ type: 'UPDATE_ANIMAL', payload: updated });
              setSelectedAnimal(null);
            }}
            allAnimals={animals}
          />
        </div>
      )}
      
      {selectedAnimalForWeight && weightTrackingModalOpen && (
        <WeightTrackingModal
          animal={selectedAnimalForWeight}
          onClose={() => {
            setWeightTrackingModalOpen(false);
            setSelectedAnimalForWeight(null);
          }}
          onUpdate={updated => {
            dispatch({ type: 'UPDATE_ANIMAL', payload: updated });
            setWeightTrackingModalOpen(false);
            setSelectedAnimalForWeight(null);
          }}
        />
      )}
    </>
  );
};