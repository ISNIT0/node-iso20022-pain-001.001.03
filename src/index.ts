import * as fs from 'fs';
import libxml from 'libxmljs';
import { Length, IsOptional, IsDate, IsNumber, Min, IsString, MaxLength, validate } from "class-validator";
import { isDate } from 'util';
import * as dot from 'dot';

// const generatedXml = '';

const xsd = fs.readFileSync('./pain.001.001.03.xsd', 'utf8');
// const xsdDoc = libxml.parseXml(xsd);

// const generatedXmlDoc = libxml.parseXml(generatedXml);

const templateXml = fs.readFileSync('./template.xml', 'utf8');

const template = dot.template(templateXml, { ...dot.templateSettings, strip: false });


type KVS<T> = { [key: string]: T }

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

interface BranchData {
    Id: string;
    Nm?: string;
    PstlAdr?: PostalAddress;
}

interface BranchAndFinancialInstitutionIdentification {
    // FinInstnId: FinancialInstitutionIdentification,
    BrnchId?: BranchData
}

class GrpHdr {
    @IsString() MsgId?: string;
    @IsDate() CreDtTm?: Date;
    @IsNumber() NbOfTxs?: number;
    @IsNumber() CtrlSum?: number; // Consider making this mandatory
    InitgPty: PartyDefinition;
};

class PmtInf {
    PmtInfId?: string;
    PmtMtd: 'TRF' | 'TRA' | 'CHK';
    BtchBookg?: boolean;
    ReqdExctnDt?: Date; // Date to debit account
    Dbtr: PartyDefinition;
    DbtrAcct: { iban: string };
    DbtrAgt: { bic: string }
}

function readFilePromise(path: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

export async function generateAndValidateXml(
    grpHdr: GrpHdr,
    pmtInf: PmtInf,
    transactions: Transaction[]
) {
    grpHdr.CreDtTm = grpHdr.CreDtTm || new Date()
    grpHdr.CtrlSum = grpHdr.CtrlSum || transactions.reduce((acc, t) => acc + t.Amount.Amount, 0)
    grpHdr.NbOfTxs = grpHdr.NbOfTxs || transactions.length

    pmtInf.ReqdExctnDt = pmtInf.ReqdExctnDt || new Date()

    await validate(grpHdr);
    await validate(pmtInf);

    const xmlDoc = template({
        GrpHdr: treatData(grpHdr),
        PmtInf: treatData(pmtInf),
        transactions: treatData(transactions)
    });

    const xsd = await readFilePromise('./pain.001.001.03.xsd');
    const xsdDoc = libxml.parseXml(xsd);

    const generatedXmlDoc = libxml.parseXmlString(xmlDoc);

    const validation = generatedXmlDoc.validate(xsdDoc);

    if (!validation) {
        return Promise.reject({ validationErrors: generatedXmlDoc.validationErrors, xmlDoc });
    } else {
        return xmlDoc;
    }
}

function isLeaf(value: any) {
    if (typeof value !== 'object') {
        return true;
    } else {
        const isSpecial = isDate(value) // || ...
        if (isSpecial) return true;
        else return false;
    }
}

function getNormalisedValue(value: any, key: string) {
    if (isDate(value)) {
        value = value.toISOString()
        if (!key.includes('DtTm')) {
            value = value.split('T')[0]
        }
    }

    return value;
}

function treatData(data: KVS<any> | any[]): any {
    if (Array.isArray(data)) {
        return data.map(treatData);
    } else {
        return Object.keys(data).reduce((acc: any, key) => {
            if (isLeaf(data[key])) {
                acc[key] = getNormalisedValue(data[key], key);
            } else {
                const nextVal = data[key]
                if (Array.isArray(nextVal)) {
                    acc[key] = nextVal.map(treatData)
                } else {
                    acc[key] = treatData(data[key])
                }
            }
            return acc;
        }, {});
    }
}



// export function generateAndValidate(args: PaymentArgs) {

//     const doc = new libxml.Document();
//     const CstmrCdtTrfInitn = doc.node('Document')
//         .attr({ 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance', 'xmlns': 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03' })
//         .node('CstmrCdtTrfInitn');

//     const GrpHdr = CstmrCdtTrfInitn
//         .node('GrpHdr');

//     const PmtInf = CstmrCdtTrfInitn
//         .node('PmtInf');

//     return doc.toString();

// }

// class GenericAccount {
//     @IsString() @Length(1, 35) Id: string;
//     SchmeNm?: string;
//     Issr?: string;
//     <xs: element name = "Id" type = "Max34Text" />
//     <xs: element maxOccurs = "1" minOccurs = "0" name = "SchmeNm" type = "AccountSchemeName1Choice" />
//         <xs: element maxOccurs = "1" minOccurs = "0" name = "Issr" type = "Max35Text" />
// }

type CashAccount = { iban: string } //| GenericAccount;

type TransactionPurpose = { Cd: string /* 1-4char */ } | { Prtry: string /* Max 35char */ }

type CdtrAgt = { bic: string /* /[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}/ */ } // | {...}

class CashAmount {
    @IsNumber() @Min(0) Amount: number;
    @IsString() @Length(3, 3) Currency: string;
};

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

// <PmtId>
//     <InstrId>ABC/090928/CCT001/01</InstrId>
//     <EndToEndId>ABC/4562/2009-09-08</EndToEndId>
// </PmtId>
// <Amt>
//     <InstdAmt Ccy="JPY">10000000</InstdAmt>
// </Amt>
// <ChrgBr>SHAR</ChrgBr>
// <CdtrAgt>
//     <FinInstnId>
//         <BIC>AAAAGB2L</BIC>
//     </FinInstnId>
// </CdtrAgt>
// <Cdtr>
//     <Nm>DEF Electronics</Nm>
//     <PstlAdr>
//         <AdrLine>Corn Exchange 5th Floor</AdrLine>
//         <AdrLine>Mark Lane 55</AdrLine>
//         <AdrLine>EC3R7NE London</AdrLine>
//         <AdrLine>GB</AdrLine>
//     </PstlAdr>
// </Cdtr>
// <CdtrAcct>
//     <Id>
//         <Othr>
//             <Id>23683707994125</Id>
//         </Othr>
//     </Id>
// </CdtrAcct>
// <Purp>
//     <Cd>CINV</Cd>
// </Purp>
// <RmtInf>
//     <Strd>
//         <RfrdDocInf>
//             <Nb>4562</Nb>
//             <RltdDt>2009-09-08</RltdDt>
//         </RfrdDocInf>
//     </Strd>
// </RmtInf>