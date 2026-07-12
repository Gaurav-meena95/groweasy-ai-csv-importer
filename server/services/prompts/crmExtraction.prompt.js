const getExtractionPrompt = (recordsJsonString) => {
  return `You are a data extraction assistant. Your task is to analyze a list of raw CRM records in JSON format and map their fields into the standard CRM format.

For each raw record in the input list, extract the following fields:
1. created_at (String: Date-time convertible via \`new Date(created_at)\`. Try to parse the raw creation date. If missing or invalid, leave empty)
2. name (String: Lead name. Combine first and last names if separated)
3. email (String: Primary email address. If multiple exist, extract the first one, and append the rest to crm_note)
4. country_code (String: Country dial code e.g. "+91", "+1". If missing, deduce from mobile or country)
5. mobile_without_country_code (String: Mobile number excluding country dial code)
6. company (String: Company name)
7. city (String: City name)
8. state (String: State name)
9. country (String: Country name)
10. lead_owner (String: Owner of the lead)
11. crm_status (String: Only choose one of: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE". Map intelligently based on status or notes. If none fit confidently, leave empty)
12. crm_note (String: Capture remarks, follow-up notes, extra email addresses, extra phone numbers, or any info that doesn't fit other fields)
13. data_source (String: Only choose one of: "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots". If none fit confidently, leave empty)
14. possession_time (String: Property possession time, if mentioned)
15. description (String: Additional description details)

CRITICAL RULES:
- Return ONLY a valid JSON Array of Objects, where each object maps directly to the corresponding raw record and has exactly the 15 keys listed above.
- Do NOT output any markdown blocks (like \`\`\`json), explanations, or trailing text. Return raw JSON text only.
- If multiple email addresses are present, extract the first one for the "email" field, and append the remaining emails to "crm_note".
- If multiple mobile numbers are present, extract the first one for the "mobile_without_country_code" field, and append the remaining numbers to "crm_note".
- If you are not confident about a field value, or if it is missing, set it to null or empty string. Do NOT hallucinate.
- Ensure "crm_status" and "data_source" strictly use the allowed enum values.

Here are the raw records to extract:
${recordsJsonString}`;
};

module.exports = {
  getExtractionPrompt
};
