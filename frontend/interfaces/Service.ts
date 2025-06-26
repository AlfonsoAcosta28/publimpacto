
export interface Service {
    id?: number;
    name: string;
    description: string;
    short_description:string;
    base_price: number;
    discount_percentage?: number;
    images?: {
        id: number;
        image_url: string;
        is_primary: boolean;
    }[];
    features?: { icon: string; title: string; desc: string }[];
    applications?: string[];
}
