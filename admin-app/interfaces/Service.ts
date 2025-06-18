export interface ServiceOption {
    name: string;
    input_type: 'text' | 'number' | 'select' | 'file' | 'time';
    options?: string[];
}

export interface Service {
    id?: number;
    name: string;
    description: string;
    base_price: number;
    discount_percentage?: number;
    options: ServiceOption[];
    images?: {
        id: number;
        image_url: string;
        is_primary: boolean;
    }[];
}

export interface ServiceInventory {
    id?: number;
    service_id: number;
    variant_name: string; // ej: "Camisa Blanca S", "Taza Normal"
    quantity: number;
    price_modifier?: number; // precio adicional o descuento para esta variante
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
