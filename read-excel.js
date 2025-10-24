const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('C:\\Users\\jspen\\Downloads\\PennForce-INITIAL-DATA.xlsx');

// Get all sheet names
console.log('Sheet Names:', workbook.SheetNames);

// Read each sheet and display its contents
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== ${sheetName} ===`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log(`Row count: ${data.length}`);
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('First 3 rows:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
  }
});
