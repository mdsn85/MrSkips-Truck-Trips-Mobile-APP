import { SerialNumber } from './Serial';

export interface Skip {
    Id: number;
    WasteTypex?: string;
    Serial?: SerialNumber;
    Serial2?: String;
    DO?: string;
    Weight?: number;
    Remarks?: string;
    Status?: number;
    Image?: any;
    Copy?: boolean;
    WasteType?: string;
    Reason?: string;
    SignateImg?: any;

}
