import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import serviceAccount from './firebase.json';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private initialized = false;

    onModuleInit() {
        this.initialize();
    }

    private initialize() {
        if (this.initialized) {
            return;
        }

        try {
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(
                        serviceAccount as admin.ServiceAccount,
                    ),
                });
            }

            this.initialized = true;
            console.log('✅ Firebase Admin SDK initialized');
        } catch (error) {
            console.error('❌ Error initializing Firebase Admin SDK', error);
            throw error;
        }
    }

    getAdmin() {
        return admin;
    }

    getAuth() {
        return admin.auth();
    }

    getMessaging() {
        return admin.messaging();
    }

    async verifyIdToken(idToken: string) {
        try {
            return await this.getAuth().verifyIdToken(idToken);
        } catch (error) {
            console.error('Error verifying ID token', error);
            throw error;
        }
    }

    async getUser(uid: string) {
        try {
            return await this.getAuth().getUser(uid);
        } catch (error) {
            console.error('Error getting user', error);
            throw error;
        }
    }

    async createCustomToken(
        uid: string,
        additionalClaims: Record<string, any> = {},
    ) {
        try {
            return await this.getAuth().createCustomToken(
                uid,
                additionalClaims,
            );
        } catch (error) {
            console.error('Error creating custom token', error);
            throw error;
        }
    }

    async sendNotification(message: admin.messaging.Message) {
        try {
            return await this.getMessaging().send(message);
        } catch (error) {
            console.error('Error sending notification', error);
            throw error;
        }
    }

    async sendMulticast(
        message: admin.messaging.MulticastMessage,
        tokens: string[],
    ) {
        try {
            return await this.getMessaging().sendEachForMulticast({
                ...message,
                tokens,
            });
        } catch (error) {
            console.error('Error sending multicast notification', error);
            throw error;
        }
    }
}
