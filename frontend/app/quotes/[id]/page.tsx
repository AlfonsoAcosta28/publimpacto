"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { quoteRequestService } from "@/services/quoteRequestService";
import { Quote } from "@/interfaces/QuoteRequest";
import AddressManager from "@/components/AddressManager";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function QuoteDetailPage() {
    const { id } = useParams();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingAddress, setSavingAddress] = useState(false);
    const [paying, setPaying] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const data = await quoteRequestService.getUserQuoteById(id);
                setQuote(data);
            } catch (err) {
                setError("No se pudo cargar la cotización.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [id]);

    const finalQuote = quote?.final_quote;
    const address = finalQuote?.address;


    const handleSaveAddress = async () => {
        setSavingAddress(true);
        // Aquí deberías llamar a un servicio real para guardar la dirección y asociarla a la cotización
        setTimeout(() => {
            setSuccessMsg("Dirección guardada correctamente.");
            setSavingAddress(false);
        }, 1200);
    };

    const handlePay = async () => {
        setPaying(true);
        // Aquí deberías llamar a un servicio real para marcar como pagado
        setTimeout(() => {
            setSuccessMsg("¡Pago realizado con éxito!");
            setPaying(false);
        }, 1200);
    };

    if (loading) return <div className="text-center py-10">Cargando cotización...</div>;
    if (error) return <div className="h-full text-center text-red-600 py-10">{error}</div>;
    if (!quote || !finalQuote) return <div className="text-center py-10">No se encontró la cotización.</div>;

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden min-h-screen p-8 mt-8">
            <h1 className="text-3xl font-bold mb-2 text-center">Detalle de Cotización</h1>
            <p className="text-center text-gray-500 mb-6">Revisa y gestiona tu cotización final</p>
            {successMsg && <div className="bg-green-100 text-green-700 rounded-lg px-4 py-2 mb-4 text-center">{successMsg}</div>}
            
            {finalQuote.payment_status === 'pendiente' ? (
                // Si no está pagado, mostrar 2 secciones
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sección 1: Información de la cotización */}
                    <div className="bg-slate-50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Información de la Cotización</h2>
                        <div className="mb-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="font-semibold">Servicio:</p>
                                    <p className="text-gray-700">{quote.Service?.name}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Descripción:</p>
                                    <p className="text-gray-700">{quote.description}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Cantidad:</p>
                                    <p className="text-gray-700">{quote.quantity}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Fecha de entrega:</p>
                                    <p className="text-gray-700">{finalQuote.final_delivery_date ? new Date(finalQuote.final_delivery_date).toLocaleDateString() : '-'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Costo final:</p>
                                    <p className="text-green-700 font-bold text-lg">${Number(finalQuote.final_cost).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Pago:</p>
                                    <span className={`payment-status ${finalQuote.payment_status}`}>{finalQuote.payment_status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="font-semibold">Notas:</p>
                            <p className="text-gray-700">{finalQuote.notes || '-'}</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-2">Dirección de Entrega:</p>
                            {address ? (
                                <div className="bg-white rounded-lg p-4">
                                    <p>{address.calle} {address.numero_calle}, {address.colonia}, {address.ciudad}, {address.estado}, CP: {address.codigo_postal}</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg p-4">
                                    <p className="text-gray-500">No hay dirección registrada</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección 2: Método de pago, direcciones y pagar */}
                    <div className="bg-slate-50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">💳 Proceso de Pago</h2>
                        
                        {/* Método de pago */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Método de Pago</h3>
                            <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <input type="radio" id="card" name="payment" className="text-blue-600" defaultChecked />
                                    <label htmlFor="card" className="flex items-center">
                                        <span className="text-lg mr-2">💳</span>
                                        Tarjeta de crédito/débito
                                    </label>
                                </div>
                                <div className="flex items-center space-x-3 mt-2">
                                    <input type="radio" id="transfer" name="payment" className="text-blue-600" />
                                    <label htmlFor="transfer" className="flex items-center">
                                        <span className="text-lg mr-2">🏦</span>
                                        Transferencia bancaria
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Mis direcciones */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Mis Direcciones</h3>
                            <AddressManager showSelectButton />
                        </div>

                        {/* Botón de pagar */}
                        <Button
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            size="lg"
                            onClick={handlePay}
                            disabled={paying}
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            {paying ? "Procesando pago..." : "Pagar ahora"}
                        </Button>
                    </div>
                </div>
            ) : (
                // Si ya está pagado, mostrar solo la información
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold">Servicio:</p>
                                <p className="text-gray-700">{quote.Service?.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Descripción:</p>
                                <p className="text-gray-700">{quote.description}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Cantidad:</p>
                                <p className="text-gray-700">{quote.quantity}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Fecha de entrega:</p>
                                <p className="text-gray-700">{finalQuote.final_delivery_date ? new Date(finalQuote.final_delivery_date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Costo final:</p>
                                <p className="text-green-700 font-bold text-lg">${Number(finalQuote.final_cost).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Estado de envio:</p>
                                <span className={`status ${finalQuote.status}`}>{finalQuote.status}</span>
                            </div>
                            <div>
                                <p className="font-semibold">Pago:</p>
                                <span className={`payment-status ${finalQuote.payment_status}`}>{finalQuote.payment_status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <p className="font-semibold">Notas:</p>
                        <p className="text-gray-700">{finalQuote.notes || '-'}</p>
                    </div>
                    <div className="mb-6">
                        <p className="font-semibold mb-2">Dirección de Entrega:</p>
                        {address ? (
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p>{address.calle} {address.numero_calle}, {address.colonia}, {address.ciudad}, {address.estado}, CP: {address.codigo_postal}</p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-gray-500">No hay dirección registrada</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
            `}</style>
        </div>
    );
}
