import { generateAndValidateXml } from ".";

const PayingPerson = {
    Nm: 'My Co.',
    PstlAdr: {
        StrtNm: 'Hi',
        BldgNb: 'Hi',
        PstCd: 'Hi',
        TwnNm: 'Hi',
        Ctry: 'UK',
    }
}

const PersonBeingPaid = {
    Nm: 'Joe Reeve',
    PstlAdr: {
        StrtNm: 'Hi',
        BldgNb: 'Hi',
        PstCd: 'Hi',
        TwnNm: 'Hi',
        Ctry: 'UK',
    }
}

generateAndValidateXml(
    {
        MsgId: 'hi',
        CreDtTm: new Date(),
        InitgPty: PayingPerson,
    }, {
        PmtMtd: 'TRF',
        BtchBookg: true,
        Dbtr: PayingPerson,
        DbtrAcct: {
            iban: 'BE30001216371411'
        },
        DbtrAgt: {
            bic: 'DDDDBEBB'
        }
    }, [{
        EndToEndId: 'Some ID',
        Amount: {
            Amount: 40000,
            Currency: 'HUF',
        },
        ChrgBr: 'DEBT',
        CdtrAgt: { bic: 'DDDDBEBB' },
        Cdtr: PersonBeingPaid,
        CdtrAcct: { iban: 'BE30001216371411' }
    }]
).then((xmlDoc: string) => {
    console.log('Generated Document:', xmlDoc.trim());
    console.log(`Validated Successfully!`);
}, ({xmlDoc, validationErrors}) => {
    console.warn(`Generated Document:`, xmlDoc);
    console.warn(`Validation Failed:`, validationErrors);
});