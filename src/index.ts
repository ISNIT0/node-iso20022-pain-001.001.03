import * as fs from 'fs';
import libxml from 'libxmljs';
import { validate } from "class-validator";
import { isDate } from 'util';
import * as dot from 'dot';

// const generatedXml = '';

const xsd = fs.readFileSync('./pain.001.001.03.xsd', 'utf8');
// const xsdDoc = libxml.parseXml(xsd);

// const generatedXmlDoc = libxml.parseXml(generatedXml);

const templateXml = fs.readFileSync('./template.xml', 'utf8');

const template = dot.template(templateXml, { ...dot.templateSettings, strip: false });

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