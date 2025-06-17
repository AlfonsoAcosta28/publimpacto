"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import shippingPriceService from "@/services/shippingPriceService";

export default function ShippingPricePage() {
  const [currentPrice, setCurrentPrice] = useState<{
    valorEnvio: number;
    precioMinimoVenta: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    valorEnvio: "",
    precioMinimoVenta: "",
  });

  useEffect(() => {
    loadCurrentPrice();
  }, []);

  const loadCurrentPrice = async () => {
    try {
      const response = await shippingPriceService.getCurrentPrice();
      setCurrentPrice(response.data);
      setFormData({
        valorEnvio: response.data.valorEnvio.toString(),
        precioMinimoVenta: response.data.precioMinimoVenta.toString(),
      });
    } catch (error) {
      toast.error("Error al cargar el precio actual");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const valorEnvio = parseFloat(formData.valorEnvio);
      const precioMinimoVenta = parseFloat(formData.precioMinimoVenta);

      if (isNaN(valorEnvio) || isNaN(precioMinimoVenta)) {
        toast.error("Por favor ingrese valores numéricos válidos");
        return;
      }

      if (valorEnvio < 0 || precioMinimoVenta < 0) {
        toast.error("Los valores no pueden ser negativos");
        return;
      }

      await shippingPriceService.createShippingPrice({
        valorEnvio,
        precioMinimoVenta,
      });

      toast.success("Precio de envío actualizado exitosamente");
      loadCurrentPrice();
    } catch (error) {
      toast.error("Error al actualizar el precio de envío");
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Precios de Envío</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valorEnvio">Precio de Envío</Label>
              <Input
                id="valorEnvio"
                type="number"
                step="0.01"
                value={formData.valorEnvio}
                onChange={(e) =>
                  setFormData({ ...formData, valorEnvio: e.target.value })
                }
                placeholder="Ingrese el precio de envío"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioMinimoVenta">Precio Mínimo de Venta</Label>
              <Input
                id="precioMinimoVenta"
                type="number"
                step="0.01"
                value={formData.precioMinimoVenta}
                onChange={(e) =>
                  setFormData({ ...formData, precioMinimoVenta: e.target.value })
                }
                placeholder="Ingrese el precio mínimo de venta"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Actualizar Precios
            </Button>
          </form>

          {currentPrice && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Precio Actual</h3>
              <p>Precio de Envío: ${currentPrice.valorEnvio}</p>
              <p>Precio Mínimo de Venta: ${currentPrice.precioMinimoVenta}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
