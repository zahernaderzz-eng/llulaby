import { IdentityDocument } from 'src/modules/identities/entities/identity.entity';
import { UserDocument } from '../entities/user.entity';

export interface IUserFullData {
    identity: IdentityDocument;
    profile: UserDocument;
}
