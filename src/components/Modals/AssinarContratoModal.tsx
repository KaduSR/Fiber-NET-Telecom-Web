import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';

interface AssinarContratoModalProps {
  contratoId: number;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
}

interface TermoPendente {
  id: number;
  descricao: string; // Conteúdo do termo
  // Outros campos relevantes do termo
}

export const AssinarContratoModal: React.FC<AssinarContratoModalProps> = ({
  contratoId,
  onClose,
  onSuccess,
  isOpen,
}) => {
  const [termosPendentes, setTermosPendentes] = useState<TermoPendente[]>([]);
  const [termoSelecionado, setTermoSelecionado] = useState<TermoPendente | null>(null);
  const [aceito, setAceito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contratoId) {
      const fetchTermos = async () => {
        setLoading(true);
        setError(null);
        try {
          // TODO: Chamar API do Backend para listar termos pendentes
          // Ex: const termos = await ixcService.listarTermosPendentes(contratoId);
          const termos: TermoPendente[] = [
            { id: 1, descricao: 'Este é o termo de contrato de número 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit...' },
            { id: 2, descricao: 'Este é o termo de contrato de número 2. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...' },
          ]; // Mock data

          setTermosPendentes(termos);
          if (termos.length > 0) {
            setTermoSelecionado(termos[0]); // Seleciona o primeiro termo por padrão
          }
        } catch (err) {
          console.error('Erro ao buscar termos pendentes:', err);
          setError('Não foi possível carregar os termos pendentes.');
        } finally {
          setLoading(false);
        }
      };
      fetchTermos();
    }
  }, [isOpen, contratoId]);

  const handleAssinar = async () => {
    if (!termoSelecionado || !aceito) return;

    setLoading(true);
    setError(null);
    try {
      // TODO: Chamar API do Backend para assinar termo e ativar contrato
      // const ipCliente = '127.0.0.1'; // Obter IP real do cliente
      // await ixcService.assinarTermo(termoSelecionado.id, ipCliente);
      // await contratosResource.ativar(contratoId); // Ativa o contrato após assinar

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay da API
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao assinar termo:', err);
      setError('Não foi possível assinar o contrato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Assinar Contrato Digital</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </DialogHeader>

        {loading && <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-fiber-blue" size={32} /></div>}
        {error && <p className="text-red-500 text-center p-4">{error}</p>}

        {!loading && !error && termosPendentes.length === 0 && (
          <div className="text-center p-8 text-gray-400">
            <p>Nenhum termo pendente encontrado para este contrato.</p>
            <Button onClick={onClose} className="mt-4">Fechar</Button>
          </div>
        )}

        {!loading && !error && termoSelecionado && (
          <div className="flex-1 overflow-auto p-4 rounded-md border border-white/10 bg-black/30 text-gray-300 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-fiber-blue scrollbar-track-transparent">
            <h3 className="font-bold text-lg mb-4 text-white">{`Termo ${termoSelecionado.id}`}</h3>
            <div dangerouslySetInnerHTML={{ __html: termoSelecionado.descricao.replace(/\n/g, '<br/>') }} />
          </div>
        )}

        {!loading && !error && termoSelecionado && (
          <div className="flex flex-col gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms-accept"
                checked={aceito}
                onCheckedChange={(checked: boolean) => setAceito(checked)}
                className="data-[state=checked]:bg-fiber-blue data-[state=checked]:text-white"
              />
              <label
                htmlFor="terms-accept"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
              >
                Li e aceito os termos do contrato.
              </label>
            </div>
            <Button
              onClick={handleAssinar}
              disabled={!aceito || loading}
              className="w-full bg-fiber-blue hover:bg-fiber-blue/90 text-white font-bold py-2 px-4 rounded-md transition-all duration-300"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Assinar Contrato
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
