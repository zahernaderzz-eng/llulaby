export class AuthUtil {
    static getIdentifierType(identifier: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+[0-9]{7,15}$/;

        if (emailRegex.test(identifier)) return 'email';
        else if (phoneRegex.test(identifier)) return 'phone';
        else return null;
    }
}
