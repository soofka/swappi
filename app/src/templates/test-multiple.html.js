const en = (data) => `Hello world, this is ${data.title}!`;
const pl = (data) => `Cześć świecie, to jest ${data.title}!`;

export default {
    '-en': (data) => en(data),
    '-pl': (data) => pl(data),
};
