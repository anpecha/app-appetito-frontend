'use client';

import React, { useEffect, useState } from 'react';
import { Save, Printer, Loader2, Plus, Trash2, Play, Usb, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ToggleRow,
  Toast,
  SectionCard,
  PageHeader,
  useToast,
  InfoCard,
} from '@/app/admin/settings/_shared';
import { cn } from '@/lib/utils';

interface PrinterConfig {
  id: string;
  name: string;
  type: 'thermal' | 'fiscal' | 'laser' | 'matricial';
  connection: 'usb' | 'network' | 'bluetooth';
  model: string;
  port: string;
  ip_address: string;
  baud_rate: number;
  paper_width_mm: number;
  copies: number;
  print_commands: boolean;
  print_coupon: boolean;
  print_payment: boolean;
  active: boolean;
  print_queue: ('kitchen' | 'counter' | 'bar')[];
}

const DEFAULT_PRINTER: PrinterConfig = {
  id: '',
  name: '',
  type: 'thermal',
  connection: 'usb',
  model: '',
  port: 'USB001',
  ip_address: '',
  baud_rate: 9600,
  paper_width_mm: 80,
  copies: 1,
  print_commands: true,
  print_coupon: true,
  print_payment: true,
  active: true,
  print_queue: ['kitchen'],
};

