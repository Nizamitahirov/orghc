"use client";
import { useState, useEffect } from "react";
import { exchangeRateService } from "@/services/bonusService";
import { RefreshCw, Zap, Info } from "lucide-react";

const fmt6 = (v) => v != null ? parseFloat(v).toFixed(6) : "—";

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€', AZN: '₼', TRY: '₺', RUB: '₽' };
const sym = (c) => CURRENCY_SYMBOLS[c] || c;

export default function ExchangeRateTab({ dark }) {
  const [rates,    setRates]    = useState([]);
  const [date,     setDate]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const text  = dark ? "text-white"     : "text-gray-900";
  const sub   = dark ? "text-[#8a9bb8]" : "text-almet-comet";
  const muted = dark ? "text-gray-600"  : "text-gray-400";
  const rowBg = dark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-gray-200";
  const head  = dark ? "bg-[#080b14] text-[#5a6a85]" : "bg-[#f5f7fb] text-gray-400";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await exchangeRateService.liveRates();
      setRates(data.rates ?? []);
      setDate(data.date);
    } catch (e) {
      setError(e?.response?.data?.error || "CBAR-a qoşulmaq mümkün olmadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Yalnız X→AZN cütlərini göstər (AZN→X tərsinə cütlər interfeysi sadələşdirir)
  const display = rates.filter(r => r.to_currency === 'AZN');

  const ColHeader = ({ children, align = "left" }) => (
    <th className={`px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-${align} whitespace-nowrap`}>
      {children}
    </th>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className={`text-base font-bold ${text}`}>Exchange Rates</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>
            Mərkəzi Bank (CBAR) rəsmi məzənnəsi · real-time · database-ə yazılmır
            {date && <span className="ml-2 text-almet-steel-blue font-semibold">({date})</span>}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-almet-sapphire hover:bg-almet-cloud-burst text-white text-xs font-semibold transition-all disabled:opacity-60 shadow-md shadow-almet-sapphire/20"
        >
          {loading ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
          {loading ? "Yüklənir…" : "Yenilə"}
        </button>
      </div>

      {/* ── Info ── */}
      <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border
        ${dark ? "bg-almet-sapphire/8 border-almet-sapphire/20" : "bg-almet-mystic border-almet-sapphire/20"}`}>
        <Info size={13} className="text-almet-steel-blue shrink-0 mt-0.5" />
        <p className={`text-xs leading-relaxed ${sub}`}>
          Məzənnələr <b>Azərbaycan Mərkəzi Bankından (CBAR)</b> avtomatik çəkilir.
          Heç bir manual daxiletmə tələb olunmur — bütün konvertasiyalar bu dəyərlərlə hesablanır.
          Nəticələr <b>1 saat</b> keşlənir.
        </p>
      </div>

      {/* ── Content ── */}
      {error ? (
        <div className={`text-center py-16 rounded-xl border border-dashed
          ${dark ? "border-red-500/20 text-red-400" : "border-red-200 text-red-500"}`}>
          <p className="text-sm font-semibold mb-1">CBAR-a qoşulmaq mümkün olmadı</p>
          <p className="text-xs mb-4">{error}</p>
          <button onClick={load}
            className="px-4 py-2 rounded-xl bg-almet-sapphire text-white text-xs font-semibold hover:bg-almet-cloud-burst transition-all">
            Yenidən cəhd et
          </button>
        </div>
      ) : loading ? (
        <div className={`text-center py-12 text-sm ${sub}`}>CBAR-dan məzənnələr yüklənir…</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-separate" style={{ borderSpacing: "0 5px" }}>
            <thead className={head}>
              <tr>
                <ColHeader>Valyuta</ColHeader>
                <ColHeader align="right">1 vahid = (AZN)</ColHeader>
                <ColHeader align="right">1 AZN = (valyuta)</ColHeader>
              </tr>
            </thead>
            <tbody>
              {display.map((r) => {
                const inverse = rates.find(x => x.from_currency === 'AZN' && x.to_currency === r.from_currency);
                return (
                  <tr key={r.from_currency}>
                    {[
                      <td key="cur" className={`px-4 py-3 border-y rounded-l-xl border-l ${rowBg}`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${muted}`}>{sym(r.from_currency)}</span>
                          <div>
                            <p className={`text-sm font-bold ${text}`}>{r.from_currency}</p>
                          </div>
                        </div>
                      </td>,
                      <td key="rate" className={`px-4 py-3 border-y text-right ${rowBg}`}>
                        <span className={`text-sm font-mono font-bold ${text}`}>
                          ₼ {fmt6(r.rate)}
                        </span>
                      </td>,
                      <td key="inv" className={`px-4 py-3 border-y border-r rounded-r-xl text-right ${rowBg}`}>
                        <span className={`text-sm font-mono font-bold ${text}`}>
                          {sym(r.from_currency)} {inverse ? fmt6(inverse.rate) : "—"}
                        </span>
                      </td>,
                    ]}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
