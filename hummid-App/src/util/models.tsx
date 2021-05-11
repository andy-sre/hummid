import firebase from "firebase/app";

export interface User {
    userId: string;
    fname: string;
    lname: string;
    country: string;
    city: string;
    email: string;
    phone: number;
}

export interface Setting {
    userId: string;
    auto: boolean,
    manual: boolean,
    maxTemp: number,
    minTemp: number,
}

export interface WeatherData {
    base: string;
    clouds: {
        all: number;
    };
    cod: number;
    coord: {
        lon: number;
        lat: number;
    };
    dt: number;
    id: number;
    main: {
        feels_like: number;
        humidity: number;
        pressure: number;
        temp: number;
        temp_max: number;
        temp_min: number;
    };
    name: string;
    sys: {
        country: string;
        id: number;
        sunrise: number;
        sunset: number;
        type: number;
    };
    timezone: number;
    visibility: number;
    weather: Weather[];
    wind: {
        speed: number;
        deg: number;
    };
}

export interface Weather {
    description: string;
    icon: string;
    id: number;
    main: string;
}

export interface DeviceModel {
    temps: number;
    heating: boolean;
}

export function toUser(doc: firebase.firestore.DocumentSnapshot): User {
    return {userId: doc.id, ...doc.data()} as User;
}

export function toSettings(doc: any): Setting {
    return {userId: doc.id, ...doc.data()};
}