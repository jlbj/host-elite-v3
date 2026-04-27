
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private http = inject(HttpClient);

  // --- Geocoding (Open-Meteo) ---
  // Improved robustness: Cleans address and tries fallbacks
  async getCoordinates(address: string): Promise<{ lat: number, lon: number } | null> {
    if (!address) return null;

    // 1. Clean the address (remove line breaks, keep it single line)
    const cleanAddress = address.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
    
    // Try the full address first
    let coords = await this.fetchCoords(cleanAddress);
    if (coords) return coords;

    // 2. Fallback: Try to extract just "Zip City" or "City" logic
    // This regex looks for a sequence of 4-5 digits (Zip) followed by words (City)
    const cityMatch = cleanAddress.match(/\b\d{4,5}\s+[a-zA-Z\u00C0-\u00FF\s-]+/);
    if (cityMatch) {
        coords = await this.fetchCoords(cityMatch[0]);
        if (coords) return coords;
    }

    // 3. Last resort: Try splitting by comma and taking the last part (often Country or City)
    const parts = cleanAddress.split(',');
    if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].trim();
        coords = await this.fetchCoords(lastPart);
        if (coords) return coords;
    }

    return null;
  }

  private async fetchCoords(query: string): Promise<{ lat: number, lon: number } | null> {
      try {
          const encoded = encodeURIComponent(query);
          const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=fr&format=json`;
          const response: any = await firstValueFrom(this.http.get(url));
          
          if (response && response.results && response.results.length > 0) {
              return {
                  lat: response.results[0].latitude,
                  lon: response.results[0].longitude
              };
          }
          return null;
      } catch (e) {
          console.warn(`Geocoding failed for query "${query}":`, e);
          return null;
      }
  }

  // --- Météo & UV (Open-Meteo) ---
  async getWeatherData(lat: number, lon: number): Promise<any> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,uv_index&timezone=auto`;
      const res: any = await firstValueFrom(this.http.get(url));
      return res.current;
    } catch (e) {
      console.error('Erreur météo:', e);
      return null;
    }
  }

  // --- Qualité de l'air (Open-Meteo Air Quality) ---
  async getAirQuality(lat: number, lon: number): Promise<number | null> {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`;
      const res: any = await firstValueFrom(this.http.get(url));
      return res.current?.european_aqi || null;
    } catch (e) {
      return null;
    }
  }

  // --- Devises (Frankfurter) ---
  async getExchangeRate(base: string = 'EUR', target: string = 'USD'): Promise<number | null> {
    try {
      const url = `https://open.er-api.com/v6/latest/${base}`;
      const res: any = await firstValueFrom(this.http.get(url));
      return res.rates?.[target] || null;
    } catch (e) {
      return null;
    }
  }

  // Helper pour interpréter les codes météo WMO
  getWeatherDescription(code: number): string {
    const codes: Record<number, string> = {
      0: 'Ensoleillé ☀️',
      1: 'Beau temps 🌤️',
      2: 'Nuageux ⛅',
      3: 'Couvert ☁️',
      45: 'Brouillard 🌫️',
      48: 'Givre 🌫️',
      51: 'Bruine 🌧️',
      53: 'Bruine 🌧️',
      55: 'Bruine 🌧️',
      61: 'Pluie ☔',
      63: 'Pluie ☔',
      65: 'Pluie forte ☔',
      71: 'Neige ❄️',
      73: 'Neige ❄️',
      75: 'Neige ❄️',
      95: 'Orage ⚡',
      96: 'Orage ⚡',
      99: 'Orage violent ⚡'
    };
    return codes[code] || 'Variable';
  }

  getAirQualityLabel(aqi: number): string {
    if (aqi <= 20) return 'Excellent 🟢';
    if (aqi <= 40) return 'Bon 🔵';
    if (aqi <= 60) return 'Moyen 🟡';
    if (aqi <= 80) return 'Médiocre 🟠';
    if (aqi <= 100) return 'Mauvais 🔴';
    return 'Dangereux 🟣';
  }
}
