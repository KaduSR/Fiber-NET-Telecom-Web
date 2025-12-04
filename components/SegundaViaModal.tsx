
import React, { useState } from 'react';
import { FileText, Search, Loader2, X, Copy, QrCode, Download, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import Button from './Button';
import { ENDPOINTS, API_BASE_URL } from '../src/config';

interface SegundaViaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Boleto {
  id: number;
  documento: string;
  valor: string;
  data_vencimento: string;
  status: string;
  linha_digitavel?: string;
  pix_txid?: string;
  pix_qrcode?: string;
  boleto_pdf_link?: string;
  clienteNome?: string;
  diasVencimento?: number;
}

const SegundaViaModal: React.FC<SegundaViaModalProps> = ({ isOpen, onClose }) => {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [error, setError] = useState('');
  const [resumo, setResumo] = useState<any>(null);
  
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [activePixCode, setActivePixCode] = useState('');
  const [isPixCopied, setIsPixCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Formatar CPF/CNPJ
  const formatarCpfCnpj = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    
    if (numeros.length <= 11) {
      // CPF: 000.000.000-00
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numeros
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCpfCnpj(e.target.value);
    setCpfCnpj(formatted);
  };

  const buscarBoletos = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numerosSomenente = cpfCnpj.replace(/\D/g, '');
    
    if (numerosSomenente.length !== 11 && numerosSomenente.length !== 14) {
      setError('Por favor, digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
      return;
    }

    setLoading(true);
    setError('');
    setBoletos([]);
    setResumo(null);

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.INVOICES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpfCnpj: numerosSomenente }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao buscar boletos');
      }

      const data = await response.json();
      
      if (data.boletos && data.boletos.length > 0) {
        setBoletos(data.boletos);
        setResumo(data.resumo);
      } else {
        setError('Nenhuma fatura em aberto encontrada para este CPF/CNPJ.');
      }

    } catch (err: any) {
      console.error('Erro ao buscar boletos:', err);
      setError(err.message || 'Erro ao buscar boletos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const abrirPixModal = (codigo: string) => {
    setActivePixCode(codigo);
    setPixModalOpen(true);
    setIsPixCopied(false);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(activePixCode);
    setIsPixCopied(true);
    setTimeout(() => setIsPixCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vencido': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Vence Hoje': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Vence em Breve': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-4xl bg-fiber-card border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-neutral-900 p-6 border-b border-white/5 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-fiber-orange/10 rounded-lg">
                <FileText size={24} className="text-fiber-orange" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">2ª Via de Boleto</h2>
                <p className="text-sm text-gray-400">Consulte suas faturas por CPF ou CNPJ</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Form */}
            <form onSubmit={buscarBoletos} className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={handleInputChange}
                    placeholder="Digite seu CPF ou CNPJ"
                    className="w-full h-14 pl-12 pr-4 bg-neutral-900 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:border-fiber-orange focus:ring-1 focus:ring-fiber-orange transition-all"
                    maxLength={18}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="h-14 md:w-48 text-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Buscando...</>
                  ) : (
                    <><Search size={20} /> Buscar</>
                  )}
                </Button>
              </div>
            </form>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-6 animate-fadeIn">
                <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Resumo */}
            {resumo && (
              <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-6 animate-fadeIn">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="text-fiber-green" size={20} />
                  Resumo Financeiro
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-fiber-orange">{resumo.totalBoletos}</div>
                    <div className="text-xs text-gray-400 mt-1">Total de Faturas</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{resumo.totalEmAbertoFormatado}</div>
                    <div className="text-xs text-gray-400 mt-1">Valor Total</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{resumo.boletosVencidos}</div>
                    <div className="text-xs text-gray-400 mt-1">Vencidas</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{resumo.boletosAVencer}</div>
                    <div className="text-xs text-gray-400 mt-1">A Vencer</div>
                  </div>
                </div>
              </div>
            )}

            {/* Boletos */}
            {boletos.length > 0 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-white font-bold text-lg mb-4">Faturas Encontradas</h3>
                
                {boletos.map((boleto) => (
                  <div 
                    key={boleto.id} 
                    className="bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(boleto.status)}`}>
                            {boleto.status}
                          </span>
                          {boleto.clienteNome && (
                            <span className="text-gray-400 text-sm">{boleto.clienteNome}</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Vencimento</span>
                            <span className="text-lg font-bold text-white">{boleto.data_vencimento}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Valor</span>
                            <span className="text-lg font-bold text-fiber-orange">R$ {boleto.valor}</span>
                          </div>
                        </div>

                        {boleto.diasVencimento !== undefined && (
                          <div className="mt-3 text-sm text-gray-400">
                            {boleto.diasVencimento < 0 
                              ? `Vencido há ${Math.abs(boleto.diasVencimento)} dia(s)` 
                              : boleto.diasVencimento === 0 
                                ? 'Vence hoje!' 
                                : `Vence em ${boleto.diasVencimento} dia(s)`
                            }
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        {boleto.pix_txid && (
                          <button
                            onClick={() => abrirPixModal(boleto.pix_txid!)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-green/10 hover:bg-fiber-green/20 text-fiber-green rounded-lg font-bold text-sm border border-fiber-green/30 transition-all"
                          >
                            <QrCode size={18} /> PIX Copia e Cola
                          </button>
                        )}

                        {boleto.linha_digitavel && (
                          <button
                            onClick={() => copiarCodigo(boleto.linha_digitavel!, `bar-${boleto.id}`)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-sm border border-white/10 transition-all"
                          >
                            {copiedId === `bar-${boleto.id}` ? (
                              <><CheckCircle size={18} className="text-green-400" /> Copiado!</>
                            ) : (
                              <><Copy size={18} /> Copiar Código</>
                            )}
                          </button>
                        )}

                        {boleto.boleto_pdf_link && (
                          <button
                            onClick={() => window.open(boleto.boleto_pdf_link, '_blank')}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-fiber-orange/10 hover:bg-fiber-orange/20 text-fiber-orange rounded-lg font-bold text-sm border border-fiber-orange/30 transition-all"
                          >
                            <Download size={18} /> Baixar PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && boletos.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Digite seu CPF ou CNPJ para buscar suas faturas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIX Modal */}
      {pixModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-fiber-card border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <button 
              onClick={() => setPixModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white text-center mb-4">Pagamento PIX</h3>
            
            <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4">
              <QrCode size={200} className="text-neutral-900" />
            </div>

            <div className="bg-neutral-900 p-3 rounded-lg mb-4 max-h-20 overflow-y-auto">
              <p className="text-xs text-gray-400 font-mono break-all">{activePixCode}</p>
            </div>

            <Button 
              onClick={copiarPix}
              fullWidth
              variant="primary"
              className="gap-2 !bg-fiber-green hover:!bg-green-600"
            >
              {isPixCopied ? (
                <><CheckCircle size={20} /> Código Copiado!</>
              ) : (
                <><Copy size={20} /> Copiar Código PIX</>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default SegundaViaModal;
