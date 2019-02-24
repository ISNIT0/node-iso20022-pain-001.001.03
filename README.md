# PAIN 001.001.03 Generator

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

## Argument types
See [src/types.d.ts](src/types.d.ts)

## Future Development (contribution welcome)
- [ ] More Comprehensive Types and Validation
- [ ] Better Dynamic Templating
- [ ] Support other revisions of PAIN.001.001

# License
[MIT](./LICENSE)