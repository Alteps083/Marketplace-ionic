import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
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

  getRatingsByProductId(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/product/${productId}`);
  }

  postRating(rating: { score: number; review: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, rating, { headers });
  }
}
