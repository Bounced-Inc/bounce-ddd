import { User } from '../models/users.model';
import { UserDto, UserDtoPatch } from '../dto/user.dto';

export class UserConverter {
    public static toDto(user: User): UserDto {
        return {
            id: user.id,
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            permissionLevel: user.permissionLevel
        };
    }

    public static toModel(dto: UserDto): User {
        return new User(
            dto.id,
            dto.email,
            dto.password,
            dto.firstName,
            dto.lastName,
            dto.permissionLevel
        );
    }
    public static toPatchModel(dto: UserDtoPatch): Partial<User> {
        return {
            ...(dto.email && { email: dto.email }),
            ...(dto.password && { password: dto.password }),
            ...(dto.firstName && { firstName: dto.firstName }),
            ...(dto.lastName && { lastName: dto.lastName }),
            ...(dto.permissionLevel && { permissionLevel: dto.permissionLevel })
        };
    }


    public static toDtoArray(users: User[]): UserDto[] {
        return users.map(user => this.toDto(user));
    }

    public static toModelArray(dtos: UserDto[]): User[] {
        return dtos.map(dto => this.toModel(dto));
    }
}