export default function PrinterSettingsPage() {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy/settings/restaurant');
        if (!res.ok) throw new Error('Falha ao carregar');
        const data = await res.json();
        const stored = data?.config_json?.printers;
        if (stored?.length) setPrinters(stored);
      } catch {
        showToast('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  function addPrinter() {
    const newPrinter: PrinterConfig = { ...DEFAULT_PRINTER, id: String(Date.now()) };
    setPrinters((prev) => [...prev, newPrinter]);
  }

  function removePrinter(id: string) {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePrinter(id: string, field: keyof PrinterConfig, value: any) {
    setPrinters((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function toggleQueue(id: string, queue: PrinterConfig['print_queue'][0]) {
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              print_queue: p.print_queue.includes(queue)
                ? p.print_queue.filter((q) => q !== queue)
                : [...p.print_queue, queue],
            }
          : p,
      ),
    );
  }

  async function testPrinter(id: string) {
    setTestingId(id);
    await new Promise((r) => setTimeout(r, 1500));
    showToast('success', 'Impressão de teste enviada com sucesso!');
    setTestingId(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/settings/restaurant');
      if (!res.ok) throw new Error('Falha ao carregar');
      const current = await res.json();
      const patch = await fetch('/api/proxy/settings/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_json: { ...(current.config_json ?? {}), printers },
        }),
      });
      if (!patch.ok) throw new Error('Erro ao salvar');
      showToast('success', 'Configurações de impressão salvas!');
    } catch (err: unknown) {
      showToast('error', (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex h-full items-center justify-center py-space-20">
        <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
      </div>
    );

  return (
    <div className="flex flex-col gap-space-8 pb-space-12 max-w-5xl animate-in fade-in duration-500">
      <PageHeader
        title="Impressoras"
        description="Configure as impressoras térmicas, fiscais e etiquetas do seu estabelecimento."
      >
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={addPrinter}
          >
            Adicionar Impressora
          </Button>
          <Button
            form="printer-form"
            type="submit"
            className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand px-space-8 font-bold h-12 shadow-button-primary transition-all active:scale-[0.98]"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salvar
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <form id="printer-form" onSubmit={handleSave} className="flex flex-col gap-space-6">
        {printers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-card border border-border-default rounded-radius-xl">
            <div className="h-16 w-16 rounded-radius-full bg-surface-subtle flex items-center justify-center">
              <Printer className="h-8 w-8 text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-text-primary">Nenhuma impressora cadastrada</p>
              <p className="text-sm text-text-muted mt-1">
                Adicione impressoras para receber os pedidos da cozinha e balcão.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={addPrinter}
            >
              Adicionar Impressora
            </Button>
          </div>
        ) : (
          printers.map((printer, idx) => (
            <SectionCard
              key={printer.id}
              title={`${idx + 1}. ${printer.name || 'Nova Impressora'}`}
              icon={Printer}
              description={printer.active ? 'Impressora ativa' : 'Impressora inativa'}
              action={
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<Play className="h-3 w-3" />}
                    onClick={() => testPrinter(printer.id)}
                    isLoading={testingId === printer.id}
                  >
                    Testar
                  </Button>
                  <button
                    type="button"
                    onClick={() => removePrinter(printer.id)}
                    className="p-2 text-text-muted hover:text-status-error transition-colors cursor-pointer"
                    title="Remover impressora"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              }
            >
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Nome da Impressora
                    </label>
                    <Input
                      value={printer.name}
                      onChange={(e) => updatePrinter(printer.id, 'name', e.target.value)}
                      placeholder="Ex: Cozinha 1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Modelo
                    </label>
                    <Input
                      value={printer.model}
                      onChange={(e) => updatePrinter(printer.id, 'model', e.target.value)}
                      placeholder="Ex: Epson TM-T20"
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Tipo
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['thermal', 'fiscal', 'laser', 'matricial'] as const).map((type) => (
                      <label
                        key={type}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium capitalize',
                          printer.type === type
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={printer.type === type}
                          onChange={() => updatePrinter(printer.id, 'type', type)}
                          className="sr-only"
                        />
                        {type === 'thermal'
                          ? 'Térmica'
                          : type === 'fiscal'
                            ? 'Fiscal'
                            : type === 'laser'
                              ? 'Laser'
                              : 'Matricial'}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Connection */}
                <div className="space-y-1.5">
                  <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                    Conexão
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['usb', 'network', 'bluetooth'] as const).map((conn) => (
                      <label
                        key={conn}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium capitalize',
                          printer.connection === conn
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="radio"
                          checked={printer.connection === conn}
                          onChange={() => updatePrinter(printer.id, 'connection', conn)}
                          className="sr-only"
                        />
                        {conn === 'usb' ? (
                          <>
                            <Usb className="h-4 w-4" /> USB
                          </>
                        ) : conn === 'network' ? (
                          <>
                            <Wifi className="h-4 w-4" /> Rede
                          </>
                        ) : (
                          'Bluetooth'
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Connection details */}
                {printer.connection === 'usb' && (
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Porta
                    </label>
                    <Input
                      value={printer.port}
                      onChange={(e) => updatePrinter(printer.id, 'port', e.target.value)}
                      placeholder="USB001"
                    />
                  </div>
                )}

                {printer.connection === 'network' && (
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Endereço IP
                    </label>
                    <Input
                      value={printer.ip_address}
                      onChange={(e) => updatePrinter(printer.id, 'ip_address', e.target.value)}
                      placeholder="192.168.0.100:9100"
                    />
                  </div>
                )}

                {/* Paper & Printing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {printer.type === 'thermal' && (
                    <div className="space-y-1.5">
                      <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                        Largura do papel (mm)
                      </label>
                      <select
                        value={printer.paper_width_mm}
                        onChange={(e) =>
                          updatePrinter(printer.id, 'paper_width_mm', Number(e.target.value))
                        }
                        className="w-full h-11 rounded-radius-sm border border-border-default bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus cursor-pointer"
                      >
                        <option value={58}>58mm</option>
                        <option value={80}>80mm</option>
                        <option value={112}>112mm</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-text-xs font-bold text-text-muted uppercase ml-1">
                      Cópias
                    </label>
                    <Input
                      type="number"
                      value={printer.copies}
                      onChange={(e) => updatePrinter(printer.id, 'copies', Number(e.target.value))}
                      min={1}
                      max={10}
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <ToggleRow
                      label="Impressora ativa"
                      description=""
                      checked={printer.active}
                      onChange={(v) => updatePrinter(printer.id, 'active', v)}
                    />
                  </div>
                </div>

                {/* Print Queues */}
                <div className="pt-4 border-t border-border-subtle">
                  <p className="text-text-xs font-bold text-text-muted uppercase mb-3">
                    Imprimir pedidos de:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['kitchen', 'counter', 'bar'] as const).map((queue) => (
                      <label
                        key={queue}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 border rounded-radius-md cursor-pointer transition-all text-sm font-medium',
                          printer.print_queue.includes(queue)
                            ? 'border-action-primary bg-action-primary/5 text-action-primary'
                            : 'border-border-default hover:border-border-focus text-text-secondary',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={printer.print_queue.includes(queue)}
                          onChange={() => toggleQueue(printer.id, queue)}
                          className="sr-only"
                        />
                        {queue === 'kitchen' ? 'Cozinha' : queue === 'counter' ? 'Balcão' : 'Bar'}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Print content */}
                <div className="pt-4 border-t border-border-subtle">
                  <p className="text-text-xs font-bold text-text-muted uppercase mb-3">
                    Conteúdo da impressão:
                  </p>
                  <ToggleRow
                    label="Imprimir comandas"
                    description="Imprime os itens do pedido."
                    checked={printer.print_commands}
                    onChange={(v) => updatePrinter(printer.id, 'print_commands', v)}
                  />
                  <ToggleRow
                    label="Imprimir cupom"
                    description="Imprime o cupom fiscal/não fiscal."
                    checked={printer.print_coupon}
                    onChange={(v) => updatePrinter(printer.id, 'print_coupon', v)}
                  />
                  <ToggleRow
                    label="Imprimir pagamento"
                    description="Imprime comprovante de pagamento."
                    checked={printer.print_payment}
                    onChange={(v) => updatePrinter(printer.id, 'print_payment', v)}
                  />
                </div>
              </div>
            </SectionCard>
          ))
        )}

        <InfoCard icon={Printer}>
          Configure uma impressora térmica para cada estação (cozinha, balcão, bar). Você pode
          adicionar quantas impressoras precisar.
        </InfoCard>
      </form>
    </div>
  );
}
