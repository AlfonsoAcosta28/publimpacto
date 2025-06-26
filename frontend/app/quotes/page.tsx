"use client";
import { useEffect, useState } from "react";
import { quoteRequestService } from "@/services/quoteRequestService";
import { Quote } from "@/interfaces/QuoteRequest";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";



export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const data = await quoteRequestService.getUserQuotes();
                console.log("datos")
                console.log(data)
                setQuotes(data);
            } catch (err) {
                setError("No se pudieron cargar tus cotizaciones.");
            }
        };
        fetchQuotes();
        setLoading(false);
    }, []);

    // const approvedMap = Object.fromEntries(quotes.FinalQuote.map(fq => [fq.quote_requests_id, fq]));

    if (loading) return <div className="text-center py-10">Cargando cotizaciones...</div>;
    if (error) return <div className="h-full text-center text-red-600 py-10">{error}</div>;

    return (
        <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden min-h-screen">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-10 text-center">
                <h1 className="text-4xl font-bold mb-2">Mis Cotizaciones</h1>
                <p className="text-lg opacity-90">Gestiona tus solicitudes y cotizaciones aprobadas</p>
            </div>
            <div className=" gap-8 p-8 min-h-[600px] dashboard">
                {/* Solicitudes */}
                <div className="section requests-section bg-slate-50 rounded-xl p-6 shadow">
                    <h2 className="section-title flex items-center gap-2 text-amber-600 text-xl font-semibold mb-4">📋 Solicitudes de Cotización</h2>
                    <div className="table-container rounded-lg overflow-x-auto shadow">
                        <table className="w-full bg-white rounded-lg">
                            <thead>
                                <tr>
                                    {/* <th className="py-3 px-4 text-left">ID</th> */}
                                    <th className="py-3 px-4 text-left">Servicio</th>
                                    <th className="py-3 px-4 text-left">Descripción</th>
                                    <th className="py-3 px-4 text-left">Cantidad</th>
                                    <th className="py-3 px-4 text-left">Fecha Deseada</th>
                                    <th className="py-3 px-4 text-left">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map((q) => (
                                    <tr
                                        key={q.id}
                                        className={`border-b hover:bg-blue-50 transition clickable-row ${q.status === 'finalizado' ? 'cursor-pointer' : ''}`}
                                        onClick={() => q.status === 'finalizado' ? router.push(`/quotes/${q.id}`) : undefined}
                                    >
                                        {/* <td className="py-2 px-4 font-bold">#{q.id.toString().padStart(3, '0')}</td> */}
                                        <td className="py-2 px-4">{q.Service?.name}</td>
                                        <td className="py-2 px-4 max-w-[200px] truncate">{q.description}</td>
                                        <td className="py-2 px-4">{q.quantity}</td>
                                        <td className="py-2 px-4 text-gray-500">{q.desired_delivery_date ? new Date(q.desired_delivery_date).toLocaleDateString() : '-'}</td>
                                        <td className="py-2 px-4">
                                            <span className={`status ${q.status}`}>{(q.status !== 'finalizado' ? q.status : "APROBADO")}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .status.pendiente { background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status.procesando { background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status.finalizado { background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; }
                .status.finalizado:hover { background: #10b981; color: white; transform: scale(1.05); }
                .status.cancelado { background: #fee2e2; color: #dc2626; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status.enviado { background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status.entregado { background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .payment-status.pendiente { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                .payment-status.pagado { background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                .cost { font-weight: 700; color: #059669; font-size: 1rem; }
                .clickable-row { cursor: pointer; transition: all 0.2s ease; }
                .clickable-row:hover { background: #f0f9ff !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            `}</style>
        </div>
    );
}
