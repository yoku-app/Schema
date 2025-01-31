const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function findSchemaFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...findSchemaFiles(fullPath));
        } else if (item.name.endsWith('.schema.json')) {
            files.push(fullPath);
        }
    }

    return files;
}

function generateSchemaMap() {
    const schemasDir = path.join(__dirname, '../schemas');
    const schemaFiles = findSchemaFiles(schemasDir);
    const schemaMap = {};

    for (const file of schemaFiles) {
        const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (schema.title && schema.$id) {
            schemaMap[schema.title] = schema.$id;
        }
    }

    const yamlContent = yaml.dump(schemaMap);
    const outputPath = path.join(__dirname, '../dist/schema-map.yaml');
    
    // Ensure dist directory exists
    if (!fs.existsSync(path.join(__dirname, '../dist'))) {
        fs.mkdirSync(path.join(__dirname, '../dist'));
    }
    
    fs.writeFileSync(outputPath, yamlContent, 'utf8');
    console.log('Schema map generated successfully!');
}

generateSchemaMap();