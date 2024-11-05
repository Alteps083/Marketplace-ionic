import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notificacion } from './notificacion';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { ServicebdService } from './servicebd.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationsPushService {

  constructor(private bd: ServicebdService) { 
    this.loadNotifications();
  }
  private notificationsSubject = new BehaviorSubject<Notificacion[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  public async loadNotifications() {
    const notifications = await this.bd.getNotifications();
    this.notificationsSubject.next(notifications);
  }

  async addNotification(notificacion: Notificacion) {
    try {
      await this.bd.addNotification(notificacion);
      await this.loadNotifications();
      // Actualizar el BehaviorSubject después de agregar
      const updatedNotifications = await this.bd.getNotifications();
      this.notificationsSubject.next(updatedNotifications);
    } catch (error) {
      console.error('Error al agregar la notificación:', error);
    }
  }

  async deleteNotification(id: number) {
    try {
      await this.bd.deleteNotification(id);
      await this.loadNotifications();
      const updatedNotifications = await this.bd.getNotifications();
      this.notificationsSubject.next(updatedNotifications);
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
    }
  }

}
