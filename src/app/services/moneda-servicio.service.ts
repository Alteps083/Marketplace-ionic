import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonedaServicioService {

  private apiKey = '9791dfe9e106a5f4689a3c94';  
  private apiUrl = 'https://v6.exchangerate-api.com/v6/';

  constructor() { }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await fetch(`${this.apiUrl}${this.apiKey}/latest/${fromCurrency}`);
      const data = await response.json();

      if (data.result === 'success') {
        return data.conversion_rates[toCurrency];
      } else {
        throw new Error('Error al obtener la tasa de cambio');
      }
    } catch (error) {
      console.error('Error al obtener la tasa de cambio:', error);
      return 1;  
    }
  }
}