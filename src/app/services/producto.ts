export class Producto {
    id!: number;
    id_vendedor!: number;
    nombre_producto!: string;
    descripcion!: string;
    categoria!: string;
    estado!: string;
    precio!: number;
    imagenes!: string[];
    ubicacion?: string;
}
