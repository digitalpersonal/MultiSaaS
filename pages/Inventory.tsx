
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  AlertTriangle, 
  Package, 
  X, 
  DollarSign, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  Printer, 
  Percent, 
  Info,
  Layers,
  ChevronDown,
  Settings2,
  Wrench,
  Clock,
  LayoutGrid,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ProductVariation } from '../types';

const initialProducts = [
  { id: '1', name: 'Tela iPhone 13 Pro', sku: 'TEL-IP13-P', category: 'Peças', stock: 12, minStock: 5, costPrice: 450.00, salePrice: 850.00, active: true, hasVariations: false, type: 'PHYSICAL' },
  { 
    id: '2', 
    name: 'Bateria iPhone 11', 
    sku: 'BAT-IP11', 
    category: 'Peças', 
    stock: 3, 
    minStock: 10, 
    costPrice: 80.00, 
    salePrice: 180.00, 
    active: true, 
    hasVariations: true,
    type: 'PHYSICAL',
    variations: [
      { id: 'v1', name: 'Original', sku: 'BAT-IP11-ORI', stock: 2 },
      { id: 'v2', name: 'Primeira Linha', sku: 'BAT-IP11-PL', stock: 1 },
    ]
  },
  { id: '3', name: 'Mão de Obra: Troca de Tela', sku: 'SRV-TR-TEL', category: 'Serviços', costPrice: 0, salePrice: 150.00, active: true, hasVariations: false, type: 'SERVICE', estimatedDuration: '60 min' },
  { id: '4', name: 'Limpeza Preventiva Notebook', sku: 'SRV-LIMP', category: 'Serviços', costPrice: 20.00, salePrice: 120.00, active: true, hasVariations: false, type: 'SERVICE', estimatedDuration: '120 min' },
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'ALL' | 'PRODUCTS' | 'SERVICES'>('ALL');

  // Form States
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Peças');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('5');
  const [costValue, setCostValue] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [itemType, setItemType] = useState<'PHYSICAL' | 'SERVICE'>('PHYSICAL');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  
  // Variations States
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  const maskCurrencyInput = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '');
    if (!onlyDigits) return '';
    const numericValue = Number(onlyDigits) / 100;
    return numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseCurrencyToNumber = (formattedValue: string) => {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.'));
  };

  const currentCost = useMemo(() => parseCurrencyToNumber(costValue), [costValue]);
  const currentSale = useMemo(() => parseCurrencyToNumber(saleValue), [saleValue]);
  const currentProfit = currentSale - currentCost;
  const currentMargin = currentSale > 0 ? (currentProfit / currentSale) * 100 : 0;

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setSku(product.sku || '');
      setCategory(product.category);
      setStock(product.stock?.toString() || '0');
      setMinStock(product.minStock?.toString() || '5');
      setCostValue(maskCurrencyInput((product.costPrice * 100).toString()));
      setSaleValue(maskCurrencyInput((product.salePrice * 100).toString()));
      setHasVariations(product.hasVariations || false);
      setVariations(product.variations || []);
      setItemType(product.type === 'SERVICE' ? 'SERVICE' : 'PHYSICAL');
      setEstimatedDuration(product.estimatedDuration || '');
    } else {
      setEditingProduct(null);
      setName('');
      setSku('');
      setCategory('Peças');
      setStock('0');
      setMinStock('5');
      setCostValue('');
      setSaleValue('');
      setHasVariations(false);
      setVariations([]);
      setItemType('PHYSICAL');
      setEstimatedDuration('');
    }
    setFormError(null);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleAddVariation = () => {
    const newVariation: ProductVariation = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sku: sku ? `${sku}-${variations.length + 1}` : '',
      stock: 0
    };
    setVariations([...variations, newVariation]);
  };

  const handleUpdateVariation = (id: string, field: keyof ProductVariation, value: any) => {
    setVariations(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleRemoveVariation = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do catálogo?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setActiveMenu(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCost > currentSale && currentSale > 0) {
      setFormError('Atenção: O preço de custo é maior que o de venda. Isso resultará em prejuízo.');
      return;
    }

    if (hasVariations && variations.length === 0) {
      setFormError('Adicione pelo menos uma variação ou desative a opção de variações.');
      return;
    }

    const finalStock = itemType === 'PHYSICAL' 
      ? (hasVariations ? variations.reduce((acc, v) => acc + (parseInt(v.stock.toString()) || 0), 0) : parseInt(stock))
      : undefined;

    const productData = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name,
      sku: hasVariations ? 'Múltiplos SKUs' : sku,
      category: itemType === 'SERVICE' ? 'Serviços' : category,
      stock: finalStock,
      minStock: itemType === 'PHYSICAL' ? parseInt(minStock) : undefined,
      costPrice: currentCost,
      salePrice: currentSale,
      active: true,
      hasVariations,
      type: itemType,
      variations: (hasVariations && itemType === 'PHYSICAL') ? variations : [],
      estimatedDuration: itemType === 'SERVICE' ? estimatedDuration : undefined
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts(prev => [productData, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesView = activeView === 'ALL' || 
                        (activeView === 'PRODUCTS' && p.type !== 'SERVICE') || 
                        (activeView === 'SERVICES' && p.type === 'SERVICE');
    return matchesSearch && matchesView;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Estoque & Catálogo</h1>
          <p className="text-slate-500 text-[10px] md:text-sm font-medium">Gerencie produtos e serviços de sua unidade.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="hidden md:flex items-center justify-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-all text-sm">
            <Printer size={18} className="mr-2" /> Imprimir
          </button>
          <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-sm uppercase tracking-widest">
            <Plus size={18} className="mr-2" /> Novo Item
          </button>
        </div>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 no-print">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button onClick={() => setActiveView('ALL')} className={`flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
            <LayoutGrid size={14} className="mr-1.5" /> Todos
          </button>
          <button onClick={() => setActiveView('PRODUCTS')} className={`flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'PRODUCTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
            <Package size={14} className="mr-1.5" /> Produtos
          </button>
          <button onClick={() => setActiveView('SERVICES')} className={`flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeView === 'SERVICES' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}>
            <Wrench size={14} className="mr-1.5" /> Serviços
          </button>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-indigo-500/5 text-sm outline-none font-bold" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item / Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque / Tempo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço de Venda</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((p) => {
                const isService = p.type === 'SERVICE';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-all shadow-sm ${isService ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'} group-hover:scale-110`}>
                          {isService ? <Zap size={20} /> : <Package size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {p.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {isService ? (
                        <div className="flex items-center text-xs font-bold text-violet-600">
                          <Clock size={14} className="mr-1.5" /> {p.estimatedDuration || 'Tempo não definido'}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className={`text-sm font-black ${p.stock! <= p.minStock! ? 'text-rose-600' : 'text-slate-700'}`}>{p.stock} un</span>
                            {p.stock! <= p.minStock! && <AlertTriangle size={14} className="ml-2 text-rose-500 animate-pulse" />}
                          </div>
                          {p.hasVariations && <span className="text-[9px] font-bold text-indigo-400 uppercase">{p.variations?.length} Variações</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-base font-black text-slate-900">{formatToBRL(p.salePrice)}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Lucro: {formatToBRL(p.salePrice - p.costPrice)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isService ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {isService ? 'Serviço' : 'Produto'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button onClick={() => setActiveMenu(activeMenu === p.id ? null : p.id)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                        <MoreVertical size={18} />
                      </button>
                      {activeMenu === p.id && (
                        <div className="absolute right-12 top-14 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-100">
                          <button onClick={() => handleOpenModal(p)} className="w-full flex items-center px-4 py-2 text-sm text-slate-600 font-bold hover:bg-slate-50 transition-colors"><Edit2 size={14} className="mr-3" /> Editar</button>
                          <button onClick={() => handleDelete(p.id)} className="w-full flex items-center px-4 py-2 text-sm text-rose-600 font-bold hover:bg-rose-50 transition-colors"><Trash2 size={14} className="mr-3" /> Excluir</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 no-print pb-20">
        {filteredProducts.map((p) => {
          const isService = p.type === 'SERVICE';
          const isStockLow = !isService && p.stock! <= p.minStock!;
          return (
            <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group">
               <div className={`absolute top-0 right-0 w-1 h-full ${isService ? 'bg-violet-400' : isStockLow ? 'bg-rose-400' : 'bg-indigo-400'}`}></div>
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isService ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {isService ? <Zap size={18} /> : <Package size={18} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-900 truncate pr-2">{p.name}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-300 hover:text-indigo-600 active:bg-slate-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
               </div>
               
               <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Disponibilidade</span>
                    {isService ? (
                      <div className="flex items-center text-xs font-black text-violet-600">
                        <Clock size={12} className="mr-1" /> {p.estimatedDuration || 'N/A'}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className={`text-sm font-black ${isStockLow ? 'text-rose-600' : 'text-slate-700'}`}>{p.stock} un</span>
                        {isStockLow && <AlertTriangle size={12} className="ml-1.5 text-rose-500 animate-pulse" />}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Venda</span>
                    <p className="text-base font-black text-slate-900 leading-none">{formatToBRL(p.salePrice)}</p>
                  </div>
               </div>

               <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(p)} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Visualizar</button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={16} /></button>
               </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200 border border-dashed border-slate-200">
                <Search size={32} />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase">Nenhum item encontrado</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] md:max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8 border-b border-slate-50 bg-slate-50/30 shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">{editingProduct ? 'Editar Cadastro' : 'Novo Cadastro'}</h2>
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Produtos ou Mão de Obra</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 md:p-3 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm"><X size={20} /></button>
            </div>
            
            <form className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1" onSubmit={handleSubmit}>
              <div className="flex gap-2 md:gap-4 p-1 md:p-1.5 bg-slate-100 rounded-xl md:rounded-2xl w-full">
                <button type="button" onClick={() => setItemType('PHYSICAL')} className={`flex-1 flex items-center justify-center py-3 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase transition-all ${itemType === 'PHYSICAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                  <Package size={16} className="mr-1.5 md:mr-2" /> Físico
                </button>
                <button type="button" onClick={() => setItemType('SERVICE')} className={`flex-1 flex items-center justify-center py-3 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase transition-all ${itemType === 'SERVICE' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}>
                  <Zap size={16} className="mr-1.5 md:mr-2" /> Serviço
                </button>
              </div>

              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs flex items-center font-bold">
                  <AlertCircle size={16} className="mr-2 shrink-0" /> {formError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição do Item</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none shadow-sm" placeholder={itemType === 'PHYSICAL' ? "Ex: iPhone 13 Pro Max" : "Ex: Mão de Obra Troca de Conector"} required />
                </div>
                
                {itemType === 'PHYSICAL' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none shadow-sm cursor-pointer appearance-none">
                        <option>Peças</option><option>Acessórios</option><option>Eletrônicos</option><option>Hardware</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
                        Alerta de Estoque Baixo
                        <div className="group relative">
                          <Info size={12} className="text-slate-300 hover:text-indigo-400 cursor-help transition-colors" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Define o limite mínimo para que o sistema exiba o ícone de aviso de reposição.
                          </div>
                        </div>
                      </label>
                      <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none shadow-sm" placeholder="Ex: 5" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tempo Estimado</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)} className="w-full pl-12 md:pl-14 pr-6 py-3.5 md:py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none shadow-sm" placeholder="Ex: 60 min" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identificador (SKU)</label>
                      <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none shadow-sm" placeholder="SRV-001" />
                    </div>
                  </>
                )}

                {itemType === 'PHYSICAL' && (
                  <div className="md:col-span-2 p-6 md:p-8 bg-indigo-50/30 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Layers size={18} className="text-indigo-600" />
                        <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">Variações</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={hasVariations} onChange={(e) => setHasVariations(e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 md:w-12 md:h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 md:after:h-5 after:w-4 md:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {hasVariations ? (
                      <div className="space-y-3">
                        {variations.map((v) => (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm" key={v.id}>
                            <div className="md:col-span-1">
                              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Nome</label>
                              <input type="text" value={v.name} onChange={(e) => handleUpdateVariation(v.id, 'name', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-xs font-black outline-none" placeholder="Ex: Preto" required />
                            </div>
                            <div className="md:col-span-1">
                              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">SKU</label>
                              <input type="text" value={v.sku} onChange={(e) => handleUpdateVariation(v.id, 'sku', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-xs font-black outline-none" placeholder="SKU-VAR" required />
                            </div>
                            <div className="md:col-span-1">
                              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Estoque</label>
                              <input type="number" value={v.stock} onChange={(e) => handleUpdateVariation(v.id, 'stock', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-xs font-black outline-none" />
                            </div>
                            <div className="flex items-end justify-end">
                              <button type="button" onClick={() => handleRemoveVariation(v.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddVariation} className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 text-[10px] font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 uppercase">
                          <Plus size={16} /> Adicionar Variação
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">SKU Principal</label>
                          <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-sm font-black outline-none" placeholder="SKU-PROD" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Estoque Disponível</label>
                          <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-sm font-black outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 p-6 md:p-10 bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center">
                        <DollarSign size={10} className="mr-1" /> Custo Unitário (R$)
                      </label>
                      <input type="text" value={costValue} onChange={e => setCostValue(maskCurrencyInput(e.target.value))} className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm md:text-base font-black outline-none transition-all shadow-sm" placeholder="0,00" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center">
                        <TrendingUp size={10} className="mr-1" /> Preço de Venda (R$)
                      </label>
                      <input type="text" value={saleValue} onChange={e => setSaleValue(maskCurrencyInput(e.target.value))} className={`w-full px-5 md:px-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm md:text-lg font-black outline-none transition-all shadow-sm ${itemType === 'SERVICE' ? 'text-violet-600' : 'text-indigo-600'}`} placeholder="0,00" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-6 pt-6 border-t border-slate-200">
                    <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 text-center shadow-sm">
                       <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Estimado</p>
                       <p className={`text-sm md:text-2xl font-black ${currentProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{formatToBRL(currentProfit)}</p>
                    </div>
                    <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 text-center shadow-sm">
                       <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Margem Bruta</p>
                       <p className={`text-sm md:text-2xl font-black ${currentMargin >= 30 ? 'text-emerald-600' : 'text-amber-500'}`}>{currentMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 sticky bottom-0 bg-white py-4 md:py-6 border-t border-slate-50">
                <button type="submit" className={`w-full py-4 md:py-5 text-white rounded-[1.2rem] md:rounded-[1.5rem] font-black shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] md:text-xs ${itemType === 'SERVICE' ? 'bg-violet-600 shadow-violet-200 hover:bg-violet-700' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'}`}>
                  <CheckCircle2 size={18} /> {editingProduct ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
