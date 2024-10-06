import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from './usuario';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {

  public database!: SQLiteObject;

  tablaUsuario: string = 'CREATE TABLE IF NOT EXISTS usuario(id INTEGER PRIMARY KEY autoincrement, nombre VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, contrasenia VARCHAR(25) NOT NULL, telefono INTEGER, fecha_registro TEXT NOT NULL, es_admin BOOLEAN NOT NULL)'
  
  registroAdmin: string = 'INSERT or IGNORE INTO usuario (nombre, email, contrasenia, telefono, fecha_registro, es_admin) VALUES (matias, mat.riosr@duocuc.cl, chile123, 56999912311233123, ?, ?)';

  listaUsuarios = new BehaviorSubject<Usuario[]>([]);

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
      }catch(e){
        this.presentAlert('Error al crear tablas', JSON.stringify(e))
      }
    }

    async registrarUsuario(nombre: string, email: string, contrasenia: string, telefono: number){
      const fecha_registro = new Date().toISOString();
      const es_admin = 0;
      const sql = 'INSERT or IGNORE INTO usuario (nombre, email, contrasenia, telefono, fecha_registro, es_admin) VALUES (?, ?, ?, ?, ?, ?)';

      try{
        await this.database.executeSql(sql, [nombre, email, contrasenia, telefono, fecha_registro, es_admin]);
        this.presentAlert('Exito', 'Usuario registrado Correctamente'); 
      }catch(e){
        this.presentAlert('Error al registrar el usuario', JSON.stringify(e));
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

    async cargarUsuarios() {
      const sql = 'SELECT * FROM usuario';
      try {
        const res = await this.database.executeSql(sql, []);
        let usuarios: Usuario[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          const usuario = res.rows.item(i);
          usuarios.push(usuario);
          console.log('Usuario en BD:', usuario);
        }
        this.listaUsuarios.next(usuarios);
      } catch (e) {
        this.presentAlert('Error al cargar usuarios', JSON.stringify(e));
      }
    }
  }




