import { JwtService } from '@nestjs/jwt';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IdentitiesService } from '../../modules/identities/identities.service';
import { UserTokensService } from '../../modules/user-tokens/user-tokens.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketIoGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    connectedUsers: Map<string, string> = new Map<string, string>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly identitiesService: IdentitiesService,
        private readonly userTokenService: UserTokensService,
        private readonly configService: ConfigService,
    ) {}

    async handleConnection(socket: Socket) {
        try {
            const token =
                socket.handshake.auth?.token || socket.handshake.headers.token;
            if (!token) throw new Error('Unauthorized');

            const decoded = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            const user = await this.identitiesService.findOne({
                _id: decoded.id,
                status: 'active',
                dataCompleted: true,
                isVerified: true,
            });

            if (!user) throw new Error('Unauthorized');

            const tokenExists = await this.userTokenService.findOne({
                user: user.id,
                token,
            });

            if (!tokenExists) throw new Error('Unauthorized');

            socket.data.userId = user.id;
            socket.data.userType = user.type;

            this.connectedUsers.set(user.id, socket.id);

            console.log(`✅ User ${user.id} connected via socket ${socket.id}`);
        } catch (err) {
            console.log('Socket auth failed', err.message);
            socket.disconnect();
        }
    }

    handleDisconnect(socket: Socket) {
        const userId = socket.data.userId;
        if (userId) this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
    }

    getUserSocket(userId: string): Socket | null {
        const socketId = this.connectedUsers.get(userId);
        const socket = socketId
            ? this.server.sockets.sockets.get(socketId)
            : undefined;
        return socket ?? null;
    }

    @SubscribeMessage('ping')
    handlePing(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: { name: string },
    ) {
        socket.emit('pong', { message: `pong ${payload.name}` });
    }
}
