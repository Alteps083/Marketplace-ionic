import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notificacion } from './notificacion';
@Injectable({
  providedIn: 'root'
})
export class NotificationsPushService {

  constructor() { }
  private notificationsSubject = new BehaviorSubject<Notificacion[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  addNotification(notificacion: Notificacion) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notificacion]);
  }

}
