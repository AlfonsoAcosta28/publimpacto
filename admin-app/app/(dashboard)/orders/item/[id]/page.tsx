"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { orderService } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Order } from "@/interfaces/Order";
import { clipToboard } from "@/utils/copyOrder";
import Link from "next/link";
import { IoMdReturnLeft } from "react-icons/io";

export default function CupOrderPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(id)
        if (id) {
            fetchOrder();
        }
        // eslint-disable-next-line
    }, [id]);

    const fetchOrder = async () => {
        try {
            const data = await orderService.getOrderById(id);
            setOrder(data);
            setLoading(false);
        } catch (error) {
            toast("No se pudo cargar el pedido");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-8">Pedido no encontrado</div>;
    }

    return (
        <div className="max-w-full mx-auto ">
            <div className="flex items-center gap-2 text-blue-600 mb-4 hover:cursor-pointer">
            <IoMdReturnLeft />
                <Link href="/orders" className="">Regresar</Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Preparar Pedido de Taza #{order.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center w-full">
                        <Badge variant={order.status as any}>{order.status.toUpperCase()}</Badge>
                        <div className="">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => clipToboard(order)}
                                className="flex items-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                                Copiar Info
                            </Button>

                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Información de contacto</h3>
                        <p><b>Teléfono:</b> {order.telefono_contacto}</p>
                        <p><b>Nombre:</b> {order.address.nombre}</p>
                        <p><b>Dirección:</b> {order.address.calle} {order.address.numero_calle}, {order.address.colonia}, {order.address.ciudad}, {order.address.estado}, CP: {order.address.codigo_postal}</p>
                        <p><b>Referencias:</b> {order.address.referencias || 'Sin referencias'}</p>
                        <p><b>Detalles de la casa:</b> {order.address.descripcion_casa || 'Sin detalles'}</p>
                        <p><b>Horario preferido:</b> {order.address.horario_preferido || 'No especificado'}</p>
                    </div>
                    <div>
                        {order.products.length > 0 && (
                            <div className="space-y-2">
                                <span className="font-semibold mb-2">Productos:</span>
                                <div className=" space-y-4">
                                    {order.products.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
                                            <img
                                                src={item.product.image}
                                                alt={item.product.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product.title}</h4>
                                                <p className="text-lg font-bold text-blue-600">Cantidad: {item.cantidad}</p>
                                                <p className="text-sm text-gray-600">Precio: ${item.precio_unitario}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {order.cups.length > 0 && (

                            <div className="space-y-4">
                                <h3 className="font-semibold mb-2">Tazas del pedido</h3>
                                <div className="grid grid-cols-2 items-start gap-4">
                                    <div>
                                        <img
                                            src={order?.cups[0].image_url}
                                            alt="imagen de la taza"
                                            className=" rounded"
                                        />
                                        <button
                                            className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer"
                                            onClick={async () => {
                                                const url = order?.cups[0].image_url;
                                                if (!url) return;
                                                try {
                                                    const response = await fetch(url, { mode: "cors" });
                                                    const blob = await response.blob();
                                                    const blobUrl = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = blobUrl;
                                                    link.download = `taza_${order.id}.jpg`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(blobUrl);
                                                } catch (e) {
                                                    alert("No se pudo descargar la imagen");
                                                }
                                            }}
                                        >
                                            Descargar imagen
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {order.cups.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.cup.name}</h4>
                                                    <p className="text-lg font-bold text-blue-600">Cantidad: {item.cantidad}</p>
                                                    <p className="text-sm text-gray-600">Precio: ${item.precio_unitario}</p>
                                                    <p className="text-sm text-gray-500">{item.cup.descripcion}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Resumen</h3>
                        <p><b>Envío:</b> ${order.envio}</p>
                        <p><b>Total:</b> ${order.total}</p>
                        <p><b>Fecha de compra:</b> {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 