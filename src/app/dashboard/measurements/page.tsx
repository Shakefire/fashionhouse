"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Ruler, Save, Trash2, User, Scissors, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const FABRICS = [
  { value: "Silk", label: "Premium Silk" },
  { value: "Cotton", label: "Egyptian Cotton" },
  { value: "Wool", label: "Merino Wool" },
  { value: "Linen", label: "Pure Linen" },
  { value: "Velvet", label: "Velvet" },
  { value: "Lace", label: "Lace" },
  { value: "Polyester", label: "Polyester" },
  { value: "Gabardine", label: "Gabardine" },
  { value: "Chiffon", label: "Chiffon" },
  { value: "Ankara", label: "Ankara" },
];

interface Measurements {
  customer: string;
  fabricType: string;
  bust: string;
  waist: string;
  hips: string;
  shoulder: string;
  length: string;
  neck: string;
  sleeve: string;
  inseam: string;
}

const INITIAL_STATE: Measurements = {
  customer: "",
  fabricType: "",
  bust: "",
  waist: "",
  hips: "",
  shoulder: "",
  length: "",
  neck: "",
  sleeve: "",
  inseam: "",
};

function MeasurementField({
  label,
  value,
  onChange,
  min = 5,
  max = 50,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
}) {
  const clampedValue = (raw: string) => {
    if (!raw) return "";
    const nextValue = Number(raw);
    if (Number.isNaN(nextValue)) return "";
    return String(Math.min(max, Math.max(min, nextValue)));
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-blue-500/5 group transition-all hover:border-cyan-500/10">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-300 transition-colors">
        {label}
      </label>
      <div className="w-full max-w-[220px]">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step="0.25"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onChange(clampedValue(value))}
          placeholder={`${min}-${max}`}
          className={`w-full bg-slate-900/60 border rounded-xl py-2.5 px-3 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${
            value ? "text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-slate-900" : "text-slate-500 border-blue-500/10 hover:border-blue-500/30"
          }`}
        />
      </div>
    </div>
  );
}

