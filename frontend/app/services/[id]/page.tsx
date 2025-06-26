"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { servicesService } from "@/services/servicesService";
import { Service } from "@/interfaces/Service";

export default function ServiceDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [service, setService] = useState<Service | null>(null);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const data = await servicesService.getServiceById(Number(id));
                setService(data);
                setMainImage(data.images?.find(img => img.is_primary)?.image_url || data.images?.[0]?.image_url || null);
            } catch (error) {
                setService(null);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchService();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl text-gray-600">Servicio no encontrado</div>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto px-4 py-8">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-8 mb-8 border border-white/30">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2 drop-shadow">{service.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{service.short_description}</p>
                    <div className="inline-block bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-3 rounded-full text-2xl font-semibold shadow-lg animate-pulse">
                        Desde ${Number(service.base_price).toFixed(2)}
                    </div>
                </div>

                {/* Galería de imágenes */}
                <div className="mb-8">
                    <div className="relative max-w-5xl h-72 md:h-96 mb-4 mx-auto">
                        {mainImage && (
                            <Image
                                src={mainImage}
                                alt={service.name}
                                fill
                                className="object-cover rounded-xl shadow-lg border"
                                priority
                            />
                        )}
                    </div>

                    {service.images && service.images.length > 1 && (
                        <div className="flex gap-4 justify-center flex-wrap mt-2">
                            {service.images.map((img: { id: number; image_url: string; is_primary: boolean }) => (
                                <button
                                    key={img.id}
                                    className={`w-20 h-20 rounded-lg border-4 transition-all duration-200 ${mainImage === img.image_url ? 'border-indigo-500 opacity-100 scale-110' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                    onClick={() => setMainImage(img.image_url)}
                                    type="button"
                                >
                                    <Image src={img.image_url} alt={service.name} width={80} height={80} className="object-cover rounded-lg" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                {/* Descripción extendida */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl mb-8 border-l-4 border-indigo-400">
                    <p className="text-base md:text-lg text-gray-700">
                        {service.description}
                    </p>
                </div>

                {/* Características */}
                {/* Características */}
                {service.features && service.features.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Características</h2>
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {service.features.map((f, i) => (
                                <div
                                    key={i}
                                    className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-6 rounded-xl text-center shadow-lg hover:scale-105 transition-transform"
                                >
                                    <div className="text-4xl mb-2">{f.icon}</div>
                                    <div className="font-bold text-lg mb-1">{f.title}</div>
                                    <div className="text-sm opacity-90">{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Aplicaciones */}
                {service.applications && service.applications.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow mb-8">
                        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Aplicaciones Perfectas</h2>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {service.applications.map((app, i) => (
                                <span
                                    key={i}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-full font-medium text-base shadow hover:scale-105 transition-transform"
                                >
                                    {app}
                                </span>
                            ))}
                        </div>
                    </div>
                )}


                {/* CTA */}
                <div className="text-center py-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
                    <h2 className="mb-4 text-2xl font-semibold text-gray-800">¿Listo para personalizar tus productos?</h2>
                    <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full text-2xl font-semibold shadow-lg animate-pulse">
                        <button>
                            Solicitar Cotización
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
