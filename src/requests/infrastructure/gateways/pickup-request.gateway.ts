import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class PickupRequestGateway {
  @WebSocketServer()
  server: Server;

  notifyPickupRequestCreated(data: any) {
    this.server.emit('pickupRequestCreated', data);
  }
}
