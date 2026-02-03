import { fakerES as faker } from "@faker-js/faker";
import { createHash } from "./user-utils";

export const generateUsers = () => {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 10, max: 100 }),
        password: createHash("coder123"),
        cart: null,
        role: faker.helpers.arrayElement(["user", "admin"])
    }
}

