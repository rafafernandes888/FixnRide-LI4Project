import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Euro, Wrench, Calendar, ShoppingCart, Undo2, X, ChevronRight } from "lucide-react";
import { statsService } from "../../services/statsService";

const MODO_ALLTIME = "alltime";
const MODO_DIA = "dia";
const MODO_INTERVALO = "intervalo";

const TEXT1 = "#f1f5f9";
const TEXT2 = "#475569";
const TEXT3 = "#94a3b8";
const CARD = "rgba(255,255,255,0.04)";
const CARD_HOVER = "rgba(255,255,255,0.06)";
const BORDER = "rgba(255,255,255,0.07)";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [modo, setModo] = useState(MODO_ALLTIME);
  const [dia, setDia] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const formatarParaDataLocal = (dataStr) => {
    if (!dataStr) return null;
    const [ano, mes, d] = dataStr.split("-").map(Number);
    return new Date(ano, mes - 1, d);
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      let dados;
      if (modo === MODO_DIA && dia) dados = await statsService.getEstatisticasDia(dia);
      else if (modo === MODO_INTERVALO && inicio && fim) dados = await statsService.getEstatisticasIntervalo(inicio, fim);
      else dados = await statsService.getEstatisticasGlobais();
      setStats(dados);
    } catch (e) {
      setErro(e.message ?? "Erro a obter estatísticas.");
    } finally {
      setLoading(false);
    }
  }, [modo, dia, inicio, fim]);

  useEffect(() => {
    if (modo === MODO_ALLTIME) carregar();
  }, [modo, carregar]);

  const aplicarFiltro = () => {
    if (modo === MODO_DIA && !dia) return;
    if (modo === MODO_INTERVALO && (!inicio || !fim)) return;
    carregar();
  };

  const limparFiltros = () => {
    setDia("");
    setInicio("");
    setFim("");
    setModo(MODO_ALLTIME);
  };

  const rotuloPeriodo = (() => {
    if (modo === MODO_DIA && dia) {
      const d = formatarParaDataLocal(dia);
      return `Dia ${d.toLocaleDateString("pt-PT")}`;
    }
    if (modo === MODO_INTERVALO && inicio && fim) {
      const i = formatarParaDataLocal(inicio);
      const f = formatarParaDataLocal(fim);
      return `${i.toLocaleDateString("pt-PT")} — ${f.toLocaleDateString("pt-PT")}`;
    }
    return "All time";
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mb-1">Dashboard Executivo</h1>
          <p className="text-sm" style={{ color: TEXT2 }}>
            Métricas operacionais e financeiras · <span style={{ color: TEXT3 }}>{rotuloPeriodo}</span>
          </p>
        </div>

        {/* Period filter pills */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {[
            { id: MODO_ALLTIME, label: "All time" },
            { id: MODO_DIA, label: "Dia" },
            { id: MODO_INTERVALO, label: "Intervalo" },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => { setModo(p.id); if (p.id === MODO_ALLTIME) limparFiltros(); }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border"
              style={{
                background: modo === p.id ? 'rgba(34,211,238,0.12)' : CARD,
                borderColor: modo === p.id ? 'rgba(34,211,238,0.3)' : BORDER,
                color: modo === p.id ? '#22d3ee' : TEXT2,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date inputs */}
      {modo !== MODO_ALLTIME && (
        <div
          className="rounded-2xl p-4 flex flex-wrap items-end gap-3 border"
          style={{ background: CARD, borderColor: BORDER }}
        >
          {modo === MODO_DIA && (
            <div className="flex flex-col">
              <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: TEXT2 }}>Dia</label>
              <input
                type="date"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm font-semibold border bg-transparent"
                style={{ borderColor: BORDER, color: TEXT1, colorScheme: 'dark' }}
              />
            </div>
          )}
          {modo === MODO_INTERVALO && (
            <>
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: TEXT2 }}>Início</label>
                <input
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold border bg-transparent"
                  style={{ borderColor: BORDER, color: TEXT1, colorScheme: 'dark' }}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: TEXT2 }}>Fim</label>
                <input
                  type="date"
                  value={fim}
                  onChange={(e) => setFim(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold border bg-transparent"
                  style={{ borderColor: BORDER, color: TEXT1, colorScheme: 'dark' }}
                />
              </div>
            </>
          )}
          <button
            onClick={aplicarFiltro}
            className="rounded-xl px-5 py-2 text-sm font-extrabold transition-all"
            style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}
          >
            Aplicar
          </button>
          <button
            onClick={limparFiltros}
            className="rounded-xl px-4 py-2 text-sm font-bold transition-all flex items-center gap-1 border"
            style={{ borderColor: BORDER, color: TEXT2 }}
          >
            <X className="w-3.5 h-3.5" /> Limpar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="font-medium" style={{ color: TEXT2 }}>A carregar estatísticas...</p>
        </div>
      ) : erro || !stats ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-rose-400 font-medium">{erro ?? "Sem dados disponíveis."}</p>
        </div>
      ) : (
        <Conteudo stats={stats} />
      )}
    </div>
  );
}

