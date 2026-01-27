
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Package, X, Edit2, Trash2, Zap
} from 'lucide-react';
import { ProductVariation } from '../types';
import { databaseService } from '../services/databaseService';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Inventory: React.FC = () => {
  const STORAGE_KEY = 'multiplus_inventory';
  const TABLE_NAME = 'inventory';
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await databaseService.fetch<any>(TABLE_NAME, STORAGE_KEY);
      setProducts(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const syncProducts = async (newData: any[]) => {
    setProducts(newData);
    await databaseService.save(TABLE_NAME, STORAGE_KEY, newData);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<'ALL' | 'PRODUCTS' | 'SERVICES'>('ALL');

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Geral');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('5');
  const [costValue, setCostValue] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [itemType, setItemType] = useState<'PHYSICAL' | 'SERVICE'>('PHYSICAL');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  const maskCurrencyInput = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '');
    if (!onlyDigits) return '';
    return (Number(onlyDigits) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseCurrencyToNumber = (formattedValue: string) => {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.'));
  };

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
      setEditingProduct(null); setName(''); setSku(''); setCategory('Geral'); setStock('0'); setMinStock('5');
      setCostValue(''); setSaleValue(''); setHasVariations(false); setVariations([]); setItemType('PHYSICAL'); setEstimatedDuration('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name, sku, category, stock: itemType === 'PHYSICAL' ? parseInt(stock) : undefined,
      minStock: itemType === 'PHYSICAL' ? parseInt(minStock) : undefined,
      costPrice: parseCurrencyToNumber(costValue), salePrice: parseCurrencyToNumber(saleValue), 
      active: true, hasVariations, type: itemType,
      variations: hasVariations ? variations : [], estimatedDuration
    };
    
    let nextData;
    if (editingProduct) nextData = products.map(p => p.id === editingProduct.id ? productData : p);
    else nextData = [productData, ...products];
    
    await syncProducts(nextData);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesView = activeView === 'ALL' || (activeView === 'PRODUCTS' && p.type !== 'SERVICE') || (activeView === 'SERVICES' && p.type === 'SERVICE');
    return matchesSearch && matchesView;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Estoque & Catálogo Cloud</h1>
          <p className="text-slate-500 text-sm font-medium">Sincronizado com Supabase.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all text-[10px] uppercase tracking-widest">
          <Plus size={18} className="mr-2 inline" /> Cadastrar Novo Item
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button onClick={() => setActiveView('ALL')} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeView === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Todos</button>
          <button onClick={() => setActiveView('PRODUCTS')} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeView === 'PRODUCTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Produtos</button>
          <button onClick={() => setActiveView('SERVICES')} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeView === 'SERVICES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Serviços</button>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Pesquisar catálogo..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">Carregando dados da nuvem...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100">
           <Package size={64} className="mx-auto text-slate-100 mb-6" />
           <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Nenhum item encontrado</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.type === 'SERVICE' ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'}`}>
                   {p.type === 'SERVICE' ? <Zap size={22} /> : <Package size={22} />}
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{formatToBRL(p.salePrice)}</p>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{p.type}</span>
                </div>
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1 truncate">{p.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">SKU: {p.sku || 'N/A'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <div className="text-[10px] font-black uppercase text-slate-500">
                    {p.type === 'SERVICE' ? p.estimatedDuration : `${p.stock} em estoque`}
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={async () => { if(confirm('Excluir?')) await syncProducts(products.filter(x => x.id !== p.id)) }} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingProduct ? 'Editar Item' : 'Novo Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
             </div>
             <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                   <button type="button" onClick={() => setItemType('PHYSICAL')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${itemType === 'PHYSICAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Produto Físico</button>
                   <button type="button" onClick={() => setItemType('SERVICE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${itemType === 'SERVICE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Serviço</button>
                </div>
                <div className="space-y-4">
                   <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Nome do Item..." required />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">SKU / Código</label>
                        <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Código de Barras ou Interno" />
                      </div>
                      {itemType === 'PHYSICAL' ? (
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{editingProduct ? 'Estoque Atual (Ajuste)' : 'Estoque Inicial (Entrada)'}</label>
                           <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder={editingProduct ? 'Quantidade atual...' : 'Quantidade inicial...'} />
                        </div>
                      ) : (
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Duração Estimada</label>
                           <input type="text" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Ex: 30 dias, 2 horas" />
                        </div>
                      )}
                   </div>
                   {itemType === 'PHYSICAL' && (
                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estoque Mínimo (Alerta)</label>
                       <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Qtd para alerta de reposição" />
                     </div>
                   )}
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Custo (R$)</label>
                        <input type="text" value={costValue} onChange={e => setCostValue(maskCurrencyInput(e.target.value))} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="0,00" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Venda (R$)</label>
                        <input type="text" value={saleValue} onChange={e => setSaleValue(maskCurrencyInput(e.target.value))} className="w-full px-6 py-4 bg-indigo-50 border-none rounded-2xl text-sm font-black text-indigo-600 outline-none" placeholder="0,00" required />
                      </div>
                   </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">Sincronizar Item</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};