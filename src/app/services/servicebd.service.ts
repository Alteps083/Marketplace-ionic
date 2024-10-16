import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from './usuario';
import { Producto } from './producto';
import { JsonPipe } from '@angular/common';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {

  public database!: SQLiteObject;

  tablaUsuario: string = `
    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      contrasenia TEXT NOT NULL,
      telefono TEXT NOT NULL,
      fecha_registro TEXT NOT NULL,
      es_admin BOOLEAN DEFAULT 0, 
      imagen TEXT
    )`;
    
  listaUsuarios = new BehaviorSubject<Usuario[]>([]);

  tablaProductos: string = `CREATE TABLE IF NOT EXISTS productos(id INTEGER PRIMARY KEY AUTOINCREMENT,id_vendedor INTEGER, nombre_producto TEXT NOT NULL, descripcion TEXT, categoria TEXT, estado TEXT, 
    precio REAL NOT NULL, imagenes TEXT)`;

  tablaReclamos: string = `CREATE TABLE IF NOT EXISTS reclamos(id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL,tipoProblema TEXT NOT NULL, descripcion TEXT NOT NULL)`;
  
  tablaComentarios: string = `CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productoId INTEGER,
    usuarioId INTEGER,
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productoId) REFERENCES productos(id),
    FOREIGN KEY (usuarioId) REFERENCES usuario(id)
)`;

  listarProductos = new BehaviorSubject<Producto[]>([]);

  listarReclamos = new BehaviorSubject<any[]>([]);
  
  public listaReclamos$ = this.listarReclamos.asObservable();

  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(private sqlite: SQLite, private platform: Platform, private alertController: AlertController, private storage: NativeStorage) { }

  private usuarioActual: Usuario | null = null

  setUsuarioActual(usuario: Usuario){
    this.usuarioActual = usuario;
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual;
  }

  isAdmin(): boolean {
    return this.usuarioActual ? this.usuarioActual.es_admin : false;
  }

  fetchUsuarios(): Observable<Usuario[]> {
    return this.listaUsuarios.asObservable()
    
  };

  
  fetchProductos(): Observable<Producto[]>{
    return this.listarProductos.asObservable();
  }

  fetchProductoPorId(id: number): Promise<Producto | null> {
    const sql = 'SELECT * FROM productos WHERE id = ?';
    return this.database.executeSql(sql, [id]).then(res => {
      if (res.rows.length > 0) {
        const producto = res.rows.item(0);
        producto.imagenes = JSON.parse(producto.imagenes || '[]'); 
        return producto;
      }
      return null; 
    }).catch(e => {
      this.presentAlert('Error al obtener el producto', JSON.stringify(e));
      return null;
    });
  }

  dbReady(){
    return this.isDBReady.asObservable();
  }

  async presentAlert(titulo: string, msj: string){
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['Ok']
    })

    await alert.present();
  }

  crearConexion() {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'bdusuarios.bd',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.database = db; 
        this.crearTablas().then(() => {
          this.cargarUsuarios(); 
          this.cargarProductos();
          this.crearUsuarioAdminPorDefecto();
          this.isDBReady.next(true);
        });
      }).catch(e => {
        this.presentAlert('Error al crear la base de datos', JSON.stringify(e));
      });
    });
  }

    async crearTablas(){
      try{
        await this.database.executeSql(this.tablaUsuario, []);
        await this.database.executeSql(this.tablaProductos, []);
        await this.database.executeSql(this.tablaReclamos, []);
        await this.database.executeSql(this.tablaComentarios, []);
        await this.actualizarTablaUsuario();
        await this.asignarIdAUsuariosExistentes();  // Asignar IDs a los usuarios existentes
        
      }catch(e){
        this.presentAlert('Error al crear tablas', JSON.stringify(e))
        console.log('Error al crear el administrador');
      }
    }
    async registrarUsuario(usuario: Usuario): Promise<boolean> {
      const query = `INSERT INTO usuario (nombre, email, contrasenia, telefono, fecha_registro, es_admin, imagen) VALUES (?, ?, ?, ?, datetime('now'), ?, ?)`;
      const params = [usuario.nombre, usuario.email, usuario.contrasenia, usuario.telefono, usuario.es_admin ? 1 : 0, usuario.imagen];
      
      return this.database.executeSql(query, params)
        .then(() => true)
        .catch(() => false);
    }

    async eliminarTablas() {
      try {
        await this.database.executeSql('DROP TABLE IF EXISTS productos', []);
        this.presentAlert('Éxito', 'Tablas eliminadas correctamente');
      } catch (e) {
        this.presentAlert('Error al eliminar tablas', JSON.stringify(e));
      }
    }

    async verificarCorreoExistente(email: string): Promise<boolean>{
      const sql = 'SELECT COUNT(*) as count FROM usuario WHERE email = ?'
      try{
        const res = await this.database.executeSql(sql, [email]);
        if(res.rows.item(0).count > 0){
          return true;
        }
        return false;
      } catch (e){
        this.presentAlert('Error al verificar el correo', JSON.stringify(e));
        return false;
      }
    }

    async agregarProducto(idvendedor: number | undefined, nombre_producto: string, descripcion: string, categoria: string, estado: string, precio: number, imagenes: string[]) {
      if (idvendedor === undefined) {
        this.presentAlert('Error', 'El id del vendedor no está definido');
        return;
      }
    
      const query = `INSERT INTO productos (id_vendedor, nombre_producto, descripcion, categoria, estado, precio, imagenes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
      const imagenesJSON = JSON.stringify(imagenes);
      const values = [idvendedor, nombre_producto, descripcion, categoria, estado, precio, imagenesJSON];  
      try {
        await this.database.executeSql(query, values);
        this.cargarProductos(); 
      } catch (e) {
        this.presentAlert('Error al agregar producto', JSON.stringify(e));
      }
    }

    async loginUsuario(nombre: string, contrasenia: string): Promise<boolean>{
      const sql = `SELECT * FROM usuario WHERE nombre = ? AND contrasenia = ?`;
      const params = [nombre,contrasenia];
      try{
        const result = await this.database.executeSql(sql,params);
        if (result.rows.length > 0){
          const usuario = result.rows.item(0)
          this.setUsuarioActual(usuario);
          if(usuario.imagen && usuario.imagen.trim() !== ''){
            await this.storage.setItem('usuario_imagen', usuario.imagen)
          }
          return true;
        } else {
          this.presentAlert('Login Fallido', 'Nombre o Constraseña incorrectos')
          return false;
        }
      }catch(e){
        this.presentAlert('Error en el login',JSON.stringify(e));
        return false;
      }
    }

    async actualizarUsuario(usuario: Usuario){
      const sql = 'UPDATE usuario SET nombre = ?, email = ?, telefono = ?, contrasenia = ?, imagen = ? WHERE id = ?';
      try{
        await this.database.executeSql(sql, [usuario.nombre, usuario.email, usuario.telefono, usuario.contrasenia, usuario.imagen, usuario.id])
        this.presentAlert('Exito', 'Datos actualizados correctamente');
        this.cargarUsuarios();
      }catch (e){
        this.presentAlert('Error al actualizar el usuario', JSON.stringify(e));
      }
    }

    actualizarProducto(producto: Producto): Promise<any> {
      const query = `UPDATE productos 
                     SET nombre_producto = ?, descripcion = ?, categoria = ?, estado = ?, precio = ? 
                     WHERE id = ?`;
      const values = [producto.nombre_producto, producto.descripcion, producto.categoria, producto.estado, producto.precio, producto.id];
      
      return this.database.executeSql(query, values)
        .then(res => {
          console.log('Producto actualizado', res);
        })
        .catch(e => {
          console.log('Error al actualizar producto', e);
          throw e;
        });
    }


    async cargarUsuarios() {
      const sql = 'SELECT * FROM usuario';
      try {
        const res = await this.database.executeSql(sql, []);
        let usuarios: Usuario[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          const usuario = res.rows.item(i);
          usuarios.push(usuario);
          console.log('Usuario en BD:', JSON.stringify(usuario));
        }
        this.listaUsuarios.next(usuarios);
      } catch (e) {
        this.presentAlert('Error al cargar usuarios', JSON.stringify(e));
      }
    }

    async cargarProductos() {
      const sql = 'SELECT * FROM productos';
      try {
        const res = await this.database.executeSql(sql, []);
        let productos: Producto[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          const producto = res.rows.item(i);
          producto.imagenes = JSON.parse(producto.imagenes || '[]'); 
          productos.push(producto);
        }
        this.listarProductos.next(productos);
      } catch (e) {
        this.presentAlert('Error al cargar los productos', JSON.stringify(e));
      }
    }

    getPublicacionesPorUsuario(usuarioId: number): Promise<Producto[]> {
      return this.database.executeSql('SELECT * FROM productos WHERE id_vendedor = ?', [usuarioId])
        .then(res => {
          let publicaciones: Producto[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            const producto = res.rows.item(i);
            if (producto.imagenes) {
              producto.imagenes = JSON.parse(producto.imagenes || '[]');
            } else {
              producto.imagenes = []; 
            }
            publicaciones.push(producto);
          }
          return publicaciones;
        });
    }

    async obtenerProductosPorCategoria(categoria: string): Promise<Producto[]> {
      const sql = 'SELECT * FROM productos WHERE categoria = ?';
      try {
        const res = await this.database.executeSql(sql, [categoria]);
        let productos: Producto[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          const producto = res.rows.item(i);
          producto.imagenes = JSON.parse(producto.imagenes || '[]');
          productos.push(producto);
        }
        return productos;
      } catch (e) {
        this.presentAlert('Error al cargar los productos por categoría', JSON.stringify(e));
        return [];
      }
    }

    async eliminarProducto(id: number){
      const sql = 'DELETE FROM productos WHERE id = ?';
      try{
        await this.database.executeSql(sql, [id]);
        this.presentAlert('Exito', 'Producto eliminado correctamente')
        this.cargarProductos();
      }catch (e){
        this.presentAlert('Error al eliminar producto', JSON.stringify(e))
      }
    }

        //modPerfil
        async actualizarTablaUsuario() {
          const sql = `PRAGMA table_info(usuario)`;
          try {
            const result = await this.database.executeSql(sql, []);
            let columnExists = false;
        
    
            for (let i = 0; i < result.rows.length; i++) {
              if (result.rows.item(i).name === 'imagen') {
                columnExists = true;
                break;
              }
            }
        
    
            if (!columnExists) {
              const alterTableSql = `ALTER TABLE usuario ADD COLUMN imagen TEXT`;
              await this.database.executeSql(alterTableSql, []);
            }
          } catch (e) {
            this.presentAlert('Error al actualizar la tabla usuario', JSON.stringify(e));
          }
        }
        
    
        async obtenerImagenUsuario(nombre: string): Promise<string> {
          const sql = 'SELECT imagen FROM usuario WHERE nombre = ?';
          try {
            const result = await this.database.executeSql(sql, [nombre]);
            if (result.rows.length > 0) {
              const imagen = result.rows.item(0).imagen;
              if (imagen && imagen.trim() !== '') {
                return imagen;
              } else {
                return 'src/assets/img/nouser.png';
              }
            } else {
              return 'src/assets/img/nouser.png';
            }
          } catch (e) {
            this.presentAlert('Error al obtener imagen del usuario', JSON.stringify(e));
            return 'src/assets/img/nouser.png';
          }
        }

        async establecerAdmin(nombre: string) {
          const sql = 'UPDATE usuario SET es_admin = ? WHERE nombre = ?';
          try {
            await this.database.executeSql(sql, ['1', nombre]);  // '1' para administrador
            this.presentAlert('Éxito', `El usuario ${nombre} ha sido establecido como administrador.`);
          } catch (e) {
            this.presentAlert('Error al establecer el administrador', JSON.stringify(e));
          }
        }

        //reclamos
        async agregarReclamo(email: string, tipoProblema: string, descripcion: string) {
          const sql = 'INSERT INTO reclamos (email, tipoProblema, descripcion) VALUES (?, ?, ?)';
          try {
            await this.database.executeSql(sql, [email, tipoProblema, descripcion]);
            console.log('Reclamo guardado exitosamente');
          } catch (e) {
            console.error('Error al guardar reclamo:', e);
          }
        }

        async obtenerReclamos(): Promise<any[]> {
          const sql = 'SELECT * FROM reclamos';
          try {
            const res = await this.database.executeSql(sql, []);
            let reclamos: any[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              reclamos.push(res.rows.item(i));
            }
            return reclamos;
          } catch (e) {
            this.presentAlert('Error al cargar los reclamos', JSON.stringify(e));
            return [];
          }
        }
        
        async cargarReclamos() {
          const sql = 'SELECT * FROM reclamos';
          try {
            const res = await this.database.executeSql(sql, []);
            let reclamos: any[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              reclamos.push(res.rows.item(i));
            }
            this.listarReclamos.next(reclamos);
          } catch (e) {
            this.presentAlert('Error al cargar reclamos', JSON.stringify(e));
          }
        }
        
        async eliminarReclamo(id: number) {
          const sql = 'DELETE FROM reclamos WHERE id = ?';
          try {
            await this.database.executeSql(sql, [id]);
            this.presentAlert('Exito', 'Reclamo eliminado correctamente');
            this.cargarReclamos();
          } catch (e) {
            this.presentAlert('Error al eliminar reclamo', JSON.stringify(e));
          }
        }
        
        async eliminarusuario(id: number) {
          const sql = 'DELETE FROM usuario  WHERE id = ?';
          try {
            await this.database.executeSql(sql, [id]);
            this.presentAlert('Exito', 'usaurio eliminado correctamente');
            this.cargarUsuarios();
          } catch (e) {
            this.presentAlert('Error al eliminar usaurio', JSON.stringify(e));
          }
        }

        // temporal, borrar despues de usar
        getUsuarios(): Promise<any[]> {
          return this.database.executeSql('SELECT * FROM usuario', [])
            .then((res) => {
              let usuarios: any[] = [];
              for (let i = 0; i < res.rows.length; i++) {
                usuarios.push(res.rows.item(i));
              }
              return usuarios;
            })
            .catch(e => {
              console.error("Error al obtener usuarios:", e);
              return [];
            });
        }



async asignarIdAUsuariosExistentes() {
  const sqlSelect = 'SELECT * FROM usuario';
  const sqlUpdate = 'UPDATE usuario SET id = ? WHERE rowid = ?';

  try {
    const res = await this.database.executeSql(sqlSelect, []);
    for (let i = 0; i < res.rows.length; i++) {
      const usuario = res.rows.item(i);

      if (!usuario.idusuario || usuario.idusuario === null || usuario.idusuario === undefined) {
        const rowid = usuario.rowid;  
        const nuevoId = i + 1;  
        await this.database.executeSql(sqlUpdate, [nuevoId, rowid]);
        console.log(`Asignado ID ${nuevoId} al usuario con rowid ${rowid}`);
      }
    }
    console.log('IDS asignados correctamente a los usuarios');
  } catch (e) {
    this.presentAlert('Error al asignar IDs', JSON.stringify(e));
  }
}

async obtenerUsuariosChat(): Promise<Usuario[]> {
  const sql = 'SELECT * FROM usuario';
  try {
    const res = await this.database.executeSql(sql, []);
    let usuarios: Usuario[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      const usuario = res.rows.item(i);
      usuarios.push(usuario);
    }
    return usuarios;
  } catch (e) {
    this.presentAlert('Error al cargar los usuarios', JSON.stringify(e));
    return []; 
  }
}

async agregarComentario(productoId: number, usuarioId: number, comentario: string) {
  const sql = 'INSERT INTO comentarios (productoId, usuarioId, comentario) VALUES (?, ?, ?)';
  await this.database.executeSql(sql, [productoId, usuarioId, comentario]);
}

async obtenerComentarios(productoId: number) {
  const sql = `
    SELECT c.comentario, c.fecha, u.nombre, u.imagen 
    FROM comentarios c 
    JOIN usuario u ON c.usuarioId = u.id 
    WHERE c.productoId = ? 
    ORDER BY c.fecha DESC`;
    
  const res = await this.database.executeSql(sql, [productoId]);
  let comentarios = [];
  
  for (let i = 0; i < res.rows.length; i++) {
    comentarios.push(res.rows.item(i));
  }
  
  return comentarios;
}

async crearUsuarioAdminPorDefecto() {
  const sql = 'SELECT COUNT(*) as count FROM usuario WHERE es_admin = 1';
  try {
    const res = await this.database.executeSql(sql, []);
    if (res.rows.item(0).count === 0) {
      const usuarioAdmin: Usuario = {
        id: 0,  
        nombre: 'admin',
        email: 'admin@example.com',
        contrasenia: 'admin123',
        telefono: 123456789,
        fecha_registro: new Date().toISOString(),
        es_admin: true,
        imagen: '' 
      };
      await this.registrarUsuario(usuarioAdmin);
      this.presentAlert('Éxito', 'Usuario administrador por defecto creado.');
    } else {
      console.log('Ya existe un administrador, no es necesario crear otro.');
    }
  } catch (e) {
    this.presentAlert('Error al verificar el administrador por defecto', JSON.stringify(e));
  }
}


}



