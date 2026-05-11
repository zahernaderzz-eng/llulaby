import { JwtService } from '@nestjs/jwt';
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IdentitiesService } from '../../modules/identities/identities.service';
import { UserTokensService } from '../../modules/user-tokens/user-tokens.service';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

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
    private iotService: any;

    constructor(
        private readonly jwtService: JwtService,
        private readonly identitiesService: IdentitiesService,
        private readonly userTokenService: UserTokensService,
        private readonly configService: ConfigService,
        private readonly moduleRef: ModuleRef,
    ) {}

    async handleConnection(socket: Socket) {
        try {
            console.log('🔌 [Socket] New connection attempt...');

            // دعم Token من auth, headers, أو query string
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers.token ||
                socket.handshake.query?.token;

            if (!token) {
                console.error('❌ [Socket] No token provided');
                throw new Error('Unauthorized');
            }

            console.log('🔑 [Socket] Token received, verifying...');
            const decoded = await this.jwtService.verifyAsync(token as string, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            console.log('👤 [Socket] Token decoded, user ID:', decoded.id);

            const user = await this.identitiesService.findOne({
                _id: decoded.id,
                status: 'active',
                dataCompleted: true,
                isVerified: true,
            });

            if (!user) {
                console.error('❌ [Socket] User not found or not active');
                throw new Error('Unauthorized');
            }

            console.log('✅ [Socket] User found:', user.id);

            const tokenExists = await this.userTokenService.findOne({
                user: user.id,
                token: token as string,
            });

            if (!tokenExists) {
                console.error('❌ [Socket] Token not found in database');
                throw new Error('Unauthorized');
            }

            console.log('✅ [Socket] Token validated');

            socket.data.userId = user.id;
            socket.data.userType = user.type;

            this.connectedUsers.set(user.id, socket.id);

            console.log(
                `✅ [Socket] User ${user.id} connected via socket ${socket.id}`,
            );
        } catch (err) {
            console.error('❌ [Socket] Auth failed:', err.message);
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
    handlePing(@ConnectedSocket() socket: Socket) {
        socket.emit('pong', { message: 'pong' });
    }

    @SubscribeMessage('get-latest-sensor-data')
    async handleGetLatestSensorData(@ConnectedSocket() socket: Socket) {
        console.log('📡 [Socket] Received get-latest-sensor-data request');
        try {
            const userId = socket.data.userId;
            console.log(`👤 [Socket] User ID: ${userId}`);

            if (!userId) {
                console.error('❌ [Socket] User not authenticated');
                socket.emit('sensor-data-error', {
                    message: 'User not authenticated',
                });
                return;
            }

            const iotService = this.getIoTService();
            if (!iotService) {
                console.error('❌ [Socket] IoT service not available');
                socket.emit('sensor-data-error', {
                    message: 'IoT service not available',
                });
                return;
            }

            console.log(
                `🔍 [Socket] Fetching latest reading for user: ${userId}`,
            );
            const latestReading =
                await iotService.getLatestReadingByUser(userId);

            if (latestReading) {
                const childId =
                    typeof latestReading.child === 'string'
                        ? latestReading.child
                        : latestReading.child
                          ? (latestReading.child as any)._id?.toString() ||
                            (latestReading.child as any).toString()
                          : null;

                const responseData = {
                    deviceId: latestReading.deviceId,
                    childId: childId,
                    heartRate: latestReading.heartRate,
                    spo2: latestReading.spo2,
                    temperature: latestReading.temperature,
                    timestamp: latestReading.timestamp,
                };
                console.log('✅ [Socket] Latest reading found:', responseData);
                socket.emit('sensor-data', responseData);
            } else {
                console.warn(
                    '⚠️ [Socket] No sensor data found for user:',
                    userId,
                );
                socket.emit('sensor-data', null);
            }
        } catch (error) {
            console.error(
                '❌ [Socket] Error getting latest sensor data:',
                error,
            );
            socket.emit('sensor-data-error', {
                message: 'Failed to get sensor data',
            });
        }
    }

    private getIoTService() {
        if (!this.iotService) {
            try {
                console.log('🔧 [Socket] Loading IoTService...');
                const IoTServiceModule = require('../../modules/iot/iot.service');
                const IoTService = IoTServiceModule.IoTService;
                this.iotService = this.moduleRef.get(IoTService, {
                    strict: false,
                });
                console.log('✅ [Socket] IoTService loaded successfully');
            } catch (error) {
                console.error('❌ [Socket] Failed to load IoTService:', error);
            }
        }
        return this.iotService;
    }

    emitSensorData(
        userId: string,
        data: {
            deviceId: string;
            childId?: string;
            heartRate: number;
            spo2: number;
            temperature: number;
            timestamp: Date;
        },
    ): void {
        const socket = this.getUserSocket(userId);
        if (socket) {
            socket.emit('sensor-data', data);
        }
    }
}
