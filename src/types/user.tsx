import { Timestamp } from "firebase/firestore";

export interface UserInterface{
    uid: string;
    email: string | null;
    name: string | null;
    surname: string | null;
    emailVerified: boolean;
    phoneNumber : string | null;
    photoURL : string | null;   
    userDocument?: userDocument;                             
}

export interface userDocument{
    uid: string;
    email: string | null;
    creation_date: Timestamp;
    onboardingIsCompleted: boolean;
    name: string;
    surname: string;
    photoURL : string | null;   

    //... 
                                  
}