"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { servicesService } from "@/services/servicesService";
import { Service } from "@/interfaces/Service";
import { useAuth } from "@/contexts/AuthContext";
import { quoteRequestService } from "@/services/quoteRequestService";
import Swal from "sweetalert2";
import AddressManager from "@/components/AddressManager";


export default function ServiceDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [service, setService] = useState<Service | null>(null);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQuotation, setShowQuotaion] = useState<boolean>(false)
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        description: "",
        quantity: 1,
        dimensions: "",
        colors: "",
        desired_delivery_date: "",
        phone: ""
    });
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const data = await servicesService.getServiceById(Number(id));
                setService(data);
                setMainImage(data.images?.find((img: any) => img.is_primary)?.image_url || data.images?.[0]?.image_url || null);
            } catch (error) {
                setService(null);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchService();
        form.phone = user?.telefono;
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

    const handleQuotation = () => {
        if (!isAuthenticated) {
            router.push(`/login`)
            return
        }
        setShowQuotaion((prev) => prev = true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingQuote(true);
        setSuccess(null);
        setError(null);
        const telefono = form.phone;
        if (telefono.length !== 10) {
            setError("El numero de telefono debe contener 10 digitos");
            setLoadingQuote(false);
            return
        }
        if (!(/^\d+$/.test(telefono))) {
            setError("Ingrese solo numeros en el telefono");
            setLoadingQuote(false);
            return
        }

        try {
            await quoteRequestService.createQuoteRequest({
                user_id: user?.id,
                service_id: service.id,
                phone: form.phone,
                description: form.description,
                quantity: form.quantity,
                dimensions: form.dimensions,
                colors: form.colors,
                desired_delivery_date: form.desired_delivery_date
            });
            Swal.fire({
                title:'¡Listo!',
                text:'¡Solicitud enviada correctamente! Nos pondremos en contacto contigo pronto.',
                icon:'success',
                timer:4000
            })
            router.push('/quotes')
            setShowQuotaion(false);
        } catch (err) {
            setError("Ocurrió un error al enviar la solicitud. Intenta de nuevo.");
        } finally {
            setLoadingQuote(false);
        }
    };

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
                    <h2 className="mb-4 text-2xl font-semibold text-gray-800">Cuéntanos tu idea y te diremos cómo hacerlo realidad.</h2>
                    {showQuotation === false && (
                        <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full text-2xl font-semibold shadow-lg animate-pulse">
                            <button onClick={() => handleQuotation()}>
                                Solicitar Cotización
                            </button>
                        </div>
                    )}
                    {showQuotation === true && (
                        <form className="max-w-xl mx-auto bg-white/90 p-8 rounded-xl shadow-lg grid gap-4 text-left" onSubmit={handleSubmit}>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Nombre</label>
                                <span className="w-full py-2 text-gray-600 text-sm">
                                    {user?.nombre}
                                </span>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Correo electrónico</label>
                                <span className="w-full py-2 text-gray-600 text-sm">
                                    {user?.correo}
                                </span>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Teléfono</label>
                                <input type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="7150000000" required value={form.phone} name="phone" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Descripción del trabajo o necesidad</label>
                                <textarea name="description" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none" rows={3} placeholder="Describe tu proyecto o necesidad" required value={form.description} onChange={handleChange}></textarea>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Cantidad aproximada</label>
                                <input name="quantity" type="number" min="1" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Ej: 100" required value={form.quantity} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Tamaño / dimensiones (si aplica)</label>
                                <input name="dimensions" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Ej: 10x15 cm" value={form.dimensions} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Colores / tintas (si aplica)</label>
                                <input name="colors" type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Ej: 2 tintas, azul y rojo" value={form.colors} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-700">Fecha deseada de entrega</label>
                                <input name="desired_delivery_date" type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none" required value={form.desired_delivery_date} onChange={handleChange} />
                            </div>
                            {/* <span>Seleccione una direccion para cuando se finalice la cotizacion pueda recibir su pedido</span>
                            <AddressManager showSelectButton ></AddressManager> */}
                            {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
                            {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
                            <div className="text-center mt-4">
                                <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full text-xl font-semibold shadow-lg hover:scale-105 transition-transform animate-pulse" disabled={loadingQuote}>{loadingQuote ? "Enviando..." : "Enviar Solicitud"}</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
