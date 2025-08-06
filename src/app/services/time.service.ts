import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AfipTimeResponse {
  fecha: string;
  hora: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private readonly AFIP_TIME_URL = 'http://time.afip.gov.ar';

  constructor(private http: HttpClient) {}

  getTime(): Observable<AfipTimeResponse> {
    return this.http.get(this.AFIP_TIME_URL, { responseType: 'text' })
      .pipe(
        map(response => this.parseXmlResponse(response)),
        catchError(this.handleError)
      );
  }

  private parseXmlResponse(xmlString: string): AfipTimeResponse {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Verificar si hay errores de parsing
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Error al parsear la respuesta XML de AFIP');
      }

      // Extraer fecha y hora del XML
      const fechaElement = xmlDoc.querySelector('fecha');
      const horaElement = xmlDoc.querySelector('hora');

      if (!fechaElement || !horaElement) {
        throw new Error('No se encontraron los elementos fecha u hora en la respuesta de AFIP');
      }

      const fecha = fechaElement.textContent?.trim() || '';
      const hora = horaElement.textContent?.trim() || '';

      if (!fecha || !hora) {
        throw new Error('Los elementos fecha u hora están vacíos en la respuesta de AFIP');
      }

      return {
        fecha,
        hora
      };
    } catch (error) {
      throw new Error(`Error procesando la respuesta de AFIP: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido al obtener la hora de AFIP';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor de AFIP. Verifique su conexión a internet.';
          break;
        case 404:
          errorMessage = 'El servicio de tiempo de AFIP no está disponible (404).';
          break;
        case 500:
          errorMessage = 'Error interno del servidor de AFIP (500).';
          break;
        case 503:
          errorMessage = 'El servicio de AFIP no está disponible temporalmente (503).';
          break;
        default:
          errorMessage = `Error del servidor AFIP: ${error.status} - ${error.message}`;
      }
    }

    console.error('Error en TimeService:', error);
    return throwError(() => new Error(errorMessage));
  };
}
