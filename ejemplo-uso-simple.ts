/**
 * EJEMPLO SIMPLE DE USO DEL SERVICIO AFIP TIME
 * 
 * Este archivo muestra diferentes formas de usar el TimeService
 * en tus propios componentes Angular.
 */

import { Component, OnInit } from '@angular/core';
import { TimeService, AfipTimeResponse } from './src/app/services/time.service';

// ============================================================================
// EJEMPLO 1: Uso básico en un componente
// ============================================================================

@Component({
  selector: 'app-ejemplo-basico',
  template: `
    <div>
      <h2>Ejemplo Básico</h2>
      <p *ngIf="fechaHora">
        Fecha: {{ fechaHora.fecha }} | Hora: {{ fechaHora.hora }}
      </p>
      <p *ngIf="error" style="color: red;">{{ error }}</p>
      <button (click)="obtenerHora()">Obtener Hora AFIP</button>
    </div>
  `
})
export class EjemploBasicoComponent implements OnInit {
  fechaHora: AfipTimeResponse | null = null;
  error: string = '';

  constructor(private timeService: TimeService) {}

  ngOnInit() {
    this.obtenerHora();
  }

  obtenerHora() {
    this.timeService.getTime().subscribe({
      next: (data) => {
        this.fechaHora = data;
        this.error = '';
        console.log('Datos AFIP:', data);
      },
      error: (err) => {
        this.error = err.message;
        this.fechaHora = null;
      }
    });
  }
}

// ============================================================================
// EJEMPLO 2: Uso con async/await
// ============================================================================

@Component({
  selector: 'app-ejemplo-async',
  template: `
    <div>
      <h2>Ejemplo con Async/Await</h2>
      <p>{{ mensaje }}</p>
      <button (click)="obtenerHoraAsync()" [disabled]="cargando">
        {{ cargando ? 'Cargando...' : 'Obtener Hora' }}
      </button>
    </div>
  `
})
export class EjemploAsyncComponent {
  mensaje: string = 'Presiona el botón para obtener la hora';
  cargando: boolean = false;

  constructor(private timeService: TimeService) {}

  async obtenerHoraAsync() {
    this.cargando = true;
    try {
      const data = await this.timeService.getTime().toPromise();
      this.mensaje = `Fecha: ${this.formatearFecha(data!.fecha)} - Hora: ${this.formatearHora(data!.hora)}`;
    } catch (error) {
      this.mensaje = `Error: ${error}`;
    } finally {
      this.cargando = false;
    }
  }

  private formatearFecha(fecha: string): string {
    // Convierte YYYYMMDD a DD/MM/YYYY
    return `${fecha.slice(6,8)}/${fecha.slice(4,6)}/${fecha.slice(0,4)}`;
  }

  private formatearHora(hora: string): string {
    // Convierte HHMMSS a HH:MM:SS
    return `${hora.slice(0,2)}:${hora.slice(2,4)}:${hora.slice(4,6)}`;
  }
}

// ============================================================================
// EJEMPLO 3: Uso con polling automático (actualización periódica)
// ============================================================================

@Component({
  selector: 'app-ejemplo-polling',
  template: `
    <div>
      <h2>Reloj AFIP en Tiempo Real</h2>
      <div *ngIf="horaActual">
        <h3>{{ fechaFormateada }}</h3>
        <h1>{{ horaFormateada }}</h1>
        <small>Última actualización: {{ ultimaActualizacion }}</small>
      </div>
      <div>
        <button (click)="iniciarPolling()" [disabled]="pollingActivo">Iniciar</button>
        <button (click)="detenerPolling()" [disabled]="!pollingActivo">Detener</button>
        <span>Intervalo: {{ intervaloSegundos }}s</span>
      </div>
    </div>
  `
})
export class EjemploPollingComponent implements OnInit {
  horaActual: AfipTimeResponse | null = null;
  pollingActivo: boolean = false;
  intervaloSegundos: number = 30;
  ultimaActualizacion: string = '';
  private intervalId: any;

  constructor(private timeService: TimeService) {}

  ngOnInit() {
    this.obtenerHoraInicial();
  }

  ngOnDestroy() {
    this.detenerPolling();
  }

  get fechaFormateada(): string {
    if (!this.horaActual) return '';
    const f = this.horaActual.fecha;
    return `${f.slice(6,8)}/${f.slice(4,6)}/${f.slice(0,4)}`;
  }

  get horaFormateada(): string {
    if (!this.horaActual) return '';
    const h = this.horaActual.hora;
    return `${h.slice(0,2)}:${h.slice(2,4)}:${h.slice(4,6)}`;
  }

  obtenerHoraInicial() {
    this.timeService.getTime().subscribe({
      next: (data) => {
        this.horaActual = data;
        this.ultimaActualizacion = new Date().toLocaleTimeString();
      },
      error: (err) => console.error('Error inicial:', err)
    });
  }

  iniciarPolling() {
    if (this.pollingActivo) return;
    
    this.pollingActivo = true;
    this.intervalId = setInterval(() => {
      this.timeService.getTime().subscribe({
        next: (data) => {
          this.horaActual = data;
          this.ultimaActualizacion = new Date().toLocaleTimeString();
        },
        error: (err) => {
          console.error('Error en polling:', err);
          // Opcional: detener polling en caso de errores consecutivos
        }
      });
    }, this.intervaloSegundos * 1000);
  }

  detenerPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.pollingActivo = false;
  }
}

// ============================================================================
// EJEMPLO 4: Servicio extendido con caché
// ============================================================================

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimeServiceConCache extends TimeService {
  private cache: { data: AfipTimeResponse; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 60000; // 1 minuto en millisegundos

  override getTime(): Observable<AfipTimeResponse> {
    // Verificar si tenemos datos en caché válidos
    if (this.cache && (Date.now() - this.cache.timestamp) < this.CACHE_DURATION) {
      console.log('Usando datos del caché');
      return of(this.cache.data);
    }

    // Si no hay caché válido, hacer petición nueva
    console.log('Obteniendo datos frescos de AFIP');
    return super.getTime().pipe(
      tap(data => {
        // Guardar en caché
        this.cache = {
          data: data,
          timestamp: Date.now()
        };
      })
    );
  }

  limpiarCache(): void {
    this.cache = null;
  }

  obtenerEstadoCache(): { tieneCache: boolean; tiempoRestante?: number } {
    if (!this.cache) {
      return { tieneCache: false };
    }

    const tiempoTranscurrido = Date.now() - this.cache.timestamp;
    const tiempoRestante = Math.max(0, this.CACHE_DURATION - tiempoTranscurrido);

    return {
      tieneCache: tiempoRestante > 0,
      tiempoRestante: Math.ceil(tiempoRestante / 1000) // en segundos
    };
  }
}

// ============================================================================
// EJEMPLO 5: Uso en un servicio personalizado
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class MiServicioPersonalizado {
  constructor(private timeService: TimeService) {}

  async validarHorarioComercial(): Promise<boolean> {
    try {
      const tiempo = await this.timeService.getTime().toPromise();
      const hora = parseInt(tiempo!.hora.slice(0, 2)); // Extraer hora
      
      // Horario comercial: 9:00 a 18:00
      return hora >= 9 && hora < 18;
    } catch (error) {
      console.error('Error al validar horario:', error);
      return false; // En caso de error, asumir fuera de horario
    }
  }

  async obtenerTimestampAfip(): Promise<number> {
    try {
      const tiempo = await this.timeService.getTime().toPromise();
      
      // Convertir fecha y hora AFIP a timestamp
      const fecha = tiempo!.fecha; // YYYYMMDD
      const hora = tiempo!.hora;   // HHMMSS
      
      const year = parseInt(fecha.slice(0, 4));
      const month = parseInt(fecha.slice(4, 6)) - 1; // Los meses en JS van de 0-11
      const day = parseInt(fecha.slice(6, 8));
      const hours = parseInt(hora.slice(0, 2));
      const minutes = parseInt(hora.slice(2, 4));
      const seconds = parseInt(hora.slice(4, 6));
      
      const fechaAfip = new Date(year, month, day, hours, minutes, seconds);
      return fechaAfip.getTime();
    } catch (error) {
      throw new Error(`Error al obtener timestamp AFIP: ${error}`);
    }
  }

  compararConHoraLocal(): Observable<{ diferencia: number; mensaje: string }> {
    return this.timeService.getTime().pipe(
      map(tiempo => {
        const timestampAfip = this.convertirAfipATimestamp(tiempo);
        const timestampLocal = Date.now();
        const diferencia = Math.abs(timestampAfip - timestampLocal);
        const segundosDiferencia = Math.round(diferencia / 1000);
        
        return {
          diferencia: segundosDiferencia,
          mensaje: `Diferencia con hora local: ${segundosDiferencia} segundos`
        };
      })
    );
  }

  private convertirAfipATimestamp(tiempo: AfipTimeResponse): number {
    const fecha = tiempo.fecha;
    const hora = tiempo.hora;
    
    const year = parseInt(fecha.slice(0, 4));
    const month = parseInt(fecha.slice(4, 6)) - 1;
    const day = parseInt(fecha.slice(6, 8));
    const hours = parseInt(hora.slice(0, 2));
    const minutes = parseInt(hora.slice(2, 4));
    const seconds = parseInt(hora.slice(4, 6));
    
    return new Date(year, month, day, hours, minutes, seconds).getTime();
  }
}

// ============================================================================
// INSTRUCCIONES DE USO
// ============================================================================

/*
Para usar estos ejemplos en tu aplicación Angular:

1. Copia el TimeService a tu proyecto
2. Importa el servicio en el componente que desees usar
3. Inyecta el servicio en el constructor
4. Usa cualquiera de los patrones mostrados arriba

Ejemplo de importación en app.module.ts:

import { EjemploBasicoComponent } from './ejemplo-basico.component';
import { EjemploAsyncComponent } from './ejemplo-async.component';
// ... otros imports

@NgModule({
  declarations: [
    // ... otros componentes
    EjemploBasicoComponent,
    EjemploAsyncComponent,
    // ... otros ejemplos
  ],
  // ... resto de la configuración
})

Recuerda también importar HttpClientModule en tu app.module.ts para que funcionen las peticiones HTTP.
*/
