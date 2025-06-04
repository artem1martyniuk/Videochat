import fs from 'fs';
import path from 'path';
import {fileURLToPath} from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function saveFileAfterValidation(req, res, next) {
    if (!req.file) return next();

    const uploadPath = path.join(__dirname, '../files');
    const filename = `${req.file.originalname}-${Date.now()}`;
    const fullPath = path.join(uploadPath, filename);

    fs.writeFile(fullPath, req.file.buffer, (err) => {
        if (err) res.status(400).json({ errors: err });

        req.savedFile = filename;
        next();
    });
}

export default saveFileAfterValidation;