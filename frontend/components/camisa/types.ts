export type ElementType = 'text' | 'image' | 'background' | 'icon'

export interface DesignElement {
    id: string
    type: ElementType
    content: string
    position: { x: number, y: number }
    rotation: number
    scale: number
    style?: {
        fontSize?: number
        fontFamily?: string
        color?: string
        isBold?: boolean
        isItalic?: boolean
        isUnderline?: boolean
        lineHeight?: number
        backgroundColor?: string
        width?: number
        height?: number
        textAlign?: 'left' | 'center' | 'right'
    }
}

export const DEFAULT_IMAGES = [
    '/texturas/taza/imagenes/image1.webp',
    '/texturas/taza/imagenes/image2.webp'
]

export const DEFAULT_BACKGROUNDS = [
    '/texturas/taza/background/bg1.webp',
    '/texturas/taza/background/bg2.webp',
    '/texturas/taza/background/bg3.webp',
    '/texturas/taza/background/bg4.webp',
    '/texturas/taza/background/bg5.webp',
    '/texturas/taza/background/bg6.webp',
    '/texturas/taza/background/bg7.webp',
    '/texturas/taza/background/bg8.webp',
    '/texturas/taza/background/bg9.webp',
    '/texturas/taza/background/bg10.webp'
] 

export interface Irgb {
  r: number
  g: number
  b: number
}