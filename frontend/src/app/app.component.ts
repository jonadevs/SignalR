import { Component, OnInit, inject } from '@angular/core';
import { TrackService } from './shared/track.service';
import { AsyncPipe, JsonPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
} from '@microsoft/signalr';
import { Position } from './models/position.model';

@Component({
  selector: 'sr-root',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle, AsyncPipe, JsonPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  trackService = inject(TrackService);
  connection!: HubConnection;
  position: Position = { x: 2, y: 2 };

  ngOnInit(): void {
    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7012/trackHub', {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .build();

    this.connection.on('positionUpdated', (position: Position) => {
      this.position = position;
    });

    this.connection
      .start()
      .then(() => console.log(`ConnectionId: ${this.connection.connectionId}`));

    console.log(`ConnectionId: ${this.connection.connectionId}`);
  }

  onClick(event: MouseEvent) {
    this.connection.invoke('SendPosition', { x: event.pageX, y: event.pageY });
  }
}
