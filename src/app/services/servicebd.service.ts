import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from './usuario';
import { Producto } from './producto';
import { JsonPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {

  public database!: SQLiteObject;

  tablaUsuario: string = 'CREATE TABLE IF NOT EXISTS usuario(id INTEGER PRIMARY KEY autoincrement, nombre VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, contrasenia VARCHAR(25) NOT NULL, telefono INTEGER, fecha_registro TEXT NOT NULL, es_admin BOOLEAN NOT NULL)'
  listaUsuarios = new BehaviorSubject<Usuario[]>([]);

  tablaProductos: string = `CREATE TABLE IF NOT EXISTS productos(id INTEGER PRIMARY KEY AUTOINCREMENT,id_vendedor INTEGER, nombre_producto TEXT NOT NULL, descripcion TEXT, categoria TEXT, estado TEXT, 
    precio REAL NOT NULL, imagenes TEXT)`;

  listarProductos = new BehaviorSubject<Producto[]>([]);

  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(private sqlite: SQLite, private platform: Platform, private alertController: AlertController) { }

  private usuarioActual: Usuario | null = null

  setUsuarioActual(usuario: Usuario){
    this.usuarioActual = usuario;
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual;
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
      }catch(e){
        this.presentAlert('Error al crear tablas', JSON.stringify(e))
      }
    }


    async eliminarTablas() {
      try {
        await this.database.executeSql('DROP TABLE IF EXISTS productos', []);
        this.presentAlert('Éxito', 'Tablas eliminadas correctamente');
      } catch (e) {
        this.presentAlert('Error al eliminar tablas', JSON.stringify(e));
      }
    }

    async registrarUsuario(nombre: string, email: string, contrasenia: string, telefono: number){
      const fecha_registro = new Date().toISOString();
      const es_admin = false;
      const correoExistente =  await this.verificarCorreoExistente(email);
      if(correoExistente){
        this.presentAlert('Error', 'El correo ya está registrado');
        return false;
      } 
      const sql = 'INSERT or IGNORE INTO usuario (nombre, email, contrasenia, telefono, fecha_registro, es_admin) VALUES (?, ?, ?, ?, ?, ?)';
      try{
        await this.database.executeSql(sql, [nombre, email, contrasenia, telefono, fecha_registro, es_admin]);
        this.presentAlert('Exito', 'Usuario registrado Correctamente'); 
        return true;
      }catch(e){
        this.presentAlert('Error al registrar el usuario', JSON.stringify(e));
        return false;
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

    async agregarProducto(idvendedor: number,nombre_producto: string, descripcion: string, categoria: string, estado: string, precio: number, imagenes: string[]) {
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
      const sql = 'UPDATE usuario SET email = ?, telefono = ? WHERE nombre = ?';
      try{
        await this.database.executeSql(sql, [usuario.email, usuario.telefono, usuario.nombre])
        this.presentAlert('Exito', 'Datos actualizados correctamente');
        this.cargarUsuarios();
      }catch (e){
        this.presentAlert('Error al actualizar el usuario', JSON.stringify(e));
      }
    }

    async actualizarProducto(producto: Producto) {
      const sql = `UPDATE productos SET nombre_producto = ?, descripcion = ?, categoria = ?, estado = ?, precio = ?, imagenes = ? WHERE id = ?`;
      try {
        await this.database.executeSql(sql, [producto.nombre_producto, producto.descripcion, producto.categoria, producto.estado, producto.precio, JSON.stringify(producto.imagenes), producto.id]);
        this.presentAlert('Éxito', 'Producto actualizado correctamente');
        this.cargarProductos(); 
      } catch (e) {
        this.presentAlert('Error al actualizar el producto', JSON.stringify(e));
      }
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

  }




