export function normalizeName(value) {
  return typeof value === 'string' ? value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US').replace(/\.$/, '') : '';
}
export function findStudent(students, input) {
  const name = normalizeName(input);
  if (!name || !Array.isArray(students)) return null;
  const matches = students.filter(student => student.active === true && normalizeName(student.name) === name);
  // Fail safely on duplicate names. Assign unique lookup names in the data source.
  if (matches.length !== 1) return null;
  return validNotionUrl(matches[0].url);
}
export function validNotionUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !(url.hostname === 'app.notion.com' || url.hostname === 'notion.so' || url.hostname.endsWith('.notion.so') || url.hostname === 'notion.site' || url.hostname.endsWith('.notion.site')) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}
