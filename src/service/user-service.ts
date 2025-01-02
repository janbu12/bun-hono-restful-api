import { prisma } from "../application/database";
import { RegisterUserRequest, toUserResponse, UserResponse } from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import { HTTPException } from 'hono/http-exception';

export class UserService {

    static async register(request: RegisterUserRequest) : Promise<UserResponse> {

        // valiasi request
        request = UserValidation.REGISTER.parse(request)

        // cek apakah ada di database
        const totalUserWithSameUsername = await prisma.user.count({
            where: {
                username: request.username
            }
        })
        
        if (totalUserWithSameUsername != 0) {
            throw new HTTPException(400, {
                message: "User with same username already exists"
            });;
        }

        // hashing password menggunakan bcrypt
        request.password = await Bun.password.hash(request.password, {
            algorithm: "bcrypt",
            cost: 10
        })

        // save ke database
        const user = await prisma.user.create({
            data:request
        })

        // return response
        return toUserResponse(user);
    }

}

