import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TimeService, AfipTimeResponse } from '../../services/time.service';

@Component({
  selector: 'app-time-display',
  templateUrl: './time-display.component.html',
  styleUrls: ['./time-display.component.css']
})
export class TimeDisplayComponent implements OnInit, OnDestroy {
  timeData: AfipTimeResponse | null = null;
  loading: boolean = false;
  error: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private timeService: TimeService) {}

  ngOnInit(): void {
    this.loadAfipTime();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAfipTime(): void {
    this.loading = true;
    this.error = '';
    this.timeData = null;

    const timeSubscription = this.timeService.getTime().subscribe({
      next: (data: AfipTimeResponse) => {
        this.timeData = data;
        this.loading = false;
        console.log('Fecha y hora obtenida de AFIP:', data);
      },
      error: (error: Error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error al obtener fecha y hora de AFIP:', error);
      }
    });

    this.subscription.add(timeSubscription);
  }

  refreshTime(): void {
    this.loadAfipTime();
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    
    // Formato esperado de AFIP: YYYYMMDD
    if (fecha.length === 8) {
      const year = fecha.substring(0, 4);
      const month = fecha.substring(4, 6);
      const day = fecha.substring(6, 8);
      return `${day}/${month}/${year}`;
    }
    
    return fecha;
  }

  formatTime(hora: string): string {
    if (!hora) return '';
    
    // Formato esperado de AFIP: HHMMSS
    if (hora.length === 6) {
      const hours = hora.substring(0, 2);
      const minutes = hora.substring(2, 4);
      const seconds = hora.substring(4, 6);
      return `${hours}:${minutes}:${seconds}`;
    }
    
    return hora;
  }
}
