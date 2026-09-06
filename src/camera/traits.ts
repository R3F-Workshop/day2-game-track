import { relation, trait } from 'koota';

export const Camera = trait();

export const Follows = relation({ exclusive: true });
export const IsFirstPerson = trait();
export const IsThirdPerson = trait();
