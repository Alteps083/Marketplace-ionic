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

constructor(
    id: number,
    nombre: string,
    email: string,
    contrasenia: string,
    telefono: number,
    fecha_registro: string,
    es_admin: boolean,
    imagen: string,
    estado: number
  ) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.contrasenia = contrasenia;
    this.telefono! = telefono;
    this.fecha_registro = fecha_registro;
    this.es_admin = es_admin;
    this.imagen = imagen;
    this.estado = estado;
  }
}