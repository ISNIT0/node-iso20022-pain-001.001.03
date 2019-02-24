import * as fs from 'fs';
import libxml from 'libxmljs';
import { Length, IsOptional, IsDate, IsNumber } from "class-validator";

const xsd = fs.readFileSync('./pain.001.001.03.xsd', 'utf8');
const xsdDoc = libxml.parseXmlString(xsd, { noblanks: true });

console.log('hi');



function processElement(el: libxml.Element) {
    if (el.name() === 'complexType') {
        return handleComplexType(el);
    } else {
        return null;
    }
}


function handleComplexType(el: libxml.Element) {
    debugger;

}

const processed = xsdDoc.childNodes().map(processElement).filter(a => a);

debugger;
