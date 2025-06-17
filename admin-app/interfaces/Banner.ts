export interface Banner {
    id: number;
    titulo: string;
    subtitulo: string;
    descripcion: string;
    tituloBoton: string;
    linkBoton: string;
    imagen: string;
    color: string;
    created_at?: string;
    updated_at?: string;
}

export interface BannerData {
    titulo: string;
    subtitulo: string;
    descripcion: string;
    tituloBoton: string;
    linkBoton: string;
    color: string;
}