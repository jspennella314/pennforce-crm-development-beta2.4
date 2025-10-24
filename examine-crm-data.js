const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('C:\\Users\\jspen\\Downloads\\PennForce-INITIAL-DATA.xlsx');
const worksheet = workbook.Sheets['CRM'];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`Total contacts: ${data.length}\n`);

// Show all contacts
data.forEach((contact, index) => {
  console.log(`${index + 1}. Name: ${contact.Name || 'N/A'}`);
  console.log(`   Phone: ${contact.number || 'N/A'}`);
  console.log(`   Email: ${contact.Email || 'N/A'}`);
  console.log('');
});

// Count how many have each field
const withEmail = data.filter(c => c.Email).length;
const withPhone = data.filter(c => c.number).length;

console.log(`\nSummary:`);
console.log(`- Contacts with email: ${withEmail}/${data.length}`);
console.log(`- Contacts with phone: ${withPhone}/${data.length}`);
