import { SurveyResponse } from '../types/survey';

export const CSV_HEADERS = [
  'Response ID',
  'Timestamp',
  '1. Full Name',
  '2. University Registration Number',
  '3. Contact Number',
  '4. Personal E-mail Address',
  '5. Gender',
  '6. Age (in completed years)',
  '7. Degree Programme',
  '8. Academic Year',
  '9. Accommodation Type',
  '10. Average Daily Smartphone Screen Time (in MINUTES per day)',
  '11. Primary Purpose of Smartphone Use',
  '12. Smartphone Use Before Sleeping (in MINUTES per night)',
  '13. Mobile Internet Connection Type',
  '14. Monthly Mobile Data Expenditure (in LKR)',
  '15. Daily Independent Study Time (in HOURS per day)',
  '16. Average Sleep Duration (in HOURS per night)',
  '17. Daily Commuting Time (in MINUTES per university day)',
];

function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains quotes, commas or newlines, quote and double up internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function generateCSVContent(responses: SurveyResponse[]): string {
  const headerLine = CSV_HEADERS.map(escapeCSVValue).join(',');

  const rows = responses.map((r) => {
    const accommodation =
      r.accommodationType === 'Other' && r.accommodationOtherText
        ? `Other: ${r.accommodationOtherText}`
        : r.accommodationType;

    const values = [
      r.id,
      r.createdAtFormatted || r.timestamp,
      r.fullName,
      r.registrationNumber,
      r.contactNumber,
      r.email,
      r.gender,
      r.age,
      r.degreeProgramme,
      r.academicYear,
      accommodation,
      r.dailyScreenTimeMinutes,
      r.primaryPurpose,
      r.bedtimeUsageMinutes,
      r.connectionType,
      r.monthlyDataSpendLKR,
      r.independentStudyHours,
      r.sleepDurationHours,
      r.commutingTimeMinutes,
    ];

    return values.map(escapeCSVValue).join(',');
  });

  return [headerLine, ...rows].join('\r\n');
}

export function downloadCSVFile(responses: SurveyResponse[], customFilename?: string): boolean {
  try {
    const csvContent = generateCSVContent(responses);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().split('T')[0];
    const filename =
      customFilename || `STA330_Smartphone_Screen_Time_Survey_Responses_${dateStr}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return false;
  }
}

export async function copyCSVToClipboard(responses: SurveyResponse[]): Promise<boolean> {
  try {
    const csvContent = generateCSVContent(responses);
    await navigator.clipboard.writeText(csvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy CSV to clipboard:', err);
    return false;
  }
}
