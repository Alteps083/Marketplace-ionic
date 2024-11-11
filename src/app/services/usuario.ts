export class Usuario {
    id? : number;
    nombre! : string;
    email! : string;
    contrasenia! : string;
    telefono! : number;
    fecha_registro! : string;
    es_admin! : boolean;
    imagen? : string;
    estado: number = 0;
}