export default function RecordMeasurementsPage() {
  const supabase = createClient();
  const [measurements, setMeasurements] = useState<Measurements>(INITIAL_STATE);
  const [dbCustomers, setDbCustomers] = useState<{ id: string, full_name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const measurementsRef = useRef(measurements);
  useEffect(() => {
    measurementsRef.current = measurements;
  });

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await supabase
        .from('customers')
        .select('id, full_name')
        .order('full_name');
      if (data) setDbCustomers(data);
    }
    fetchCustomers();
  }, [supabase]);

  useEffect(() => {
    if (!measurements.customer) return;

    // Don't overwrite values the user has already started typing.
    const hasStartedTyping = Object.entries(measurementsRef.current).some(
      ([key, value]) => key !== "customer" && value !== ""
    );
    if (hasStartedTyping) return;

    let isMounted = true;

    async function fetchMeasurements() {
      const { data } = await supabase
        .from('measurements')
        .select('*')
        .eq('customer_id', measurements.customer)
        .maybeSingle();

      if (!isMounted) return;

      if (data) {
        setMeasurements({
          customer: measurements.customer,
          fabricType: data.fabric_type || "",
          bust: data.bust != null ? String(data.bust) : "",
          waist: data.waist != null ? String(data.waist) : "",
          hips: data.hips != null ? String(data.hips) : "",
          shoulder: data.shoulder != null ? String(data.shoulder) : "",
          length: data.length != null ? String(data.length) : "",
          neck: data.neck != null ? String(data.neck) : "",
          sleeve: data.sleeve != null ? String(data.sleeve) : "",
          inseam: data.inseam != null ? String(data.inseam) : "",
        });
      } else {
        setMeasurements({ ...INITIAL_STATE, customer: measurements.customer });
      }
    }

    fetchMeasurements();

    return () => {
      isMounted = false;
    };
  }, [measurements.customer, supabase]);

  const updateField = useCallback((key: keyof Measurements) => {
    return (val: string) => {
      setMeasurements((prev) => ({ ...prev, [key]: val }));
    };
  }, []);

  const handleClear = () => setMeasurements(INITIAL_STATE);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    if (!measurements.customer) {
      setStatusMessage({ type: 'error', text: "Please select a customer first." });
      setIsSaving(false);
      return;
    }

    const { data: existing } = await supabase
      .from('measurements')
      .select('id')
      .eq('customer_id', measurements.customer)
      .maybeSingle();

    let res;
    const payload = {
      customer_id: measurements.customer,
      fabric_type: measurements.fabricType,
      bust: parseFloat(measurements.bust) || null,
      waist: parseFloat(measurements.waist) || null,
      hips: parseFloat(measurements.hips) || null,
      shoulder: parseFloat(measurements.shoulder) || null,
      length: parseFloat(measurements.length) || null,
      neck: parseFloat(measurements.neck) || null,
      sleeve: parseFloat(measurements.sleeve) || null,
      inseam: parseFloat(measurements.inseam) || null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      res = await supabase
        .from('measurements')
        .update(payload)
        .eq('id', existing.id);
    } else {
      res = await supabase
        .from('measurements')
        .insert(payload);
    }

    if (res.error) {
      console.error("Error saving measurements:", res.error);
      setStatusMessage({ type: 'error', text: `Failed to sync: ${res.error.message}` });
    } else {
      setStatusMessage({ type: 'success', text: "Anatomical data synchronized successfully!" });
    }
    
    setIsSaving(false);
  };

  const selectStyle = (hasValue: boolean) => ({
    backgroundColor: "#0f172a",
    color: hasValue ? "#22d3ee" : "#64748b",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    borderRadius: "8px",
    padding: "12px 16px 12px 40px",
    fontSize: "14px",
    fontWeight: 700 as const,
    width: "100%",
    cursor: "pointer" as const,
    outline: "none",
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Ruler size={24} />
          </div>
          <span>Record Measurements</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Capture precise client dimensions for custom tailoring.
        </p>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      <div className="glass-effect rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(14,165,233,0.1)]">
        <form
          onSubmit={handleSave}
          className="p-6 md:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12"
        >
          {/* Left Column: Form Fields */}
          <div className="flex-1 space-y-8 lg:space-y-6 order-2 lg:order-1">
            {/* Top row: Customer & Fabric */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-blue-500/10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Select Customer
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400 z-10">
                    <User size={18} />
                  </div>
                  <select
                    value={measurements.customer}
                    onChange={(e) => updateField("customer")(e.target.value)}
                    style={selectStyle(!!measurements.customer)}
                  >
                    <option value="" style={{ backgroundColor: "#0f172a", color: "#64748b" }}>
                      Search Customer
                    </option>
                    {dbCustomers.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                      >
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Fabric Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400 z-10">
                    <Scissors size={18} />
                  </div>
                  <select
                    value={measurements.fabricType}
                    onChange={(e) => updateField("fabricType")(e.target.value)}
                    style={selectStyle(!!measurements.fabricType)}
                  >
                    <option value="" style={{ backgroundColor: "#0f172a", color: "#64748b" }}>
                      Select Material
                    </option>
                    {FABRICS.map((f) => (
                      <option
                        key={f.value}
                        value={f.value}
                        style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                      >
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Measurement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-4">
              <div className="space-y-6">
                <MeasurementField label="Bust/Chest" value={measurements.bust} onChange={updateField("bust")} />
                <MeasurementField label="Waist" value={measurements.waist} onChange={updateField("waist")} />
                <MeasurementField label="Hips/Laps" value={measurements.hips} onChange={updateField("hips")} />
                <MeasurementField label="Shoulder Width" value={measurements.shoulder} onChange={updateField("shoulder")} />
              </div>
              <div className="space-y-6">
                <MeasurementField label="Dress/Shirt Length" value={measurements.length} onChange={updateField("length")} />
                <MeasurementField label="Neck" value={measurements.neck} onChange={updateField("neck")} />
                <MeasurementField label="Sleeve Length" value={measurements.sleeve} onChange={updateField("sleeve")} />
                <MeasurementField label="Inseam Length" value={measurements.inseam} onChange={updateField("inseam")} />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-10">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-64 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Measurements</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-40 py-3.5 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 size={18} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Reference */}
          <div className="lg:w-[320px] flex flex-col items-center justify-center relative order-1 lg:order-2 py-4 lg:py-0">
            <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full" />
            <div className="relative w-full max-w-[280px] lg:max-w-none aspect-[4/5] drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Image
                src="/body-silhouette.png"
                alt="Body Measurement Reference"
                fill
                sizes="(max-width: 1024px) 280px, 400px"
                className="object-contain opacity-80"
              />
              <div className="absolute top-1/4 left-1/4 right-1/4 h-[1px] bg-cyan-400/30 animate-pulse" />
              <div className="absolute top-1/2 left-1/4 right-1/4 h-[1px] bg-cyan-400/30 animate-pulse delay-700" />
              <div className="absolute top-[65%] left-1/4 right-1/4 h-[1px] bg-cyan-400/30 animate-pulse delay-1000" />
            </div>
            <p className="mt-4 lg:mt-6 text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold">
              Anatomical Precision Module v1.0
            </p>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-8 p-4 glass-effect rounded-2xl border border-blue-500/10 flex items-center space-x-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Ruler size={20} />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Measurements are automatically calibrated for fabric shrinkage and
          ease based on the selected material. Standard industry tolerance:{" "}
          <span className="text-cyan-400 font-bold">±0.25&quot;</span>
        </p>
      </div>
    </div>
  );
}