function Conteudo({ stats }) {
  const [detalhe, setDetalhe] = useState(null);

  const tempoMedioHoras = (stats.TempoMedioServicoMinutos / 60).toFixed(1);
  const faturacaoK = (Number(stats.FaturacaoTotal) / 1000).toFixed(1);

  const cards = [
    { key: "faturacao", label: "Faturação", value: `€${faturacaoK}k`, color: "#22d3ee", glow: "rgba(34,211,238,0.15)", icon: Euro },
    { key: "servicos", label: "Serviços", value: stats.ServicosRealizados, color: "#818cf8", glow: "rgba(129,140,248,0.15)", icon: Wrench },
    { key: "tempo", label: "Tempo Médio", value: `${tempoMedioHoras}h`, color: "#34d399", glow: "rgba(52,211,153,0.15)", icon: Clock },
    { key: "agendamentos", label: "Agendamentos", value: stats.NumeroAgendamentos, color: "#a78bfa", glow: "rgba(167,139,250,0.15)", icon: Calendar },
    { key: "vendas", label: "Vendas", value: stats.NumeroVendas, color: "#fbbf24", glow: "rgba(251,191,36,0.15)", icon: ShoppingCart },
    { key: "devolucoes", label: "Devoluções", value: `€${Number(stats.ValorTotalDevolucoes).toFixed(0)}`, color: "#f87171", glow: "rgba(248,113,113,0.15)", icon: Undo2 },
  ];

  const revenueData = [
    { name: "Serviços", value: Number(stats.FaturacaoServicos), color: "#22d3ee" },
    { name: "Vendas", value: Number(stats.FaturacaoVendas), color: "#818cf8" },
  ];

  const porMes = {};
  for (const m of stats.Movimentacao ?? []) {
    const data = new Date(m.Fatura.DataEmissao);
    const chave = data.toLocaleString("pt-PT", { month: "short" });
    porMes[chave] = (porMes[chave] ?? 0) + Number(m.Valor);
  }
  const movimentacaoData = Object.entries(porMes).map(([mes, valor]) => ({ mes, valor }));

  const totalRevenue = revenueData.reduce((s, r) => s + r.value, 0);
  const pctServicos = totalRevenue > 0 ? Math.round((revenueData[0].value / totalRevenue) * 100) : 0;

  return (
    <>
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((m) => (
          <button
            key={m.key}
            onClick={() => setDetalhe(m.key)}
            className="rounded-2xl p-4 text-left transition-all border hover:-translate-y-0.5"
            style={{
              background: CARD,
              borderColor: BORDER,
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = CARD_HOVER;
              e.currentTarget.style.borderColor = m.color + '40';
              e.currentTarget.style.boxShadow = `0 0 24px ${m.glow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = CARD;
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: m.glow }}
            >
              <m.icon className="w-4 h-4" style={{ color: m.color }} strokeWidth={2.5} />
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: TEXT2 }}>{m.label}</div>
            <div className="text-2xl font-extrabold font-mono tracking-tight mb-1" style={{ color: TEXT1 }}>{m.value}</div>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: TEXT2 }} />
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
        {/* Bar */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: CARD, borderColor: BORDER }}
        >
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="text-sm font-bold mb-0.5" style={{ color: TEXT1 }}>Faturação por Mês</div>
              <div className="text-xs" style={{ color: TEXT2 }}>Em €</div>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: TEXT2 }}>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#22d3ee' }} /> Faturação
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movimentacaoData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: TEXT2, fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT2, fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: '#0f172a', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', color: TEXT1, fontSize: 12 }}
                  labelStyle={{ color: TEXT3 }}
                />
                <Bar dataKey="valor" fill="#22d3ee" radius={[6, 6, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut + breakdown */}
        <div
          className="rounded-2xl p-6 border flex flex-col"
          style={{ background: CARD, borderColor: BORDER }}
        >
          <div className="text-sm font-bold mb-1" style={{ color: TEXT1 }}>Origem da Faturação</div>
          <div className="text-xs mb-4" style={{ color: TEXT2 }}>Serviços vs. Vendas diretas</div>

          <div className="flex justify-center mb-4 relative">
            <ResponsiveContainer width={170} height={170}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {revenueData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} stroke="none" style={{ filter: `drop-shadow(0 0 6px ${entry.color}80)` }} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xl font-extrabold font-mono" style={{ color: TEXT1 }}>{pctServicos}%</div>
              <div className="text-[10px] font-semibold" style={{ color: TEXT2 }}>Serviços</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {revenueData.map((item) => {
              const pct = totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0;
              return (
                <div
                  key={item.name}
                  className="rounded-xl p-3 border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TEXT2 }}>{item.name}</span>
                  </div>
                  <div className="text-base font-extrabold font-mono" style={{ color: TEXT1 }}>€{item.value.toLocaleString()}</div>
                  <div className="text-[10px] font-bold" style={{ color: item.color }}>{pct}% do total</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {detalhe && (
        <DetalheModal chave={detalhe} stats={stats} onClose={() => setDetalhe(null)} />
      )}
    </>
  );
}

function DetalheModal({ chave, stats, onClose }) {
  const configs = {
    tempo: { titulo: "Detalhes · Tempo Médio", icon: Clock, cor: "#34d399" },
    faturacao: { titulo: "Detalhes · Faturação", icon: Euro, cor: "#22d3ee" },
    servicos: { titulo: "Detalhes · Serviços", icon: Wrench, cor: "#818cf8" },
    agendamentos: { titulo: "Detalhes · Agendamentos", icon: Calendar, cor: "#a78bfa" },
    vendas: { titulo: "Detalhes · Vendas", icon: ShoppingCart, cor: "#fbbf24" },
    devolucoes: { titulo: "Detalhes · Devoluções", icon: Undo2, cor: "#f87171" },
  };
  const cfg = configs[chave];
  const Icon = cfg.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4"
      style={{ background: 'rgba(8,15,30,0.7)' }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border shadow-2xl"
        style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <h2 className="text-lg font-extrabold flex items-center gap-3" style={{ color: TEXT1 }}>
            <span
              className="p-2 rounded-xl"
              style={{ background: cfg.cor + '20' }}
            >
              <Icon className="w-5 h-5" style={{ color: cfg.cor }} />
            </span>
            {cfg.titulo}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
            style={{ color: TEXT3 }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {chave === "faturacao" && <DetalheFaturacao stats={stats} />}
          {chave === "tempo" && <DetalheTempo stats={stats} />}
          {chave === "servicos" && <DetalheServicos stats={stats} />}
          {chave === "vendas" && <DetalheVendas stats={stats} />}
          {chave === "agendamentos" && <DetalheAgendamentos stats={stats} />}
          {chave === "devolucoes" && <DetalheDevolucoes stats={stats} />}
        </div>
      </div>
    </div>
  );
}

function Resumo({ rotulo, valor, cor }) {
  return (
    <div
      className="p-4 rounded-2xl border"
      style={{
        background: cor + '15',
        borderColor: cor + '30',
      }}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: TEXT2 }}>{rotulo}</p>
      <p className="text-2xl font-extrabold font-mono mt-1" style={{ color: TEXT1 }}>{valor}</p>
    </div>
  );
}

function SeccaoLista({ titulo, children }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: TEXT2 }}>{titulo}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Vazio({ texto }) {
  return <p className="text-sm font-medium italic p-4 text-center" style={{ color: TEXT2 }}>{texto}</p>;
}

function LinhaFatura({ mov }) {
  const f = mov.Fatura;
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-extrabold truncate" style={{ color: TEXT1 }}>Fatura {f.NumeroFatura}</p>
        <p className="text-xs font-medium" style={{ color: TEXT2 }}>
          NIF {f.ClienteNIF} · {new Date(f.DataEmissao).toLocaleDateString("pt-PT")} · {f.MetodoPagamento}
          {f.ServicoID ? ` · Serviço #${f.ServicoID}` : ""}
          {f.VendaID ? ` · Venda #${f.VendaID}` : ""}
        </p>
      </div>
      <p className="text-base font-extrabold font-mono ml-4" style={{ color: TEXT1 }}>€{Number(mov.Valor).toFixed(2)}</p>
    </div>
  );
}

function DetalheFaturacao({ stats }) {
  const mov = stats.Movimentacao ?? [];
  const servicos = mov.filter((m) => m.Categoria === "SERVICO");
  const vendas = mov.filter((m) => m.Categoria === "VENDA");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Resumo rotulo="Total" valor={`€${Number(stats.FaturacaoTotal).toFixed(2)}`} cor="#94a3b8" />
        <Resumo rotulo="Serviços" valor={`€${Number(stats.FaturacaoServicos).toFixed(2)}`} cor="#22d3ee" />
        <Resumo rotulo="Vendas" valor={`€${Number(stats.FaturacaoVendas).toFixed(2)}`} cor="#818cf8" />
      </div>
      <SeccaoLista titulo={`Faturas de Serviços (${servicos.length})`}>
        {servicos.length === 0 ? <Vazio texto="Sem faturas de serviços no período." /> : servicos.map((m) => <LinhaFatura key={m.Fatura.NumeroFatura} mov={m} />)}
      </SeccaoLista>
      <SeccaoLista titulo={`Faturas de Vendas (${vendas.length})`}>
        {vendas.length === 0 ? <Vazio texto="Sem faturas de vendas no período." /> : vendas.map((m) => <LinhaFatura key={m.Fatura.NumeroFatura} mov={m} />)}
      </SeccaoLista>
    </div>
  );
}

function DetalheTempo({ stats }) {
  const horas = (stats.TempoMedioServicoMinutos / 60).toFixed(2);
  return (
    <div className="space-y-3">
      <Resumo rotulo="Tempo Médio por Intervenção" valor={`${horas}h (${stats.TempoMedioServicoMinutos.toFixed(0)} min)`} cor="#34d399" />
      <p className="text-sm font-medium" style={{ color: TEXT2 }}>
        Cálculo baseado em todas as intervenções registadas nos serviços do período. Quanto mais intervenções concluídas, mais preciso é o valor.
      </p>
    </div>
  );
}

function DetalheServicos({ stats }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Resumo rotulo="Concluídos" valor={stats.ServicosRealizados} cor="#818cf8" />
        <Resumo rotulo="Faturação Gerada" valor={`€${Number(stats.FaturacaoServicos).toFixed(2)}`} cor="#22d3ee" />
      </div>
      <p className="text-sm font-medium" style={{ color: TEXT2 }}>
        Contabiliza serviços em estado CONCLUIDO ou FINALIZADO no período selecionado.
      </p>
    </div>
  );
}

function DetalheVendas({ stats }) {
  const vendas = (stats.Movimentacao ?? []).filter((m) => m.Categoria === "VENDA");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Resumo rotulo="Nº Vendas" valor={stats.NumeroVendas} cor="#fbbf24" />
        <Resumo rotulo="Faturação" valor={`€${Number(stats.FaturacaoVendas).toFixed(2)}`} cor="#22d3ee" />
      </div>
      <SeccaoLista titulo="Lista de Vendas">
        {vendas.length === 0 ? <Vazio texto="Sem vendas no período." /> : vendas.map((m) => <LinhaFatura key={m.Fatura.NumeroFatura} mov={m} />)}
      </SeccaoLista>
    </div>
  );
}

function DetalheAgendamentos({ stats }) {
  return (
    <div className="space-y-3">
      <Resumo rotulo="Nº Agendamentos" valor={stats.NumeroAgendamentos} cor="#a78bfa" />
      <p className="text-sm font-medium" style={{ color: TEXT2 }}>
        Número de slots agendados na agenda no período. Inclui diagnósticos e reparações atribuídos a mecânicos.
      </p>
    </div>
  );
}

function DetalheDevolucoes({ stats }) {
  const devs = stats.Devolucoes ?? [];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Resumo rotulo="Nº Devoluções" valor={devs.length} cor="#f87171" />
        <Resumo rotulo="Valor Creditado" valor={`€${Number(stats.ValorTotalDevolucoes).toFixed(2)}`} cor="#f87171" />
      </div>
      <SeccaoLista titulo="Lista de Devoluções">
        {devs.length === 0 ? <Vazio texto="Sem devoluções no período." /> : devs.map((d, idx) => (
          <div
            key={d.DevolucaoID ?? idx}
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div>
              <p className="font-extrabold" style={{ color: TEXT1 }}>{d.Motivo || "Sem motivo"}</p>
              <p className="text-xs font-medium" style={{ color: TEXT2 }}>
                {d.DataDevolucao ? new Date(d.DataDevolucao).toLocaleDateString("pt-PT") : "—"}
              </p>
            </div>
            <p className="text-base font-extrabold font-mono" style={{ color: '#f87171' }}>
              €{Number(d.NotaCredito?.ValorCreditado ?? 0).toFixed(2)}
            </p>
          </div>
        ))}
      </SeccaoLista>
    </div>
  );
}
