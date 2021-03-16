import { Skip } from './Skip';

export interface Trip {
    Id: number;
    Name: string;
    Location: string;
    Telephone: string;
    Size: string;
    Skips: Array<Skip>;
    Service?: string;
    NumOfSkips?: number;
    isCompactor?: boolean;
    isCDC?: boolean; 
    DoNum?: string;
    Date?: Date;
    PunchIn?: Date;
    PunchInText?: string;
    Ownership?: String;
    TallyCode?: String;
    NumOfSkipsByContract?: number;
    numOfSkipsCollected?: number;
    weight?: number;
    Route?:string;
    AmountCollected?:number;
}
