# ISO20022 PAIN 001.001.03 Generator
[![Build Status](https://travis-ci.org/ISNIT0/node-iso20022-pain-001.001.03.svg?branch=master)](https://travis-ci.org/ISNIT0/node-iso20022-pain-001.001.03)
## Usage
```bash
npm i pain-001-001-03
```
```typescript
import { generateAndValidateXml } from 'pain-001-001-03';

const XMLString = await generateAndValidateXml(
    grpHdr as GrpHdr,
    pmtInf as PmtInf,
    transactions as Transaction[]
);
```

### Full Example
[src/test.ts](src/test.ts)

## Argument types
See [src/types.d.ts](src/types.d.ts)

## Future Development (contribution welcome)
- [ ] More Comprehensive Types and Validation
- [ ] Better Dynamic Templating
- [ ] Support other revisions of PAIN.001.001

# License
[MIT](./LICENSE)