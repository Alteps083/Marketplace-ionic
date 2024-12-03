import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from './usuario';
import { Notificacion } from './notificacion';
import { Producto } from './producto';
import { Subject } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';


@Injectable({
  providedIn: 'root'
})
export class ServicebdService {

  usuarioSeleccionado: any;  
  razonBan: string = '';      
  duracionBan: number = 0;   

  public productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

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
      imagen TEXT,
      estado INTEGER DEFAULT 0 -- 0 = Activo, 1 = Baneado
    )`;
    
  listaUsuarios = new BehaviorSubject<Usuario[]>([]);
  mostrarUsuarios = this.listaUsuarios.asObservable();

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

  tablaNotificaciones: string = `
      CREATE TABLE IF NOT EXISTS notificaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productoId INTEGER,
        imagen TEXT,
        nombreUsuario TEXT,
        nombreProducto TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    tablaCategorias: string = `CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL
);
`;

tablaImagenesCarrusel: string = `CREATE TABLE IF NOT EXISTS imagenes_carrusel (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   url TEXT
);`;

tablaban: string = `CREATE TABLE IF NOT EXISTS ban (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER,
  razon TEXT NOT NULL,
  duracion INTEGER NOT NULL,
  fecha_expiracion TEXT NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);
`;

  listarProductos = new BehaviorSubject<Producto[]>([]);

  listarReclamos = new BehaviorSubject<any[]>([]);

  private profileImageSubject = new Subject<string | null>();
  
  public listaReclamos$ = this.listarReclamos.asObservable();

  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(private sqlite: SQLite, private platform: Platform, private alertController: AlertController, private storage: NativeStorage) { }

  private usuarioActual: Usuario | null = null

  setUsuarioActual(usuario: Usuario) {
    this.usuarioActual = usuario;
    if (usuario.imagen && usuario.imagen.trim() !== '') {
      this.storage.setItem('usuario_imagen', usuario.imagen);
    }
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

  async obtenerImagenPerfil(nombre: string): Promise<string> {
    try {
      console.log('Obteniendo imagen de perfil para el usuario:', nombre);

      const imagen = await this.storage.getItem(`imagen_${nombre}`);

      if (imagen && imagen.startsWith('http')) {
        return imagen; 
      } else {
        console.log('No se encontró imagen, usando la imagen predeterminada');
        return 'assets/img/nouser.png'; 
      }
    } catch (error) {
      console.log('Error al obtener la imagen de perfil:', error);
      return 'assets/img/nouser.png'; 
    }
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
        this.verificarYAgregarColumnaEstado().then(() => {
          this.crearTablas().then(() => {
            this.cargarUsuarios(); 
            this.cargarProductos();
            this.crearUsuarioAdminPorDefecto();
            this.isDBReady.next(true);
          });
        });
      }).catch(e => {
        this.presentAlert('Error al crear la base de datos', JSON.stringify(e));
      });
    });
  }

  async crearTablas(){
    try {
      console.log("Creando tabla de usuarios...");
      await this.database.executeSql(this.tablaUsuario, []);
      console.log("Tabla de usuarios creada correctamente");
  
      console.log("Creando tabla de productos...");
      await this.database.executeSql(this.tablaProductos, []);
      console.log("Tabla de productos creada correctamente");
  
      console.log("Creando tabla de reclamos...");
      await this.database.executeSql(this.tablaReclamos, []);
      console.log("Tabla de reclamos creada correctamente");
  
      console.log("Creando tabla de comentarios...");
      await this.database.executeSql(this.tablaComentarios, []);
      console.log("Tabla de comentarios creada correctamente");
  
      console.log("Creando tabla de notificaciones...");
      await this.database.executeSql(this.tablaNotificaciones, []);
      console.log("Tabla de notificaciones creada correctamente");
  
      console.log("Creando tabla de ban...");
      await this.database.executeSql(this.tablaban, []);
      console.log("Tabla de ban creada correctamente");
  
      await this.actualizarTablaUsuario();
      await this.asignarIdAUsuariosExistentes();
  
    } catch (e) {
      console.error('Error al crear tablas:', e);
      this.presentAlert('Error al crear tablas', JSON.stringify(e));
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

    async verificarTelefonoExistente(telefono: string): Promise<boolean> {
      const query = 'SELECT COUNT(*) as count FROM usuario WHERE telefono = ?';
      const result = await this.database.executeSql(query, [telefono]);
      return result.rows.item(0).count > 0; 
    }

    async agregarProducto(idvendedor: number | undefined,nombre_producto: string,descripcion: string,categoria: string,estado: string,precio: number,imagenes: string[]): Promise<number | null> {
      if (idvendedor === undefined) {
        this.presentAlert('Error', 'El id del vendedor no está definido');
        return null;
      }
      const query = `
        INSERT INTO productos (id_vendedor, nombre_producto, descripcion, categoria, estado, precio, imagenes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const imagenesJSON = JSON.stringify(imagenes);
      const values = [idvendedor, nombre_producto, descripcion, categoria, estado, precio, imagenesJSON];
      try {
        const res: any = await this.database.executeSql(query, values); 
        const productoId = res.insertId; 
    
        await this.cargarProductos();
    
        return productoId; 
      } catch (e) {
        this.presentAlert('Error al agregar producto', JSON.stringify(e));
        return null;
      }
    }

    async loginUsuario(nombre: string, contrasenia: string): Promise<boolean> {
      const sql = `SELECT * FROM usuario WHERE nombre = ? AND contrasenia = ?`;
      const params = [nombre, contrasenia];
    
      try {
        const result = await this.database.executeSql(sql, params);
    
        if (result.rows.length > 0) {
          const usuario = result.rows.item(0);
    
          // Verificar si el usuario está baneado según el campo 'estado'
          if (usuario.estado === 1) {
            // Obtener detalles del baneo desde la tabla 'ban'
            const sqlban = `
              SELECT razon, fecha_expiracion 
              FROM ban 
              WHERE id_usuario = ? AND fecha_expiracion > datetime('now')
            `;
            const paramsban = [usuario.id];
            const resultban = await this.database.executeSql(sqlban, paramsban);
    
            if (resultban.rows.length > 0) {
              const baneo = resultban.rows.item(0);
              this.presentAlert(
                'Acceso Denegado',
                `Su cuenta está baneada por: ${baneo.razon}. 
                Este baneo expira en: ${baneo.fecha_expiracion}.`
              );
            } else {
              this.presentAlert(
                'Acceso Denegado',
                'Su cuenta está marcada como baneada, pero no se encontraron detalles en la base de datos.'
              );
            }
            return false;
          }
    
          // Si no está baneado, continúa con el login
          this.setUsuarioActual(usuario);
          await this.storage.setItem('usuario_actual', {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono,
            es_admin: usuario.es_admin,
            imagen: usuario.imagen,
          });
    
          return true;
        } else {
          this.presentAlert('Login Fallido', 'Nombre o Contraseña incorrectos');
          return false;
        }
      } catch (e) {
        this.presentAlert('Error en el login', JSON.stringify(e));
        return false;
      }
    }
    
    

    async actualizarUsuario(usuario: Usuario){
      const sql = 'UPDATE usuario SET nombre = ?, email = ?, telefono = ?, contrasenia = ?, imagen = ? WHERE id = ?';
      try{
        await this.database.executeSql(sql, [usuario.nombre, usuario.email, usuario.telefono, usuario.contrasenia, usuario.imagen, usuario.id])
        if (usuario.imagen && usuario.imagen.trim() !== '') {
          await this.storage.setItem('usuario_imagen', usuario.imagen);
        }
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
      }
    }

    async obtenerUsuarioPorTelefono(telefono: string): Promise<any> {
      const query = 'SELECT * FROM usuario WHERE telefono = ?';
      const resultado = await this.database.executeSql(query, [telefono]);
      
      if (resultado.rows.length > 0) {
        return resultado.rows.item(0); 
      }
      return null; 
    }

    async cargarUsuarioActual() {
      try {
          const usuario = await this.storage.getItem('usuario_actual');
          if (usuario) {
              this.usuarioActual = usuario;
              const imagen = await this.obtenerImagenUsuario(usuario.id);
              this.profileImageSubject.next(imagen); 
          } else {
              console.warn('No se encontró el usuario actual en NativeStorage');
          }
      } catch (e) {
          console.error('Error al cargar el usuario actual', e);
      }
    }

    async cargarProductos() {
      const sql = 'SELECT * FROM productos';
      this.obtenerProductos().then(productos => {
        this.productosSubject.next(productos);
      });
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

    async getPublicacionesPorUsuario(usuarioId: number): Promise<Producto[]> {
      try {
          const res = await this.database.executeSql('SELECT * FROM productos WHERE id_vendedor = ?', [usuarioId]);
          let publicaciones: Producto[] = [];
          for (let i = 0; i < res.rows.length; i++) {
              const producto = res.rows.item(i);
              producto.imagenes = producto.imagenes ? JSON.parse(producto.imagenes) : [];
              publicaciones.push(producto);
          }
          return publicaciones;
      } catch (error) {
          console.error('Error al obtener publicaciones por usuario:', error);
          return [];
      }
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
        
    
        async obtenerImagenUsuario(id: number): Promise<string> {
          const sql = 'SELECT imagen FROM usuario WHERE id = ?';
          try {
            const result = await this.database.executeSql(sql, [id]);
            if (result.rows.length > 0) {
              const imagen = result.rows.item(0).imagen;
              return imagen && imagen.trim() !== '' ? imagen : 'src/assets/img/nouser.png';
            } else {
              return 'src/assets/img/nouser.png';
            }
          } catch (e) {
            return 'src/assets/img/nouser.png';
          }
        }



        async buscarProductosPorNombre(nombre: string): Promise<Producto[]> {
          const sql = 'SELECT * FROM productos WHERE nombre_producto LIKE ?';
          const params = [`%${nombre}%`]; // El % es un comodín para buscar coincidencias
          try {
            const res = await this.database.executeSql(sql, params);
            let productos: Producto[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              const producto = res.rows.item(i);
              producto.imagenes = JSON.parse(producto.imagenes || '[]');
              productos.push(producto);
            }
            return productos;
          } catch (e) {
            this.presentAlert('Error al buscar productos', JSON.stringify(e));
            return [];
          }
        }

async obtenerIdLogueado(): Promise<number | null> {
  const usuarioId = await localStorage.getItem('id'); 
  return usuarioId ? parseInt(usuarioId, 10) : null;
}

async obtenerUsuarioPorId(id: number): Promise<Usuario | null> {
  const query = `SELECT * FROM usuario WHERE id = ?`;

  try {
    if (this.database) {
      const resultado = await this.database.executeSql(query, [id]);

      if (resultado.rows.length > 0) {
        // Devuelve el primer usuario encontrado
        const row = resultado.rows.item(0);
        const usuario: Usuario = {
          id: row.id,
          nombre: row.nombre,
          email: row.email,
          contrasenia: row.contrasenia,
          telefono: row.telefono,
          fecha_registro: row.fecha_registro,
          es_admin: row.es_admin,
          imagen: row.imagen,
          estado: 0
        };
        return usuario;
      }
    }
    return null; // No se encontró el usuario
  } catch (error) {
    console.error('Error ejecutando la consulta', error);
    return null;
  }
}

// Método para inicializar la base de datos y asignar el objeto db
setDatabase(db: SQLiteObject) {
  this.database = db;
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
        imagen: '',
        estado: 0
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

obtenerProductos(): Promise<Producto[]> {
  const query = 'SELECT * FROM productos';
  
  return this.database.executeSql(query, []).then(result => {
    const productos: Producto[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      productos.push(result.rows.item(i));
    }
    return productos;
  });
}

async getNotifications(): Promise<Notificacion[]> {
  try {
    const res = await this.database?.executeSql('SELECT * FROM notificaciones', []);
    const notifications: Notificacion[] = [];
    for (let i = 0; i < (res?.rows.length || 0); i++) {
      const row = res?.rows.item(i);
      notifications.push({
        id: row.id,
        imagen: row.imagen,
        nombreUsuario: row.nombreUsuario,
        nombreProducto: row.nombreProducto,
        fecha: row.date
      });
    }
    return notifications;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
}

async addNotification(notificacion: Notificacion) {
  try {
    await this.database?.executeSql(
      'INSERT INTO notificaciones (imagen, nombreUsuario, nombreProducto, fecha) VALUES (?, ?, ?, ?)',
      [
        notificacion.imagen || '',             // Usa una cadena vacía si no hay imagen
        notificacion.nombreUsuario,
        notificacion.nombreProducto,
        new Date().toISOString()               // Fecha actual en formato ISO
      ]
    );
  } catch (error) {
    console.error('Error al agregar notificación:', error);
  }
}

async deleteNotification(id: number) {
  try {
    await this.database?.executeSql('DELETE FROM notificaciones WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
  }
}

async actualizarEstadoUsuario(id: number, nuevoEstado: number): Promise<void> {
  const query = `UPDATE usuario SET estado = ? WHERE id = ?`;
  await this.database.executeSql(query, [nuevoEstado, id]);
}

async verificarYAgregarColumnaEstado() {
  try {
    const resultado = await this.database.executeSql("PRAGMA table_info(usuario);", []);
    const columnas = [];
    
    for (let i = 0; i < resultado.rows.length; i++) {
      columnas.push(resultado.rows.item(i).name);
    }

    if (!columnas.includes('estado')) {
      console.log("La columna 'estado' no existe. Agregando columna...");
      await this.database.executeSql("ALTER TABLE usuario ADD COLUMN estado INTEGER DEFAULT 0;", []);
      console.log("Columna 'estado' agregada correctamente.");
      await this.database.executeSql("UPDATE usuario SET estado = 0;", []);
      console.log("Estado inicializado a 0 para todos los usuarios.");
    } else {
      console.log("La columna 'estado' ya existe.");
    }
  } catch (error) {
    console.error("Error al verificar o agregar la columna 'estado':", error);
  }
}

// tabla categorias
async openDatabase(): Promise<SQLiteObject> {
  const db = await this.sqlite.create({
    name: 'mi_basedatos.db',
    location: 'default',
  });
  await db.executeSql(this.tablaCategorias, []); // Crea la tabla si no existe
  await db.executeSql(this.tablaImagenesCarrusel, []);
  return db;
}

  // Método para agregar una categoría
  async agregarCategoria(nombre: string): Promise<void> {
    const db = await this.openDatabase();
    const query = 'INSERT INTO categorias (nombre) VALUES (?)';
    await db.executeSql(query, [nombre]);
  }

  // Método para eliminar una categoría
  async eliminarCategoria(id_categoria: number): Promise<void> {
    const db = await this.openDatabase();
    const query = 'DELETE FROM categorias WHERE id_categoria = ?';
    await db.executeSql(query, [id_categoria]);
  }

  // Método para obtener todas las categorías
  async obtenerCategorias(): Promise<any[]> {
    const db = await this.openDatabase();
    const result = await db.executeSql('SELECT * FROM categorias', []);
    const categorias = [];
    for (let i = 0; i < result.rows.length; i++) {
      categorias.push(result.rows.item(i));
    }
    return categorias;
  }

async agregarImagen(imagenBase64: string) {
  const query = 'INSERT INTO imagenes_carrusel (imagen) VALUES (?)';
  try {
    const db: SQLiteObject = await this.openDatabase();
    await db.executeSql(query, [imagenBase64]);
  } catch (error) {
    console.error('Error al insertar la imagen en el carrusel:', error);
  }
}

async eliminarImagen(id: number): Promise<void> {
  const db = await this.openDatabase();
  const query = 'DELETE FROM imagenes_carrusel WHERE id = ?';
  await db.executeSql(query, [id]);
}

async obtenerImagenes(): Promise<any[]> {
  const db = await this.openDatabase();
  const result = await db.executeSql('SELECT * FROM imagenes_carrusel', []);
  const imagenes = [];
  for (let i = 0; i < result.rows.length; i++) {
    imagenes.push(result.rows.item(i));
  }
  return imagenes;
}

insertarImagen(imagenBase64: string) {
  const query = `INSERT INTO imagenes_carrusel (url) VALUES (?)`;
  this.database.executeSql(query, [imagenBase64]).then(() => {
     console.log('Imagen insertada correctamente');
  }).catch(error => {
     console.error('Error al insertar la imagen', error);
  });
}

async eliminarTabla(): Promise<void> {
  const sql = `DROP TABLE IF EXISTS notificaciones`;
  try {
    await this.database.executeSql(sql, []);
    console.log(`Tabla 'notificaciones' eliminada correctamente.`);
  } catch (error) {
    console.error(`Error al eliminar la tabla 'notificaciones':`, error);
  }
}



async verificarUsuarioBaneado(id: number) {
  try {
    console.log('Verificando si el usuario está baneado, id:', id);
    const query = `
      SELECT razon, fecha_expiracion 
      FROM ban 
      WHERE id_usuario = ? AND fecha_expiracion > ?
    `;
    const fechaActual = new Date().toISOString();
    const result = await this.database.executeSql(query, [id, fechaActual]);

    if (result.rows.length > 0) {
      const ban = result.rows.item(0);
      throw new Error(
        `Tu cuenta está baneada. Razón: ${ban.razon}. Expira: ${new Date(ban.fecha_expiracion).toLocaleDateString()}`
      );
    } else {
      console.log('El usuario no está baneado.');
    }
  } catch (error) {
    console.error('Error al gestionar el baneo:', error);
    throw new Error('Error al gestionar el baneo');
  }
}
async obtenerUsuariosBan() {
  const sql = 'SELECT * FROM ban'; // Usar 'baneos' en lugar de 'ban'
  try {
    const res = await this.database.executeSql(sql, []);
    let ban: any[] = [];
    for (let i = 0; i < res.rows.length; i++) {
      ban.push(res.rows.item(i));
    }
    return ban;
  } catch (e) {
    console.error('Error al obtener baneos:', e);
    return [];
  }
}

async confirmarBaneo(usuarioSeleccionado: any, razonBan: string, duracionBan: number) {
  if (usuarioSeleccionado && razonBan.trim() && duracionBan > 0) {
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + duracionBan);

    try {
      if (usuarioSeleccionado.estado === 1) {
        await this.database.executeSql(
          `DELETE FROM ban WHERE id_usuario = ?`,
          [usuarioSeleccionado.id]
        );
        await this.database.executeSql(
          `UPDATE usuario SET estado = 0 WHERE id = ?`,
          [usuarioSeleccionado.id]
        );
        usuarioSeleccionado.estado = 0;

        this.presentAlert('Éxito', 'Usuario desbaneado correctamente.');
      } else {
        const db = await this.crearConexion();
        await this.database.executeSql(
          `INSERT INTO ban (id_usuario, razon, duracion, fecha_expiracion) VALUES (?, ?, ?, ?)`,
          [
            usuarioSeleccionado.id,
            razonBan.trim(),
            duracionBan,
            fechaExpiracion.toISOString(),
          ]
        );

        await this.database.executeSql(
          `UPDATE usuario SET estado = 1 WHERE id = ?`,
          [usuarioSeleccionado.id]
        );
        usuarioSeleccionado.estado = 1;
        this.presentAlert('Éxito', 'Usuario baneado correctamente.');
      }
    } catch (error) {
      console.error('Error al intentar modificar el estado del usuario:', error);
      this.presentAlert('Error', 'Hubo un problema al procesar el baneo.');
    }
  } else {
    this.presentAlert('Error', 'Por favor complete todos los campos correctamente.');
  }
}

eliminarBaneo(id: number): Promise<void> {
  return this.database.executeSql('DELETE FROM ban WHERE id = ?', [id])
    .then(() => {
      console.log('Baneo eliminado');
    })
    .catch(err => {
      console.error('Error al eliminar baneo', err);
    });
}


}
