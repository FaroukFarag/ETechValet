import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RecallRequestGateway {
    @WebSocketServer()
    server: Server;

    notifyRecallRequestCreated(data: any) {
        this.server.emit('recallRequestCreated', data);
    }
}
