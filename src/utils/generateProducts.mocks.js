import { fakerES as faker } from "@faker-js/faker";

export const generateProduct = () => {
  return {
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.float({ min: 100, max: 10000 }),
    stock: faker.number.int({ min: 1, max: 200 }),
    category: faker.commerce.department(),
    code: faker.string.alphanumeric(10),
    status: true,
    thumbnails: [faker.image.url()],
  };
};