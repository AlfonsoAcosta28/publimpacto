"use client"

import { useEffect, useState } from "react"
import { quotesService } from "@/services/quotesService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Quote } from "@/interfaces/Quote"
import { Address } from "@/interfaces/Address"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Swal from "sweetalert2"

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterService, setFilterService] = useState("")
    const [filterEmail, setFilterEmail] = useState("")
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [showFinalForm, setShowFinalForm] = useState(false)
    const [finalForm, setFinalForm] = useState({
        addresses_id: '',
        final_delivery_date: '',
        final_cost: '',
        notes: ''
    })
    const [submittingFinal, setSubmittingFinal] = useState(false)
    const [finalModalOpen, setFinalModalOpen] = useState(false)
    const [tab, setTab] = useState("quote_requests")
    const [finalQuotes, setFinalQuotes] = useState<any[]>([])
    const [filterStatus, setFilterStatus] = useState("")
    const [finalFilterStatus, setFinalFilterStatus] = useState("")
    const [finalFilterDate, setFinalFilterDate] = useState("")
    const [quotePage, setQuotePage] = useState(1)
    const [finalQuotePage, setFinalQuotePage] = useState(1)
    const [quotePagination, setQuotePagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 })
    const [finalQuotePagination, setFinalQuotePagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 })

  useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const res = await quotesService.getAllquotes(quotePage, 50)
                setQuotes(res.data)
                setQuotePagination(res.pagination)
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las cotizaciones.' })
            } finally {
      setLoading(false)
            }
        }
        const fetchFinalQuotes = async () => {
            try {
                const res = await quotesService.getAllFinalQuotes(finalQuotePage, 50)
                setFinalQuotes(res.data)
                setFinalQuotePagination(res.pagination)
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las cotizaciones finales.' })
            }
        }
        fetchQuotes()
        fetchFinalQuotes()
    }, [quotePage, finalQuotePage])

    // Obtener servicios únicos para el filtro
    const uniqueServices = Array.from(new Set(quotes.map(q => q.Service?.name).filter(Boolean)))

    // Filtrar cotizaciones
    const filteredQuotes = quotes.filter(q => {
        const matchesService = filterService === "" || q.Service?.name === filterService
        const matchesEmail = filterEmail === "" || (q.User?.correo || "").toLowerCase().includes(filterEmail.toLowerCase())
        const matchesStatus = filterStatus === "" || q.status === filterStatus
        return matchesService && matchesEmail && matchesStatus
    })

    // Filtros para cotizaciones finales
    const filteredFinalQuotes = finalQuotes.filter(fq => {
        const matchesStatus = finalFilterStatus === "" || fq.status === finalFilterStatus;
        const matchesDate = finalFilterDate === "" || (fq.final_delivery_date && fq.final_delivery_date.startsWith(finalFilterDate));
        return matchesStatus && matchesDate;
    });

    const handleViewDetails = (quote: Quote) => {
        setSelectedQuote(quote)
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
        setSelectedQuote(null)
        setShowFinalForm(false)
    }

    const handleStartQuote = async (quote: Quote) => {
        await quotesService.updateQuoteStatus(quote.id, 'procesando')
        setSelectedQuote({ ...quote, status: 'procesando' })
    }

    const handleShowFinalForm = async (quote: Quote) => {
        setSelectedQuote(quote)
        setFinalModalOpen(true)
    }

    const handleCloseFinalModal = () => {
        setFinalModalOpen(false)
        setFinalForm({ addresses_id: '', final_delivery_date: '', final_cost: '', notes: '' })
        setSelectedQuote(null)
    }

    const handleFinalFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFinalForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmitFinal = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmittingFinal(true)
        try {
            await quotesService.createFinalQuote({
                quote_requests_id: selectedQuote?.id,
                final_delivery_date: finalForm.final_delivery_date,
                final_cost: finalForm.final_cost,
                notes: finalForm.notes
            })
            setFinalModalOpen(false)
            setFinalForm({ addresses_id: '', final_delivery_date: '', final_cost: '', notes: '' })
            setSelectedQuote(null)
            Swal.fire({ icon: 'success', title: '¡Cotización final creada!', timer: 2000 })
            // Refrescar cotizaciones y final quotes
            const [data, finalData] = await Promise.all([
                quotesService.getAllquotes(),
                quotesService.getAllFinalQuotes()
            ])
            setQuotes(data)
            setFinalQuotes(finalData)
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al crear la cotización final' })
        } finally {
            setSubmittingFinal(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 min-h-screen">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <Card className="mb-6">
                    <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-2xl font-bold text-center">Gestión de Cotizaciones</CardTitle>
                        <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="quote_requests">Cotizaciones</TabsTrigger>
                            <TabsTrigger value="final_quotes">Cotizaciones Finales</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="p-4">
                        <TabsContent value="quote_requests">
                            {/* Filtros Cotizaciones */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                                <div className="flex gap-2 items-center w-full md:w-auto">
                                    <label className="font-medium">Servicio:</label>
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={filterService}
                                        onChange={e => setFilterService(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        {uniqueServices.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                </div>
                                <div className="flex gap-2 items-center w-full md:w-auto">
                                    <label className="font-medium">Correo usuario:</label>
                                    <Input
                                        type="text"
                                        placeholder="Buscar por correo"
                                        value={filterEmail}
                                        onChange={e => setFilterEmail(e.target.value)}
                                        className="w-56"
                                    />
                      </div>
                                <div className="flex gap-2 items-center w-full md:w-auto">
                                    <label className="font-medium">Estado:</label>
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={filterStatus}
                                        onChange={e => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="procesando">Procesando</option>
                                        <option value="finalizado">Finalizado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                </div>
              </div>
                            {loading ? (
                                <div className="text-center py-10">Cargando cotizaciones...</div>
                            ) : error ? (
                                <div className="text-center text-red-600 py-10">{error}</div>
                            ) : filteredQuotes.length === 0 ? (
                                <div className="text-center text-gray-500">No hay cotizaciones que coincidan con los filtros.</div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
                                                    <TableHead>Servicio</TableHead>
                                                    <TableHead>Usuario</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Estado</TableHead>
                                                    <TableHead>Fecha de entrega</TableHead>
                                                    <TableHead>Fecha de solicitud</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
                                                {filteredQuotes.map((q) => (
                                                    <TableRow key={q.id}>
                                                        <TableCell className="font-medium">#{q.id}</TableCell>
                                                        <TableCell>{q.Service?.name || q.Service?.id || '-'}</TableCell>
                                                        <TableCell>{q.User ? <span className="text-xs text-gray-500">{q.User.correo}</span> : '-'}</TableCell>
                                                        <TableCell>{q.phone || '-'}</TableCell>
                                                        <TableCell><Badge variant={q.status as any}>{q.status}</Badge></TableCell>
                                                        <TableCell>{q.desired_delivery_date ? new Date(q.desired_delivery_date).toLocaleDateString() : '-'}</TableCell>
                                                        <TableCell>{q.created_at ? new Date(q.created_at).toLocaleDateString() : '-'}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                                                                {q.status === 'procesando' && (
                                                                    <>
                                                                        <Button variant="default" size="sm" onClick={() => handleShowFinalForm(q)} >
                                                                            Finalizar cotización
                  </Button>
                                                                    </>
                                                                )}
                                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(q)}>
                                                                    Ver detalles
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {/* Paginación cotizaciones */}
                                    <div className="flex justify-center items-center gap-2 mt-4">
                                        <Button variant="outline" size="sm" disabled={quotePagination.page === 1} onClick={() => setQuotePage(quotePagination.page - 1)}>
                                            Anterior
                                        </Button>
                                        <span>Página {quotePagination.page} de {quotePagination.totalPages}</span>
                                        <Button variant="outline" size="sm" disabled={quotePagination.page === quotePagination.totalPages} onClick={() => setQuotePage(quotePagination.page + 1)}>
                                            Siguiente
                        </Button>
                          </div>
                                </>
                            )}
                        </TabsContent>
                        <TabsContent value="final_quotes">
                            {/* Filtros para cotizaciones finales */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                                <div className="flex gap-2 items-center w-full md:w-auto">
                                    <label className="font-medium">Estado:</label>
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={finalFilterStatus}
                                        onChange={e => setFinalFilterStatus(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="procesando">Procesando</option>
                                        <option value="enviado">Enviado</option>
                                        <option value="entregado">Entregado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                          </div>
                                <div className="flex gap-2 items-center w-full md:w-auto">
                                    <label className="font-medium">Fecha de entrega:</label>
                                    <Input
                                        type="date"
                                        value={finalFilterDate}
                                        onChange={e => setFinalFilterDate(e.target.value)}
                                        className="w-56"
                                    />
                          </div>
                        </div>
                            {filteredFinalQuotes.length === 0 ? (
                                <div className="text-center text-gray-500">No hay cotizaciones finales registradas.</div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    {/* <TableHead>ID Cotización</TableHead> */}
                                                    <TableHead>Fecha de entrega</TableHead>
                                                    <TableHead>Costo final</TableHead>
                                                    <TableHead>Notas</TableHead>
                                                    <TableHead>Estado de envio</TableHead>
                                                    <TableHead>Pago</TableHead>
                                                    <TableHead>Fecha de creación</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredFinalQuotes.map((fq) => (
                                                    <TableRow key={fq.id}>
                                                        <TableCell className="font-medium">#{fq.id}</TableCell>
                                                        {/* <TableCell>{fq.quote_requests_id}</TableCell> */}
                                                        <TableCell>{fq.final_delivery_date ? new Date(fq.final_delivery_date).toLocaleDateString() : '-'}</TableCell>
                                                        <TableCell>${fq.final_cost}</TableCell>
                                                        <TableCell>{fq.notes || '-'}</TableCell>
                                                        <TableCell><Badge variant={fq.status as any}>{fq.status}</Badge></TableCell>
                                                        <TableCell><Badge variant={fq.payment_status as any}>{fq.payment_status}</Badge></TableCell>
                                                        <TableCell>{fq.created_at ? new Date(fq.created_at).toLocaleDateString() : '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {/* Paginación cotizaciones finales */}
                                    <div className="flex justify-center items-center gap-2 mt-4">
                                        <Button variant="outline" size="sm" disabled={finalQuotePagination.page === 1} onClick={() => setFinalQuotePage(finalQuotePagination.page - 1)}>
                                            Anterior
                          </Button>
                                        <span>Página {finalQuotePagination.page} de {finalQuotePagination.totalPages}</span>
                                        <Button variant="outline" size="sm" disabled={finalQuotePagination.page === finalQuotePagination.totalPages} onClick={() => setFinalQuotePage(finalQuotePagination.page + 1)}>
                                            Siguiente
                          </Button>
                        </div>
                                </>
                            )}
                        </TabsContent>
                    </CardContent>
                </Card>
                {/* Modal de detalles */}
                <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Cotización #{selectedQuote?.id}</DialogTitle>
                          <DialogDescription>
                                Información completa de la solicitud
                          </DialogDescription>
                        </DialogHeader>
                        {selectedQuote && (
                            <div className="space-y-2 py-2">
                                <div><span className="font-medium">Servicio:</span> {selectedQuote.Service?.name || '-'}</div>
                                <div><span className="font-medium">Usuario:</span> {selectedQuote.User?.nombre || '-'} <span className="text-xs text-gray-500">({selectedQuote.User?.correo})</span></div>
                                <div><span className="font-medium">Teléfono:</span> {selectedQuote.phone || '-'}</div>
                                <div><span className="font-medium">Descripción:</span> {selectedQuote.description}</div>
                                <div><span className="font-medium">Cantidad:</span> {selectedQuote.quantity}</div>
                                <div><span className="font-medium">Dimensiones:</span> {selectedQuote.dimensions || '-'}</div>
                                <div><span className="font-medium">Colores:</span> {selectedQuote.colors || '-'}</div>
                                <div><span className="font-medium">Fecha de entrega:</span> {selectedQuote.desired_delivery_date ? new Date(selectedQuote.desired_delivery_date).toLocaleDateString() : '-'}</div>
                                <div><span className="font-medium">Fecha de solicitud:</span> {selectedQuote.created_at ? new Date(selectedQuote.created_at).toLocaleDateString() : '-'}</div>
                                <div className="flex gap-2 mt-4">
                                    {selectedQuote.status === 'pendiente' && (
                                        <Button variant="blue" onClick={() => handleStartQuote(selectedQuote)}>
                                            Iniciar cotización
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                      </DialogContent>
                    </Dialog>
                {/* Modal para crear FinalQuote */}
                <Dialog open={finalModalOpen} onOpenChange={handleCloseFinalModal}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Finalizar Cotización</DialogTitle>
                          <DialogDescription>
                                Completa los datos para crear la cotización final
                          </DialogDescription>
                        </DialogHeader>
                        <form className="space-y-3 mt-4" onSubmit={handleSubmitFinal}>
                            <div>
                                <label className="block font-medium mb-1">Fecha de entrega final</label>
                                <input
                                    name="final_delivery_date"
                                    type="date"
                                    className="w-full border rounded px-2 py-1"
                                    value={finalForm.final_delivery_date}
                                    onChange={handleFinalFormChange}
                                    required
                                />
                          </div>
                            <div>
                                <label className="block font-medium mb-1">Costo final</label>
                                <input
                                    name="final_cost"
                                    type="number"
                                    step="0.01"
                                    className="w-full border rounded px-2 py-1"
                                    value={finalForm.final_cost}
                                    onChange={handleFinalFormChange}
                                    required
                                />
                          </div>
                            <div>
                                <label className="block font-medium mb-1">Notas</label>
                                <textarea
                                    name="notes"
                                    className="w-full border rounded px-2 py-1"
                                    value={finalForm.notes}
                                    onChange={handleFinalFormChange}
                                />
                          </div>
                            <div className="flex justify-end">
                                <Button type="submit" variant="default" disabled={submittingFinal}>
                                    {submittingFinal ? 'Enviando...' : 'Crear cotización final'}
                          </Button>
                        </div>
                        </form>
                      </DialogContent>
                    </Dialog>
            </Tabs>
        </div>
  )
}