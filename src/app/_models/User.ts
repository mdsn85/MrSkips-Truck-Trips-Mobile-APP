import { Vehicle } from './Vehicle';

export interface User {
    Id: Number;
    Name: String;
    Helpers: Array<User>;
    Vehicle: Vehicle;
    StartKM: Number;
}
