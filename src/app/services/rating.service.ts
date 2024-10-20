import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = 'https://api-calificaciones-dk9v.onrender.com/api/ratings';

  constructor(private http: HttpClient) { }

  getRatings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  postRatings(rating: { score: number; review: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, rating);
  }
}
