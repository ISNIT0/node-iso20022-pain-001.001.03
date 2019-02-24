import { Length, IsOptional, IsDate, IsNumber, Min, IsString, MaxLength } from 'class-validator';

declare global {
    type KVS<T> = { [key: string]: T }

    class GrpHdr {
        @IsString() MsgId?: string;
        @IsDate() CreDtTm?: Date;
        @IsNumber() NbOfTxs?: number;
        @IsNumber() CtrlSum?: number; // Consider making this mandatory
        InitgPty: PartyDefinition;
    }

    class PmtInf {
        PmtInfId?: string;
        PmtMtd: 'TRF' | 'TRA' | 'CHK';
        BtchBookg?: boolean;
        ReqdExctnDt?: Date; // Date to debit account
        Dbtr: PartyDefinition;
        DbtrAcct: { iban: string };
        DbtrAgt: { bic: string }
    }

    interface PartyDefinition {
        Nm: string;
        PstlAdr: PostalAddress;
    }

    interface PostalAddress {
        StrtNm: string;
        BldgNb: string;
        PstCd: string;
        TwnNm: string;
        Ctry: string;
    }

    type CashAccount = { iban: string } //| GenericAccount;

    type TransactionPurpose = { Cd: string /* 1-4char */ } | { Prtry: string /* Max 35char */ }

    type CdtrAgt = { bic: string /* /[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}/ */ } // | {...}

    class CashAmount {
        @IsNumber() @Min(0) Amount: number;
        @IsString() @Length(3, 3) Currency: string;
    }

    interface Transaction {
        InstrId?: string;
        EndToEndId: string;
        Amount: CashAmount;
        ChrgBr: 'SLEV' | 'SHAR' | 'CRED' | 'DEBT';
        CdtrAgt: CdtrAgt;
        Cdtr: PartyDefinition;
        CdtrAcct: CashAccount;
        Purp?: TransactionPurpose;
    }



    // TODO
    // class GenericAccount {
    //     @IsString() @Length(1, 35) Id: string;
    //     SchmeNm?: string;
    //     Issr?: string;
    //     <xs: element name = "Id" type = "Max34Text" />
    //     <xs: element maxOccurs = "1" minOccurs = "0" name = "SchmeNm" type = "AccountSchemeName1Choice" />
    //         <xs: element maxOccurs = "1" minOccurs = "0" name = "Issr" type = "Max35Text" />
    // }

    // interface BranchData {
    //     Id: string;
    //     Nm?: string;
    //     PstlAdr?: PostalAddress;
    // }

    // interface BranchAndFinancialInstitutionIdentification {
    //     // FinInstnId: FinancialInstitutionIdentification,
    //     BrnchId?: BranchData
    // }

}