import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TrackService } from './shared/track.service';
import { AsyncPipe, JsonPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
} from '@microsoft/signalr';
import { Position } from './models/position.model';
import {
  BehaviorSubject,
  Subscription,
  asyncScheduler,
  throttleTime,
} from 'rxjs';

@Component({
  selector: 'sr-root',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle, AsyncPipe, JsonPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  trackService = inject(TrackService);
  subscription!: Subscription;
  connection!: HubConnection;
  position: Position = { x: 50, y: 50 };
  positionUpdater = new BehaviorSubject<Position>({ x: 3, y: 3 });

  ngOnInit() {
    this.connectToSignalRHub();

    this.initPositionUpdater();
  }

  connectToSignalRHub() {
    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7012/trackHub', {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('positionUpdated', (position: Position) => {
      this.position = position;
    });

    this.connection.start();
  }

  initPositionUpdater() {
    this.subscription = this.positionUpdater
      .pipe(
        throttleTime(100, asyncScheduler, { leading: true, trailing: true })
      )
      .subscribe((position: Position) => {
        this.sendPosition(position);
      });
  }

  onMove(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      this.positionUpdater.next({ x: event.pageX, y: event.pageY });
    }
    if (event instanceof TouchEvent) {
      this.positionUpdater.next({
        x: event.targetTouches[0]?.clientX,
        y: event.targetTouches[0]?.clientY,
      });
    }
  }

  sendPosition(position: Position) {
    if (this.connection.state === 'Connected') {
      this.connection.invoke('SendPosition', position);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
